// VibeCast smoke test
// Run with: npm test
// Tests the health check, the x402 manifest, and the free-tier path.

const BASE = process.env.BASE_URL || 'http://localhost:3000';

let pass = 0;
let fail = 0;

function assert(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name} ${extra}`);
  }
}

async function test(name, fn) {
  console.log(`\n${name}`);
  try {
    await fn();
  } catch (err) {
    fail++;
    console.log(`  ✗ threw: ${err.message}`);
  }
}

await test('GET /health', async () => {
  const res = await fetch(`${BASE}/health`);
  assert('status 200', res.status === 200);
  const body = await res.json();
  assert('service is vibecast', body.service === 'vibecast');
  assert('status is ok', body.status === 'ok');
});

await test('GET /.well-known/x402', async () => {
  const res = await fetch(`${BASE}/.well-known/x402`);
  assert('status 200', res.status === 200);
  const body = await res.json();
  assert('x402Version is 2', body.x402Version === 2);
  assert('has accepts array', Array.isArray(body.accepts) && body.accepts.length > 0);
  const accept = body.accepts[0];
  assert('network is eip155:196', accept.network === 'eip155:196');
  assert('scheme is exact', accept.scheme === 'exact');
  // payTo is only set once RECEIVE_ADDRESS is in .env — check it exists if configured
  if (accept.payTo) {
    assert('payTo is a valid 0x address', accept.payTo.startsWith('0x'));
  } else {
    console.log('  ⚠ payTo not set (RECEIVE_ADDRESS missing in .env) — set this before deploying');
  }
});

await test('GET / returns landing page', async () => {
  const res = await fetch(`${BASE}/`);
  assert('status 200', res.status === 200);
  const html = await res.text();
  assert('mentions VibeCast', html.includes('VibeCast'));
  assert('has voice pills', html.includes('punchy-founder'));
});

await test('POST /api/thread rejects empty body', async () => {
  const res = await fetch(`${BASE}/api/thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert('status 400', res.status === 400);
  const body = await res.json();
  assert('error is missing_url', body.error === 'missing_url');
});

await test('POST /api/thread rejects non-YouTube URL', async () => {
  const res = await fetch(`${BASE}/api/thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com/article' }),
  });
  assert('status 400', res.status === 400);
  const body = await res.json();
  assert('error is invalid_url', body.error === 'invalid_url');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
