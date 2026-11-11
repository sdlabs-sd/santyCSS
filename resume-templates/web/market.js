import { api, esc, getConfig, getMe, renderSignIn, renderUserChip, checkout, formatPrice, toast } from './common.js';

const $ = (s) => document.querySelector(s);
const state = { catalog: null, cfg: null, me: null, filter: 'all', q: '', fw: localStorage.getItem('rt-fw') || 'react' };

const btn = 'make-inline-flex align-center justify-center gap-6 add-padding-x-14 add-padding-y-8 make-pill set-text-13 text-bold cursor-pointer text-no-decoration add-border-0 transition-all font-sans';
const BTN = {
  ghost: btn + ' background-slate-100 on-hover:background-slate-200 color-slate-800',
  dark: btn + ' background-slate-900 on-hover:background-black color-white',
  gold: btn + ' background-amber-400 on-hover:background-amber-300 color-slate-900',
  blue: btn + ' background-blue-600 on-hover:background-blue-700 color-white',
};

const owned = (id) => !!(state.me && state.me.purchases.includes(id));
const price = (k) => formatPrice(state.catalog.pricing[k].amount, state.catalog.pricing[k].currency);

async function init() {
  const [catalog, cfg, me] = await Promise.all([api('/api/catalog'), getConfig(), renderUserChip($('#user-chip'))]);
  Object.assign(state, { catalog, cfg, me });
  document.querySelectorAll('[data-root-domain]').forEach(el => { el.textContent = cfg.rootDomain; });
  document.querySelectorAll('[data-price="hosting"]').forEach(el => { el.textContent = price('hosting'); });

  const cats = [...new Set(catalog.templates.map(t => t.category))].sort();
  const chip = (key, label) => `<button data-filter="${esc(key)}" class="filter-btn font-sans add-padding-x-14 add-padding-y-6 make-pill set-text-13 text-semibold cursor-pointer add-border-1">${esc(label)}</button>`;
  $('#filters').innerHTML = [chip('all', 'All'), chip('free', 'Free'), chip('premium', '★ Premium'), ...cats.map(c => chip('cat:' + c, c))].join('');
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (b) { state.filter = b.dataset.filter; render(); }
  });
  $('#search').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); render(); });
  document.querySelectorAll('.fw-btn').forEach(b => b.addEventListener('click', () => {
    state.fw = b.dataset.fw;
    localStorage.setItem('rt-fw', state.fw);
    render();
  }));
  $('#grid').addEventListener('click', onCardClick);
  render();
}

function visible() {
  return state.catalog.templates.filter(t => {
    if (state.filter === 'free' && t.tier !== 'free') return false;
    if (state.filter === 'premium' && t.tier !== 'premium') return false;
    if (state.filter.startsWith('cat:') && t.category !== state.filter.slice(4)) return false;
    if (state.q && !(t.job + ' ' + t.name + ' ' + t.category).toLowerCase().includes(state.q)) return false;
    return true;
  });
}

function card(t) {
  const premium = t.tier === 'premium';
  const have = !premium || owned(t.id);
  const preview = `/preview/${state.fw}/?template=${encodeURIComponent(t.id)}`;
  return `
  <article class="make-flex flex-column background-white round-corners-20 add-border-1 border-color-slate-200 overflow-hidden transition-all on-hover:add-shadow-xl on-hover:translate-y-minus-4">
    <a href="${preview}&admin" target="_blank" rel="noopener" class="make-block position-relative set-height-220 overflow-hidden background-slate-100 add-padding-top-16 text-no-decoration" aria-label="Preview ${esc(t.name)}">
      <div class="make-flex justify-center">
        <iframe src="/preview/react/?template=${encodeURIComponent(t.id)}&embed" title="${esc(t.name)} preview" loading="lazy" tabindex="-1"
          class="flex-shrink-0 set-width-1024 set-height-640 scale-30 transform-origin-top pointer-events-none add-border-0 round-corners-12 background-white add-shadow-lg"></iframe>
      </div>
      <span class="position-absolute pin-top-12 pin-left-12 add-padding-x-10 add-padding-y-4 make-pill set-text-11 text-bold text-uppercase letter-space-wide ${premium ? 'background-amber-400 color-slate-900' : 'background-emerald-600 color-white'}">
        ${premium ? '★ Premium · ' + price('premium') : 'Free'}
      </span>
    </a>
    <div class="make-flex flex-column flex-1 add-padding-20">
      <p class="set-text-12 text-bold text-uppercase letter-space-wider color-blue-600">${esc(t.job)}</p>
      <h3 class="set-text-20 text-extrabold add-margin-top-4">${esc(t.name)}</h3>
      <p class="set-text-14 color-slate-600 line-height-relaxed add-margin-top-6 flex-1">${esc(t.description)}</p>
      <div class="make-flex flex-wrap gap-8 add-margin-top-16">
        <a href="${preview}&admin" target="_blank" rel="noopener" class="${BTN.ghost}">Preview &amp; edit</a>
        ${have
          ? `<a href="/api/download/${encodeURIComponent(t.id)}?framework=${state.fw}" class="${BTN.dark}" data-action="download" data-id="${esc(t.id)}">↓ Download ${state.fw === 'vue' ? 'Vue' : 'React'}</a>`
          : `<button class="${BTN.gold}" data-action="buy" data-id="${esc(t.id)}">Buy ${price('premium')}</button>`}
        <button class="${BTN.blue}" data-action="host" data-id="${esc(t.id)}">Host · ${price('hosting')}/yr</button>
      </div>
    </div>
  </article>`;
}

function render() {
  const list = visible();
  $('#grid').innerHTML = list.map(card).join('');
  $('#count').textContent = state.catalog.templates.length;
  $('#empty').classList.toggle('make-hidden', list.length > 0);
  document.querySelectorAll('.filter-btn').forEach(b => {
    const on = b.dataset.filter === state.filter;
    b.classList.toggle('background-slate-900', on); b.classList.toggle('color-white', on); b.classList.toggle('border-color-slate-900', on);
    b.classList.toggle('background-white', !on); b.classList.toggle('color-slate-700', !on); b.classList.toggle('border-color-slate-300', !on);
  });
  document.querySelectorAll('.fw-btn').forEach(b => {
    const on = b.dataset.fw === state.fw;
    b.classList.toggle('background-white', on); b.classList.toggle('add-shadow-sm', on);
    b.classList.toggle('color-slate-900', on); b.classList.toggle('background-transparent', !on); b.classList.toggle('color-slate-500', !on);
  });
}

function onCardClick(e) {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const t = state.catalog.templates.find(x => x.id === b.dataset.id);
  if (b.dataset.action === 'buy') { e.preventDefault(); openFlow(t, 'buy'); }
  if (b.dataset.action === 'host') { e.preventDefault(); openFlow(t, 'host'); }
  if (b.dataset.action === 'download') toast('Downloading ' + t.name + ' — unzip, then npm install && npm run dev');
}

/* ── Dialog: sign in → (buy premium) → choose sub-domain → pay ─────────────── */
const dlg = () => $('#host-dialog');

function frame(title, body) {
  dlg().innerHTML = `
    <div class="add-padding-28">
      <div class="make-flex align-start justify-between gap-12 add-margin-bottom-20">
        <h2 class="set-text-22 text-extrabold color-slate-900">${title}</h2>
        <button data-close class="make-inline-flex align-center justify-center set-width-32 set-height-32 make-circle background-slate-100 on-hover:background-slate-200 add-border-0 cursor-pointer set-text-14" aria-label="Close">✕</button>
      </div>
      ${body}
    </div>`;
  dlg().querySelector('[data-close]').onclick = () => dlg().close();
}

async function openFlow(t, mode) {
  if (!dlg().open) dlg().showModal();
  state.me = await getMe();
  if (!state.me.user) {
    frame('Sign in to continue', `
      <p class="set-text-14 color-slate-600 add-margin-bottom-20">Use your Google (Gmail) account. It's how you'll sign in to edit your ${mode === 'host' ? 'hosted resume' : 'purchases'} later.</p>
      <div id="signin-slot" class="add-margin-bottom-8"></div>`);
    await renderSignIn($('#signin-slot'));
    state.me = await renderUserChip($('#user-chip'));
    toast('Signed in as ' + state.me.user.email, 'success');
  }
  if (mode === 'buy') return buyFlow(t);
  return hostFlow(t);
}

async function buyFlow(t) {
  if (owned(t.id)) { dlg().close(); render(); return; }
  frame('Buy ' + esc(t.name), `
    <p class="set-text-15 color-slate-700">Premium <span class="text-bold">${esc(t.name)}</span> template for ${esc(t.job)} — React <span class="text-bold">and</span> Vue 3 source, lifetime updates, personal-use licence.</p>
    <p class="set-text-32 text-extrabold add-margin-y-20">${price('premium')}</p>
    <button id="pay" class="${BTN.gold} set-width-full set-text-15 add-padding-y-12">Pay ${price('premium')}</button>`);
  $('#pay').onclick = async () => {
    try {
      await checkout({ kind: 'premium', templateId: t.id });
      state.me = await getMe(true);
      render();
      frame('It\'s yours 🎉', `
        <p class="set-text-15 color-slate-700 add-margin-bottom-20">${esc(t.name)} is now in your account. Download it, or host it on your own sub-domain.</p>
        <div class="make-flex flex-wrap gap-8">
          <a class="${BTN.dark}" href="/api/download/${t.id}?framework=react">↓ React</a>
          <a class="${BTN.dark}" href="/api/download/${t.id}?framework=vue">↓ Vue 3</a>
          <button id="then-host" class="${BTN.blue}">Host it · ${price('hosting')}/yr</button>
        </div>`);
      $('#then-host').onclick = () => hostFlow(t);
    } catch (e) { toast(e.message, 'error'); }
  };
}

function hostFlow(t) {
  const needsTemplate = t.tier === 'premium' && !owned(t.id);
  const root = esc(state.cfg.rootDomain);
  frame('Host ' + esc(t.name), `
    <label for="sub" class="make-block set-text-13 text-semibold color-slate-700 add-margin-bottom-6">Choose your address</label>
    <div class="make-flex align-center round-corners-12 add-border-1 border-color-slate-300 overflow-hidden background-white">
      <input id="sub" autocomplete="off" spellcheck="false" maxlength="30" placeholder="yourname"
        class="font-mono flex-1 min-width-0 add-padding-x-14 add-padding-y-12 add-border-0 set-text-15 on-focus:outline-none" />
      <span class="font-mono add-padding-x-12 add-padding-y-12 background-slate-100 color-slate-500 set-text-14">.${root}</span>
    </div>
    <p id="sub-status" class="set-text-13 add-margin-top-6 color-slate-500">Letters, numbers and hyphens.</p>

    <p class="set-text-13 text-semibold color-slate-700 add-margin-top-20 add-margin-bottom-6">Built with</p>
    <div class="make-flex gap-8">
      ${['react', 'vue'].map(fw => `
        <label class="flex-1 make-flex align-center gap-8 add-padding-12 round-corners-12 add-border-1 border-color-slate-300 cursor-pointer has-checked:border-color-blue-600">
          <input type="radio" name="fw" value="${fw}" ${fw === state.fw ? 'checked' : ''} /> <span class="set-text-14 text-semibold">${fw === 'react' ? 'React' : 'Vue 3'}</span>
        </label>`).join('')}
    </div>

    <div class="background-slate-50 round-corners-12 add-padding-16 add-margin-top-20 set-text-14 color-slate-700">
      ${needsTemplate ? `<p class="make-flex justify-between add-margin-bottom-6"><span>${esc(t.name)} premium template</span><span class="text-bold">${price('premium')}</span></p>` : ''}
      <p class="make-flex justify-between"><span>Hosting · 1 year</span><span class="text-bold">${price('hosting')}</span></p>
      <p class="set-text-12 color-slate-500 add-margin-top-8">Includes the online editor — sign in with Gmail at your site to make changes.</p>
    </div>
    <button id="pay" disabled class="${BTN.blue} set-width-full set-text-15 add-padding-y-12 add-margin-top-20 on-disabled:opacity-50 on-disabled:cursor-not-allowed">
      ${needsTemplate ? 'Buy template, then pay for hosting' : 'Pay ' + price('hosting') + ' & create my site'}
    </button>`);

  const input = $('#sub'), status = $('#sub-status'), pay = $('#pay');
  let timer, current = '';
  input.addEventListener('input', () => {
    input.value = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    pay.disabled = true;
    clearTimeout(timer);
    const v = input.value;
    if (v.length < 3) { status.textContent = 'At least 3 characters.'; status.className = 'set-text-13 add-margin-top-6 color-slate-500'; return; }
    timer = setTimeout(async () => {
      const r = await api('/api/subdomains/' + encodeURIComponent(v)).catch(e => ({ available: false, reason: e.message }));
      if (input.value !== v) return;
      current = r.available ? v : '';
      status.textContent = r.available ? `✓ ${v}.${state.cfg.rootDomain} is available` : '✗ ' + r.reason;
      status.className = 'set-text-13 add-margin-top-6 text-semibold ' + (r.available ? 'color-emerald-600' : 'color-red-600');
      pay.disabled = !r.available;
    }, 300);
  });
  input.focus();

  pay.onclick = async () => {
    const framework = dlg().querySelector('input[name=fw]:checked').value;
    pay.disabled = true;
    try {
      if (t.tier === 'premium' && !owned(t.id)) {
        await checkout({ kind: 'premium', templateId: t.id });
        state.me = await getMe(true);
        toast('Template purchased — now hosting', 'success');
      }
      const site = await checkout({ kind: 'hosting', templateId: t.id, framework, subdomain: current });
      state.me = await getMe(true);
      render();
      frame('Your site is live 🎉', `
        <p class="set-text-15 color-slate-700">Your resume is published at</p>
        <p class="font-mono set-text-18 text-bold color-blue-700 add-margin-y-12">${esc(site.url.replace(/^https?:\/\//, ''))}</p>
        <p class="set-text-14 color-slate-600 add-margin-bottom-20">It starts with sample content — open the editor to make it yours. Hosting renews on your account page.</p>
        <div class="make-flex flex-wrap gap-8">
          <a class="${BTN.blue}" href="${esc(site.editUrl)}">✎ Open the editor</a>
          <a class="${BTN.ghost}" href="/account">My account</a>
        </div>`);
    } catch (e) {
      toast(e.message, 'error');
      pay.disabled = !current;
    }
  };
}

init().catch(e => toast(e.message, 'error'));
