'use strict';

const http = require('http');
const path = require('path');
const crypto = require('crypto');

const SEED = require(path.join(__dirname, 'seed', 'ads.json'));

const CATEGORY_IDS = SEED.categories.map((c) => c.id);
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;
const MAX_BODY_BYTES = 100 * 1024;

function num(value, fallback) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function loadConfig(env = process.env) {
  return {
    port: parseInt(env.PORT || '8788', 10),
    // Probabilidade (0 a 1) de uma chamada de negócio responder 500.
    errorRate: num(env.ERROR_RATE, 0.1),
    // Probabilidade (0 a 1) de uma chamada de negócio demorar de 5 a 10 segundos.
    slowResponseRate: num(env.SLOW_RESPONSE_RATE, 0.15),
    latencyMinMs: num(env.LATENCY_MIN_MS, 100),
    latencyMaxMs: num(env.LATENCY_MAX_MS, 600),
    slowLatencyMinMs: num(env.SLOW_LATENCY_MIN_MS, 5000),
    slowLatencyMaxMs: num(env.SLOW_LATENCY_MAX_MS, 10000),
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '600',
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(body));
}

function normalize(text) {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function between(min, max) {
  return min + Math.floor(Math.random() * Math.max(1, max - min));
}

function pickLatency(config) {
  if (Math.random() < config.slowResponseRate) {
    return between(config.slowLatencyMinMs, config.slowLatencyMaxMs);
  }
  return between(config.latencyMinMs, config.latencyMaxMs);
}

function parsePositiveInt(value, name, details) {
  if (!/^\d+$/.test(value) || parseInt(value, 10) < 1) {
    details.push({ field: name, message: `${name} must be a positive integer` });
    return null;
  }
  return parseInt(value, 10);
}

function listAds(ads, searchParams) {
  const details = [];
  const q = (searchParams.get('q') || '').trim();
  const category = searchParams.get('category') || '';

  if (category && !CATEGORY_IDS.includes(category)) {
    details.push({ field: 'category', message: `category must be one of: ${CATEGORY_IDS.join(', ')}` });
  }

  let page = 1;
  if (searchParams.has('page')) page = parsePositiveInt(searchParams.get('page'), 'page', details);

  let pageSize = DEFAULT_PAGE_SIZE;
  if (searchParams.has('pageSize')) {
    pageSize = parsePositiveInt(searchParams.get('pageSize'), 'pageSize', details);
    if (pageSize !== null && pageSize > MAX_PAGE_SIZE) {
      details.push({ field: 'pageSize', message: `pageSize must be at most ${MAX_PAGE_SIZE}` });
    }
  }

  if (details.length > 0) return { status: 400, body: { error: 'validation_error', details } };

  const needle = normalize(q);
  const filtered = ads.filter((ad) => {
    if (category && ad.category !== category) return false;
    if (needle && !normalize(`${ad.title} ${ad.description}`).includes(needle)) return false;
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;

  return {
    status: 200,
    body: {
      data: filtered.slice(start, start + pageSize),
      pagination: { page, pageSize, totalItems, totalPages },
    },
  };
}

function validateNewAd(body) {
  const details = [];
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return [{ field: 'body', message: 'body must be a JSON object' }];
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 10 || title.length > 100) {
    details.push({ field: 'title', message: 'title must have between 10 and 100 characters' });
  }

  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (description === '') {
    details.push({ field: 'description', message: 'description is required' });
  } else if (description.length > 2000) {
    details.push({ field: 'description', message: 'description must have at most 2000 characters' });
  }

  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) {
    details.push({ field: 'price', message: 'price must be a number greater than zero' });
  }

  if (typeof body.category !== 'string' || !CATEGORY_IDS.includes(body.category)) {
    details.push({ field: 'category', message: `category must be one of: ${CATEGORY_IDS.join(', ')}` });
  }

  let validImage = false;
  if (typeof body.imageUrl === 'string') {
    try {
      const url = new URL(body.imageUrl);
      validImage = url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      validImage = false;
    }
  }
  if (!validImage) {
    details.push({ field: 'imageUrl', message: 'imageUrl must be a valid http(s) URL' });
  }

  return details;
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    let tooLarge = false;
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > MAX_BODY_BYTES) {
        tooLarge = true;
        req.destroy();
      }
    });
    req.on('end', () => resolve({ raw, tooLarge }));
    req.on('error', () => resolve({ raw: '', tooLarge }));
  });
}

function createServer(config = loadConfig()) {
  // Estado em memória por instância: reiniciar o servidor restaura o seed.
  const ads = SEED.ads.map((ad) => ({ ...ad }));
  const byNewest = () => [...ads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      return res.end();
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { status: 'ok' });
    }

    const isList = req.method === 'GET' && url.pathname === '/v1/ads';
    const isCreate = req.method === 'POST' && url.pathname === '/v1/ads';
    if (!isList && !isCreate) {
      return sendJson(res, 404, { error: 'not_found' });
    }

    // Simula variação de latência: algumas chamadas levam de 5 a 10 s.
    // O corpo é lido antes do atraso para não deixar o socket pendurado.
    const body = isCreate ? await readBody(req) : null;
    await new Promise((resolve) => setTimeout(resolve, pickLatency(config)));

    // Simula disponibilidade intermitente. A resposta ocorre antes de qualquer
    // escrita, então uma criação que recebe 500 nunca é persistida.
    if (Math.random() < config.errorRate) {
      return sendJson(res, 500, { error: 'internal_error' });
    }

    if (isList) {
      const { status, body: payload } = listAds(byNewest(), url.searchParams);
      return sendJson(res, status, payload);
    }

    if (body.tooLarge) return sendJson(res, 413, { error: 'payload_too_large' });

    let parsed;
    try {
      parsed = JSON.parse(body.raw);
    } catch {
      return sendJson(res, 400, { error: 'invalid_json' });
    }

    const details = validateNewAd(parsed);
    if (details.length > 0) {
      return sendJson(res, 400, { error: 'validation_error', details });
    }

    const ad = {
      id: `ad-${crypto.randomUUID()}`,
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      price: parsed.price,
      category: parsed.category,
      imageUrl: parsed.imageUrl,
      location: null,
      createdAt: new Date().toISOString(),
    };
    ads.push(ad);
    return sendJson(res, 201, ad);
  });
}

if (require.main === module) {
  const config = loadConfig();
  createServer(config).listen(config.port, () => {
    console.log(`[ads-mock] listening on http://localhost:${config.port}`);
  });
}

module.exports = { createServer, loadConfig };
