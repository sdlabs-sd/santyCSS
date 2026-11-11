/* Shared client for the marketplace + account pages: API, Google sign-in,
   Razorpay checkout and small UI helpers. No framework, no build step. */

export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status });
  return body;
}

let configP, meP;
export const getConfig = () => (configP ||= api('/api/config'));
export const getMe = (fresh) => (fresh || !meP ? (meP = api('/api/me')) : meP);

export function toast(message, tone = 'dark') {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className = 'position-fixed pin-bottom-24 pin-left-24 layer-50 max-width-420 add-padding-x-20 add-padding-y-12 round-corners-12 add-shadow-xl set-text-14 text-semibold animate-fade-in ' +
    (tone === 'error' ? 'background-red-600 color-white' : tone === 'success' ? 'background-emerald-600 color-white' : 'background-slate-900 color-white');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = resolve; s.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

/** Renders "Sign in with Google" (or a dev email form) into `el`; resolves with the user. */
export async function renderSignIn(el) {
  const cfg = await getConfig();
  return new Promise(async (resolve) => {
    const done = async (user) => { await getMe(true); resolve(user); };
    if (cfg.googleClientId) {
      await loadScript('https://accounts.google.com/gsi/client');
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: async ({ credential }) => {
          try { const { user } = await api('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }); done(user); }
          catch (e) { toast(e.message, 'error'); }
        },
      });
      el.innerHTML = '';
      window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left' });
    } else if (cfg.devLogin) {
      el.innerHTML = `
        <form class="make-flex gap-8 flex-wrap">
          <input name="email" type="email" required placeholder="you@gmail.com" class="flex-1 min-width-180 add-padding-x-14 add-padding-y-10 round-corners-10 add-border-1 border-color-slate-300 set-text-14 font-sans" />
          <button class="add-padding-x-16 add-padding-y-10 round-corners-10 background-slate-900 color-white set-text-14 text-bold add-border-0 cursor-pointer">Dev sign-in</button>
        </form>
        <p class="set-text-12 color-amber-700 add-margin-top-8">Development mode — set GOOGLE_CLIENT_ID to enable Google sign-in.</p>`;
      el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try { const { user } = await api('/api/auth/dev', { method: 'POST', body: JSON.stringify({ email: e.target.email.value }) }); done(user); }
        catch (err) { toast(err.message, 'error'); }
      });
    } else {
      el.innerHTML = '<p class="set-text-14 color-red-600">Sign-in is not configured on this server.</p>';
    }
  });
}

export async function signOut() {
  await api('/api/auth/logout', { method: 'POST', body: '{}' });
  if (window.google && window.google.accounts) window.google.accounts.id.disableAutoSelect();
  await getMe(true);
}

/** Creates an order and runs Razorpay Checkout. Resolves with the fulfilment result. */
export async function checkout(payload) {
  const order = await api('/api/checkout', { method: 'POST', body: JSON.stringify(payload) });
  const verify = (paymentId, signature) => api('/api/checkout/verify', {
    method: 'POST', body: JSON.stringify({ orderId: order.orderId, paymentId, signature }),
  }).then(r => r.result);

  if (order.mode === 'mock') {
    const price = formatPrice(order.amount, order.currency);
    if (!window.confirm(`TEST MODE — no real payment.\n\n${order.description}\n${price}\n\nSimulate a successful payment?`)) throw new Error('Payment cancelled.');
    return verify('pay_mock', 'mock');
  }

  await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'SantyCSS Resumes',
      description: order.description,
      prefill: order.prefill,
      theme: { color: '#2563eb' },
      handler: (r) => verify(r.razorpay_payment_id, r.razorpay_signature).then(resolve, reject),
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
    });
    rzp.on('payment.failed', (r) => reject(new Error((r.error && r.error.description) || 'Payment failed.')));
    rzp.open();
  });
}

export function formatPrice(amount, currency) {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount / 100);
}

export const formatDate = (ms) => new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Header user chip: "Sign in" link or avatar + account link. */
export async function renderUserChip(el) {
  const me = await getMe().catch(() => ({ user: null }));
  el.innerHTML = me.user
    ? `<a href="/account" class="make-flex align-center gap-8 add-padding-x-12 add-padding-y-6 make-pill background-slate-100 on-hover:background-slate-200 text-no-decoration color-slate-800 set-text-13 text-semibold">
         <span class="make-inline-flex align-center justify-center set-width-24 set-height-24 make-circle background-blue-600 color-white set-text-12 text-bold">${esc((me.user.name || me.user.email)[0].toUpperCase())}</span>
         My account</a>`
    : `<a href="/account" class="add-padding-x-16 add-padding-y-8 make-pill background-slate-900 on-hover:background-black color-white set-text-13 text-bold text-no-decoration">Sign in</a>`;
  return me;
}
