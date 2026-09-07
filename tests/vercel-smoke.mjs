import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3107';
const home = await fetch(base);
assert.equal(home.status, 200);
assert.match(await home.text(), /ADRENALINE/i);
const contentResponse = await fetch(`${base}/api/content`);
assert.equal(contentResponse.status, 200);
const content = await contentResponse.json();
assert.ok(content.home && Array.isArray(content.coaches));
const images = [...new Set(JSON.stringify(content).match(/\/migrated\/[^"\\\s]+/g) || [])];
for (const path of images) {
  const image = await fetch(`${base}${path}`);
  assert.equal(image.status, 200);
  assert.ok((await image.arrayBuffer()).byteLength > 100);
}
assert.equal((await fetch(`${base}/login`)).status, 200);
for (const path of ['/register', '/forgot-password', '/auth/error']) {
  assert.equal((await fetch(`${base}${path}`)).status, 200);
}
const reset = await fetch(`${base}/reset-password`, { redirect: 'manual' });
assert.equal(reset.status, 307);
assert.match(reset.headers.get('location'), /\/forgot-password$/);
const callback = await fetch(`${base}/auth/callback?next=https://example.com`, { redirect: 'manual' });
assert.equal(callback.status, 307);
assert.equal(new URL(callback.headers.get('location')).pathname, '/auth/error');
assert.equal(new URL(callback.headers.get('location')).origin, new URL(base).origin);
const admin = await fetch(`${base}/admin`, { redirect: 'manual' });
assert.equal(admin.status, 307);
assert.match(admin.headers.get('location'), /\/login$/);
for (const path of ['/api/admin/content', '/api/admin/upload']) {
  const denied = await fetch(`${base}${path}`, {
    method: path.endsWith('upload') ? 'POST' : 'GET',
    headers: { 'oai-authenticated-user-email': 'javkhlanbaataru@gmail.com' },
  });
  assert.equal(denied.status, 403);
}
const deniedWrite = await fetch(`${base}/api/admin/content`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' });
assert.equal(deniedWrite.status, 403);
console.log(`PASS: home, content, ${images.length} migrated images, login, admin redirect, forged-header and write rejection`);
