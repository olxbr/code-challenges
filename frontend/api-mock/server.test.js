'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer, loadConfig } = require('./server');

const FAST = {
  errorRate: 0,
  slowResponseRate: 0,
  latencyMinMs: 0,
  latencyMaxMs: 1,
  slowLatencyMinMs: 0,
  slowLatencyMaxMs: 1,
};

async function start(overrides = {}) {
  const server = createServer({ port: 0, ...FAST, ...overrides });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base, stop: () => new Promise((resolve) => server.close(resolve)) };
}

const validAd = {
  title: 'Mesa de escritório compacta',
  description: 'Mesa de madeira em bom estado.',
  price: 350,
  category: 'casa-decoracao',
  imageUrl: 'https://example.com/mesa.jpg',
};

const post = (base, body) =>
  fetch(`${base}/v1/ads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

let ctx;
before(async () => { ctx = await start(); });
after(() => ctx.stop());

test('loadConfig usa os padrões documentados', () => {
  const config = loadConfig({});
  assert.equal(config.port, 8788);
  assert.equal(config.errorRate, 0.1);
  assert.equal(config.slowResponseRate, 0.15);
  assert.equal(config.slowLatencyMinMs, 5000);
  assert.equal(config.slowLatencyMaxMs, 10000);
});

test('loadConfig lê variáveis de ambiente', () => {
  const config = loadConfig({ PORT: '9000', ERROR_RATE: '0', SLOW_RESPONSE_RATE: '1' });
  assert.equal(config.port, 9000);
  assert.equal(config.errorRate, 0);
  assert.equal(config.slowResponseRate, 1);
});

test('GET /health responde ok com CORS', async () => {
  const res = await fetch(`${ctx.base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});

test('OPTIONS responde ao preflight de CORS', async () => {
  const res = await fetch(`${ctx.base}/v1/ads`, { method: 'OPTIONS' });
  assert.equal(res.status, 204);
  assert.match(res.headers.get('access-control-allow-methods'), /POST/);
  assert.match(res.headers.get('access-control-allow-headers'), /Content-Type/);
});

test('rota desconhecida responde 404', async () => {
  const res = await fetch(`${ctx.base}/v1/unknown`);
  assert.equal(res.status, 404);
});

test('GET /v1/ads lista com paginação padrão', async () => {
  const res = await fetch(`${ctx.base}/v1/ads`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.length, 12);
  assert.equal(body.pagination.page, 1);
  assert.equal(body.pagination.pageSize, 12);
  assert.equal(body.pagination.totalItems, 35);
  assert.equal(body.pagination.totalPages, 3);
});

test('GET /v1/ads pagina corretamente a última página', async () => {
  const body = await (await fetch(`${ctx.base}/v1/ads?page=3`)).json();
  assert.equal(body.data.length, 11);
});

test('GET /v1/ads filtra por categoria', async () => {
  const body = await (await fetch(`${ctx.base}/v1/ads?category=moda&pageSize=50`)).json();
  assert.equal(body.pagination.totalItems, 7);
  assert.ok(body.data.every((ad) => ad.category === 'moda'));
});

test('GET /v1/ads busca por título sem diferenciar caixa', async () => {
  const body = await (await fetch(`${ctx.base}/v1/ads?q=BICICLETA`)).json();
  assert.ok(body.data.length >= 1);
  assert.ok(body.data.every((ad) => /bicicleta/i.test(`${ad.title} ${ad.description}`)));
});

test('GET /v1/ads busca por descrição e ignora acentos', async () => {
  const body = await (await fetch(`${ctx.base}/v1/ads?q=ruido`)).json();
  assert.ok(body.data.some((ad) => ad.description.includes('ruído')));
});

test('GET /v1/ads combina busca e categoria', async () => {
  const body = await (await fetch(`${ctx.base}/v1/ads?q=bicicleta&category=esportes`)).json();
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].category, 'esportes');
});

test('GET /v1/ads sem resultados devolve lista vazia válida', async () => {
  const res = await fetch(`${ctx.base}/v1/ads?q=camera-analogica-inexistente`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body.data, []);
  assert.equal(body.pagination.totalItems, 0);
  assert.equal(body.pagination.totalPages, 0);
});

test('GET /v1/ads com página além do fim devolve lista vazia', async () => {
  const res = await fetch(`${ctx.base}/v1/ads?page=99`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body.data, []);
  assert.equal(body.pagination.totalPages, 3);
});

test('GET /v1/ads rejeita parâmetros inválidos', async () => {
  for (const qs of ['page=0', 'page=abc', 'pageSize=51', 'pageSize=0', 'category=nope']) {
    const res = await fetch(`${ctx.base}/v1/ads?${qs}`);
    assert.equal(res.status, 400, qs);
    assert.equal((await res.json()).error, 'validation_error', qs);
  }
});

test('POST /v1/ads cria anúncio e o expõe na listagem', async () => {
  const local = await start();
  try {
    const res = await post(local.base, validAd);
    const created = await res.json();
    assert.equal(res.status, 201);
    assert.match(created.id, /^ad-/);
    assert.equal(created.title, validAd.title);
    assert.ok(!Number.isNaN(Date.parse(created.createdAt)));

    const list = await (await fetch(`${local.base}/v1/ads`)).json();
    assert.equal(list.pagination.totalItems, 36);
    assert.equal(list.data[0].id, created.id);
  } finally {
    await local.stop();
  }
});

test('POST /v1/ads valida cada campo', async () => {
  const cases = {
    title: { ...validAd, title: 'Curto' },
    description: { ...validAd, description: '   ' },
    price: { ...validAd, price: 0 },
    category: { ...validAd, category: 'nope' },
    imageUrl: { ...validAd, imageUrl: 'not-a-url' },
  };
  for (const [field, payload] of Object.entries(cases)) {
    const res = await post(ctx.base, payload);
    const body = await res.json();
    assert.equal(res.status, 400, field);
    assert.ok(body.details.some((d) => d.field === field), field);
  }
});

test('POST /v1/ads rejeita título acima de 100 caracteres e preço textual', async () => {
  const long = await post(ctx.base, { ...validAd, title: 'x'.repeat(101) });
  assert.equal(long.status, 400);
  const text = await post(ctx.base, { ...validAd, price: '350' });
  assert.equal(text.status, 400);
});

test('POST /v1/ads rejeita JSON inválido', async () => {
  const res = await post(ctx.base, '{not json');
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'invalid_json');
});

test('ERROR_RATE=1 responde 500 nas rotas de negócio, mas não no health', async () => {
  const local = await start({ errorRate: 1 });
  try {
    const list = await fetch(`${local.base}/v1/ads`);
    assert.equal(list.status, 500);
    assert.deepEqual(await list.json(), { error: 'internal_error' });
    assert.equal((await post(local.base, validAd)).status, 500);
    assert.equal((await fetch(`${local.base}/health`)).status, 200);
  } finally {
    await local.stop();
  }
});

test('500 em criação não persiste o anúncio', async () => {
  const config = { port: 0, ...FAST, errorRate: 1 };
  const server = createServer(config);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await post(base, validAd)).status, 500);
    config.errorRate = 0; // a mesma instância passa a responder normalmente
    const body = await (await fetch(`${base}/v1/ads?pageSize=50`)).json();
    assert.equal(body.pagination.totalItems, 35);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('SLOW_RESPONSE_RATE=1 aplica a latência lenta; health continua imediato', async () => {
  const local = await start({ slowResponseRate: 1, slowLatencyMinMs: 300, slowLatencyMaxMs: 400 });
  try {
    const t0 = Date.now();
    await fetch(`${local.base}/v1/ads`);
    assert.ok(Date.now() - t0 >= 280, 'lista deveria demorar');

    const t1 = Date.now();
    await fetch(`${local.base}/health`);
    assert.ok(Date.now() - t1 < 200, 'health deveria ser imediato');
  } finally {
    await local.stop();
  }
});

test('reiniciar o servidor restaura apenas o seed', async () => {
  const first = await start();
  await post(first.base, validAd);
  await first.stop();
  const second = await start();
  try {
    const body = await (await fetch(`${second.base}/v1/ads`)).json();
    assert.equal(body.pagination.totalItems, 35);
  } finally {
    await second.stop();
  }
});
