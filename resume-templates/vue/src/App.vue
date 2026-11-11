<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, watchEffect } from 'vue';
import templates from './templates/index.js';
import { catalog, samples } from './registry.js';
import { accentFor } from '@shared/accents.js';
import { normalize, clean } from '@shared/schema.js';
import { getBoot, loadDraft, saveDraft, clearDraft, fetchMe, saveSite } from '@shared/store.js';
import AdminPanel from './admin/AdminPanel.vue';

const ids = Object.keys(templates);
const metaOf = (id) => catalog.templates.find(t => t.id === id) || { id, name: id, accent: 'blue', tier: 'free' };
const sampleFor = (id) => normalize(samples[metaOf(id).sample] || Object.values(samples)[0]);

/*
 * Modes
 *  - Local (downloaded project / marketplace preview): edits autosave to localStorage.
 *    ?template=<id> picks a template, ?admin opens the editor, ?embed hides all chrome.
 *  - Hosted (<name>.<root-domain>): the server injects window.__RESUME_SITE__; only the
 *    owner (signed in with Google on the root domain) sees the editor, and Save publishes.
 */
const boot = getBoot();
const params = new URLSearchParams(window.location.search);
const embed = params.has('embed');
const wantsAdmin = params.has('admin');
const requested = boot ? boot.templateId : params.get('template');
const initialId = templates[requested] ? requested : ids[0];
const draft = !boot && !embed ? loadDraft(initialId) : null;

const templateId = ref(initialId);
// Replaced wholesale on every edit (like React state), so a shallow ref is enough.
const data = shallowRef(normalize((boot && boot.data) || (draft && draft.data) || sampleFor(initialId)));
const accent = ref((boot && boot.accent) || (draft && draft.accent) || params.get('accent') || metaOf(initialId).accent);
const open = ref(!boot && !embed && wantsAdmin);
const me = ref(null);
const status = ref('');
const dirty = ref(false);

const isOwner = computed(() => !!(boot && me.value && me.value.user && me.value.user.email === boot.ownerEmail));
const canEdit = computed(() => !embed && (!boot || isOwner.value));
const showSignIn = computed(() => !!boot && !isOwner.value && wantsAdmin && me.value !== null);
const Template = computed(() => templates[templateId.value]);
const accentClasses = computed(() => accentFor(accent.value));
const siteLabel = boot ? window.location.host : '';

onMounted(() => { if (boot) fetchMe().then(v => { me.value = v; }); });
watch(isOwner, (v) => { if (v && wantsAdmin) open.value = true; }, { immediate: true });
watchEffect(() => {
  const b = data.value.basics;
  document.title = b.name ? b.name + (b.title ? ' — ' + b.title : '') : 'Resume';
});

// Local mode: autosave a draft shortly after each change.
watch([dirty, data, accent, templateId], (_v, _o, onCleanup) => {
  if (boot || embed || !dirty.value) return;
  const t = setTimeout(() => {
    saveDraft(templateId.value, { data: clean(data.value), accent: accent.value });
    status.value = 'Draft saved in this browser';
  }, 600);
  onCleanup(() => clearTimeout(t));
});

// Hosted mode: warn before leaving with unpublished edits.
const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
watch(dirty, (d) => {
  if (!boot) return;
  if (d) window.addEventListener('beforeunload', warn);
  else window.removeEventListener('beforeunload', warn);
});
onBeforeUnmount(() => window.removeEventListener('beforeunload', warn));

// Which templates can this person switch to?
const allowed = computed(() => ids.filter(id => {
  if (!boot) return true;
  const m = metaOf(id);
  const owned = (me.value && me.value.purchases) || [];
  return m.tier === 'free' || owned.includes(id) || id === boot.templateId;
}));

const change = (target) => (value) => { target.value = value; dirty.value = true; status.value = ''; };
const onData = change(data);
const onTemplate = change(templateId);
const onAccent = change(accent);

async function save() {
  const payload = { templateId: templateId.value, accent: accent.value, data: clean(data.value) };
  if (!boot) {
    saveDraft(templateId.value, payload);
    dirty.value = false;
    status.value = 'Saved in this browser';
    return;
  }
  status.value = 'Publishing…';
  try {
    await saveSite(boot.subdomain, payload);
    dirty.value = false;
    status.value = 'Published — live at ' + window.location.host;
  } catch (e) {
    status.value = 'Could not save: ' + e.message;
  }
}

function reset() {
  if (!window.confirm('Replace your content with the sample resume for this template?')) return;
  data.value = sampleFor(templateId.value);
  accent.value = metaOf(templateId.value).accent;
  if (!boot) clearDraft(templateId.value);
  dirty.value = true;
}
</script>

<template>
  <component :is="Template" :data="data" :accent="accentClasses" />

  <button
    v-if="canEdit && !open"
    type="button"
    class="font-sans position-fixed pin-bottom-24 pin-right-24 layer-50 make-flex align-center gap-8 add-padding-x-20 add-padding-y-12 make-pill background-gray-900 color-white set-text-14 text-bold add-shadow-xl add-border-0 cursor-pointer on-hover:background-black transition-all print:hidden"
    @click="open = true"
  >✎ Edit resume</button>

  <div v-if="showSignIn" class="font-sans position-fixed pin-bottom-24 pin-right-24 layer-50 background-white add-shadow-xl round-corners-16 add-padding-20 max-width-320 add-border-1 border-color-gray-200 print:hidden">
    <p class="set-text-15 text-bold color-gray-900">Owner sign-in</p>
    <p class="set-text-13 color-gray-600 add-margin-top-4 add-margin-bottom-12">{{ me && me.user ? 'You are signed in as ' + me.user.email + ', which does not own this site.' : 'Sign in with the Google account that owns this site to edit it.' }}</p>
    <a :href="boot.loginUrl" class="make-inline-block add-padding-x-16 add-padding-y-8 make-pill background-blue-600 on-hover:background-blue-700 color-white set-text-13 text-bold text-no-decoration">Sign in with Google</a>
  </div>

  <AdminPanel
    v-if="open && canEdit"
    :data="data"
    :template-id="templateId"
    :accent="accent"
    :templates="allowed.map(metaOf)"
    :accents="catalog.accents"
    :hosted="!!boot"
    :site-label="siteLabel"
    :dirty="dirty"
    :status="status"
    @data="onData"
    @template="onTemplate"
    @accent="onAccent"
    @save="save"
    @reset="reset"
    @close="open = false"
  />
</template>
