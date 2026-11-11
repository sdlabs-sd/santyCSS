/**
 * Razorpay payments — one gateway for both prices:
 *   hosting  ₹999 / year (INR)   premium template  $10 one-time (USD)
 * (USD needs international payments enabled on the Razorpay account.)
 *
 * Flow: server creates an order → Razorpay Checkout collects payment in the
 * browser → browser posts {order_id, payment_id, signature} back → server checks
 * the HMAC and fulfils. The webhook fulfils too (idempotently) in case the tab
 * closes before the callback runs.
 *
 * Mock mode (no keys, NODE_ENV≠production) lets you test the whole flow
 * locally; it can never be enabled in production.
 */
import crypto from 'node:crypto';
import { config, paymentMode } from './config.js';
import { httpError } from './google.js';

const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex');
const safeEqual = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length
  && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function createGatewayOrder({ amount, currency, receipt, notes }) {
  if (paymentMode === 'mock') return { id: 'order_mock_' + crypto.randomBytes(8).toString('hex'), amount, currency };
  if (paymentMode !== 'razorpay') throw httpError(503, 'Payments are not configured.');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(config.razorpay.keyId + ':' + config.razorpay.keySecret).toString('base64'),
    },
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(502, 'Payment gateway error: ' + ((body.error && body.error.description) || res.status));
  return body;
}

/** Checkout callback signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  if (paymentMode === 'mock') return orderId.startsWith('order_mock_') && signature === 'mock';
  if (paymentMode !== 'razorpay') return false;
  return safeEqual(hmac(config.razorpay.keySecret, orderId + '|' + paymentId), signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) return false;
  return safeEqual(hmac(config.razorpay.webhookSecret, rawBody), signature);
}
