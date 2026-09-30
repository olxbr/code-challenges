'use strict';

const http = require('http');

const config = {
  port: parseInt(process.env.PORT || '8787', 10),
  errorRate: parseFloat(process.env.ERROR_RATE ?? '0.2'),
  rateLimitRps: parseInt(process.env.RATE_LIMIT_RPS || '5', 10),
  latencyMinMs: parseInt(process.env.LATENCY_MIN_MS || '100', 10),
  latencyMaxMs: parseInt(process.env.LATENCY_MAX_MS || '2000', 10),
};

const PRICE_RANGES = {
  eletronicos: [10, 50000],
  moveis: [20, 30000],
  veiculos: [1000, 500000],
  imoveis: [10000, 5000000],
  esportes: [5, 20000],
  colecionaveis: [1, 100000],
};

const CONTACT_PATTERNS = [
  /whats\s*app/i,
  /\bzap\b/i,
  /telegram/i,
  /\b\d{2}\s?9?\d{4}[\s.-]?\d{4}\b/, // telefone BR
];
const PROHIBITED_PATTERNS = [
  /\barmas?\b/i,
  /muni[cç][aã]o/i,
  /cigarros?/i,
  /medicamentos?/i,
];

function validate(body) {
  const errors = [];
  if (typeof body.title !== 'string' || body.title.trim() === '') errors.push('title is required');
  if (typeof body.description !== 'string' || body.description.trim() === '') errors.push('description is required');
  if (typeof body.price !== 'number' || Number.isNaN(body.price)) errors.push('price must be a number');
  if (typeof body.category !== 'string' || !(body.category in PRICE_RANGES)) {
    errors.push(`category must be one of: ${Object.keys(PRICE_RANGES).join(', ')}`);
  }
  return errors;
}

function moderate(ad) {
  const text = `${ad.title} ${ad.description}`;
  if (CONTACT_PATTERNS.some((r) => r.test(text))) {
    return { status: 'rejected', rejection_reason: 'contact_info_not_allowed' };
  }
  if (PROHIBITED_PATTERNS.some((r) => r.test(text))) {
    return { status: 'rejected', rejection_reason: 'prohibited_item' };
  }
  const [min, max] = PRICE_RANGES[ad.category];
  if (ad.price < min || ad.price > max) {
    return { status: 'rejected', rejection_reason: 'price_out_of_range' };
  }
  return { status: 'approved' };
}

const requestTimestamps = [];
function isRateLimited() {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > 1000) {
    requestTimestamps.shift();
  }
  requestTimestamps.push(now);
  return requestTimestamps.length > config.rateLimitRps;
}

function randomLatency() {
  const { latencyMinMs, latencyMaxMs } = config;
  return latencyMinMs + Math.floor(Math.random() * Math.max(1, latencyMaxMs - latencyMinMs));
}

function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.method !== 'POST' || req.url !== '/v1/moderation/check') {
    return sendJson(res, 404, { error: 'not_found' });
  }

  const force = req.headers['x-mock-force'];

  if (force === 'rate-limit' || (!force && isRateLimited())) {
    return sendJson(res, 429, { error: 'too_many_requests' }, { 'Retry-After': '1' });
  }

  if (force === 'error' || (!force && Math.random() < config.errorRate)) {
    return sendJson(res, 500, { error: 'internal_error' });
  }

  let raw = '';
  req.on('data', (chunk) => { raw += chunk; });
  req.on('end', () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { error: 'invalid_json' });
    }

    const errors = validate(body);
    if (errors.length > 0) {
      return sendJson(res, 400, { error: 'validation_error', details: errors });
    }

    setTimeout(() => sendJson(res, 200, moderate(body)), randomLatency());
  });
});

server.listen(config.port, () => {
  console.log(`[moderation-mock] listening on :${config.port}`);
});
