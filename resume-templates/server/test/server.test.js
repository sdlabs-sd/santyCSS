import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'rt-test-'));
process.env.RAZORPAY_KEY_ID = 'rzp_test_x';
process.env.RAZORPAY_KEY_SECRET = 'secret123';
process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec';

const { createZip } = await import('../lib/zip.js');
const { sanitizeResume } = await import('../lib/catalog.js');
const { verifyCheckoutSignature, verifyWebhookSignature } = await import('../lib/payments.js');
const { buildPackage, templateFiles } = await import('../lib/packager.js');
const { readSession, sessionCookie } = await import('../lib/session.js');

test('zip output is readable by unzip', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rt-zip-'));
  const file = path.join(dir, 'a.zip');
  fs.writeFileSync(file, createZip([{ name: 'x/hello.txt', data: 'hello world' }, { name: 'x/ü.json', data: '{"a":1}' }]));
  const out = execFileSync('unzip', ['-p', file, 'x/hello.txt']).toString();
  assert.equal(out, 'hello world');
});

test('sanitiser bounds strings, drops unknown keys and non-objects', () => {
  const r = sanitizeResume({
    basics: { name: 'x'.repeat(500), evil: '<script>' },
    skills: [{ name: 'Go', level: 900 }, 'nope'],
    experience: [{ role: 'Dev', highlights: ['a', 7, { b: 1 }] }],
    hacker: 1,
  });
  assert.equal(r.basics.name.length, 120);
  assert.equal(r.basics.evil, undefined);
  assert.equal(r.hacker, undefined);
  assert.deepEqual(r.skills, [{ name: 'Go', level: 100 }]);
  assert.deepEqual(r.experience[0].highlights, ['a', '7']);
});

test('razorpay checkout + webhook signatures', () => {
  const sig = crypto.createHmac('sha256', 'secret123').update('order_1|pay_1').digest('hex');
  assert.ok(verifyCheckoutSignature({ orderId: 'order_1', paymentId: 'pay_1', signature: sig }));
  assert.ok(!verifyCheckoutSignature({ orderId: 'order_1', paymentId: 'pay_2', signature: sig }));
  assert.ok(!verifyCheckoutSignature({ orderId: 'order_mock_1', paymentId: 'x', signature: 'mock' }), 'mock must not pass with live keys');
  const body = '{"event":"order.paid"}';
  assert.ok(verifyWebhookSignature(body, crypto.createHmac('sha256', 'whsec').update(body).digest('hex')));
  assert.ok(!verifyWebhookSignature(body, 'bad'));
});

test('session cookie round-trips and rejects tampering', () => {
  const value = sessionCookie({ email: 'a@gmail.com', name: 'A' }).split(';')[0].split('=')[1];
  assert.equal(readSession({ headers: { cookie: 'sr_session=' + value } }).email, 'a@gmail.com');
  const [p, s] = value.split('.');
  const forged = Buffer.from(JSON.stringify({ email: 'b@gmail.com', exp: Date.now() + 1e9 })).toString('base64url');
  assert.equal(readSession({ headers: { cookie: 'sr_session=' + forged + '.' + s } }), null);
  assert.equal(readSession({ headers: { cookie: 'sr_session=' + p + '.x' } }), null);
});

for (const fw of ['react', 'vue']) {
  test(`packager builds a single-template ${fw} project`, { skip: !fs.existsSync(new URL(`../../${fw}/src/templates/index.js`, import.meta.url)) }, () => {
    const ids = Object.keys(templateFiles(fw));
    assert.equal(ids.length, 12);
    const { filename, buffer } = buildPackage('counsel', fw);
    assert.equal(filename, `counsel-resume-${fw}.zip`);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rt-pkg-'));
    fs.writeFileSync(path.join(dir, 'p.zip'), buffer);
    const list = execFileSync('unzip', ['-Z1', path.join(dir, 'p.zip')]).toString();
    assert.match(list, /LICENSE\.txt/);
    assert.match(list, /src\/santy\.css/);
    assert.doesNotMatch(list, /Commit\./, 'other templates must not ship');
    const css = execFileSync('unzip', ['-p', path.join(dir, 'p.zip'), `counsel-resume-${fw}/src/santy.css`]).toString();
    assert.ok(css.includes('.font-serif'), 'purged css keeps used classes');
    assert.ok(css.length < 400000, 'css is purged');
  });
}
