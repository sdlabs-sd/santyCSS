import { api, esc, getConfig, getMe, renderSignIn, signOut, checkout, formatPrice, formatDate, toast } from './common.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const btn = 'make-inline-flex align-center justify-center gap-6 add-padding-x-14 add-padding-y-8 make-pill set-text-13 text-bold cursor-pointer text-no-decoration add-border-0 font-sans';
const BTN = {
  ghost: btn + ' background-slate-100 on-hover:background-slate-200 color-slate-800',
  dark: btn + ' background-slate-900 on-hover:background-black color-white',
  blue: btn + ' background-blue-600 on-hover:background-blue-700 color-white',
};

/** Only bounce back to our own marketplace or one of its hosted sub-domains. */
function safeReturn(cfg) {
  const r = params.get('return');
  if (!r) return null;
  try {
    const u = new URL(r);
    const host = u.host.toLowerCase();
    return (host === cfg.rootDomain || host.endsWith('.' + cfg.rootDomain)) && /^https?:$/.test(u.protocol) ? u.href : null;
  } catch { return null; }
}

async function main() {
  const [cfg, catalog] = await Promise.all([getConfig(), api('/api/catalog')]);
  let me = await getMe();
  const back = safeReturn(cfg);

  if (!me.user) {
    app.innerHTML = `
      <section class="max-width-420 center-margin background-white round-corners-20 add-shadow-lg add-padding-40 text-center">
        <h1 class="set-text-28 text-extrabold">Sign in</h1>
        <p class="set-text-15 color-slate-600 add-margin-top-8 add-margin-bottom-24">${back ? 'Sign in with the Google account that owns this site to edit it.' : 'Use your Google (Gmail) account to manage your sites and templates.'}</p>
        <div id="signin" class="make-flex justify-center"></div>
      </section>`;
    await renderSignIn(document.getElementById('signin'));
    me = await getMe(true);
  }
  if (back) { location.replace(back); return; }
  render(cfg, catalog, me);
}

function render(cfg, catalog, me) {
  const name = (id) => (catalog.templates.find(t => t.id === id) || { name: id }).name;
  const hosting = formatPrice(catalog.pricing.hosting.amount, catalog.pricing.hosting.currency);
  const soon = (ms) => ms - Date.now() < 30 * 86400000;

  app.innerHTML = `
    <div class="make-flex flex-wrap align-center justify-between gap-16 add-margin-bottom-40">
      <div>
        <h1 class="set-text-32 text-extrabold letter-space-tight">Hi, ${esc(me.user.name.split(' ')[0])}</h1>
        <p class="set-text-14 color-slate-500 add-margin-top-4">${esc(me.user.email)}</p>
      </div>
      <button id="logout" class="${BTN.ghost}">Sign out</button>
    </div>

    <section class="add-margin-bottom-48">
      <h2 class="set-text-20 text-extrabold add-margin-bottom-16">My sites</h2>
      ${me.sites.length ? `<div class="make-grid grid-cols-1 md:grid-cols-2 gap-16">${me.sites.map(s => `
        <article class="background-white round-corners-16 add-border-1 border-color-slate-200 add-padding-24">
          <div class="make-flex align-center justify-between gap-8">
            <a href="${esc(s.url)}" target="_blank" rel="noopener" class="font-mono set-text-15 text-bold color-blue-700 text-no-decoration">${esc(s.url.replace(/^https?:\/\//, ''))}</a>
            <span class="add-padding-x-10 add-padding-y-2 make-pill set-text-12 text-bold ${s.active ? 'background-emerald-100 color-emerald-700' : 'background-red-100 color-red-700'}">${s.active ? 'Live' : 'Expired'}</span>
          </div>
          <p class="set-text-13 color-slate-600 add-margin-top-8">${esc(name(s.templateId))} · ${s.framework === 'vue' ? 'Vue 3' : 'React'} · ${s.active ? 'renews' : 'expired'} ${formatDate(s.expiresAt)}</p>
          <div class="make-flex flex-wrap gap-8 add-margin-top-16">
            ${s.active ? `<a href="${esc(s.url)}/?admin" class="${BTN.blue}">✎ Edit site</a>` : ''}
            ${!s.active || soon(s.expiresAt) ? `<button class="${BTN.dark}" data-renew="${esc(s.subdomain)}">Renew · ${hosting}/yr</button>` : `<button class="${BTN.ghost}" data-renew="${esc(s.subdomain)}">Extend a year</button>`}
          </div>
        </article>`).join('')}</div>`
      : `<div class="background-white round-corners-16 add-border-1 border-color-slate-200 add-padding-32 text-center">
          <p class="set-text-15 color-slate-600">You don't host a resume yet.</p>
          <a href="/#templates" class="${BTN.blue} add-margin-top-16">Pick a template</a>
        </div>`}
    </section>

    <section>
      <h2 class="set-text-20 text-extrabold add-margin-bottom-16">My premium templates</h2>
      ${me.purchases.length ? `<div class="background-white round-corners-16 add-border-1 border-color-slate-200">${me.purchases.map((id, i) => `
        <div class="make-flex flex-wrap align-center justify-between gap-12 add-padding-20 ${i ? 'add-border-top-1 border-color-slate-100' : ''}">
          <p class="set-text-15 text-bold">★ ${esc(name(id))}</p>
          <div class="make-flex gap-8">
            <a class="${BTN.ghost}" href="/api/download/${encodeURIComponent(id)}?framework=react">↓ React</a>
            <a class="${BTN.ghost}" href="/api/download/${encodeURIComponent(id)}?framework=vue">↓ Vue 3</a>
          </div>
        </div>`).join('')}</div>`
      : '<p class="set-text-14 color-slate-500">No premium templates yet — free templates download straight from the gallery.</p>'}
    </section>`;

  document.getElementById('logout').onclick = async () => { await signOut(); location.href = '/'; };
  app.querySelectorAll('[data-renew]').forEach(b => b.addEventListener('click', async () => {
    b.disabled = true;
    try {
      const r = await checkout({ kind: 'renewal', subdomain: b.dataset.renew });
      toast('Renewed until ' + formatDate(r.expiresAt), 'success');
      render(cfg, catalog, await getMe(true));
    } catch (e) { toast(e.message, 'error'); b.disabled = false; }
  }));
}

main().catch(e => { app.innerHTML = `<p class="color-red-600">${esc(e.message)}</p>`; });
