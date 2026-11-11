<script setup>
import { computed, ref } from 'vue';
import { SECTIONS, normalize } from '@shared/schema.js';
import { accentFor } from '@shared/accents.js';
import { downloadJson, readJsonFile } from '@shared/store.js';
import Field from './Field.vue';
import ListSection from './ListSection.vue';
import { btnGhost, btnPrimary, iconBtn } from './ui.js';

const props = defineProps({
  data: { type: Object, required: true },
  templateId: { type: String, required: true },
  accent: { type: String, required: true },
  templates: { type: Array, required: true },
  accents: { type: Array, required: true },
  hosted: { type: Boolean, default: false },
  siteLabel: { type: String, default: '' },
  dirty: { type: Boolean, default: false },
  status: { type: String, default: '' },
});
const emit = defineEmits(['data', 'template', 'accent', 'save', 'reset', 'close']);

const tab = ref('basics');
const fileRef = ref(null);
const section = computed(() => SECTIONS.find(s => s.key === tab.value));
const tabs = [...SECTIONS.map(s => [s.key, s.label]), ['design', 'Design']];

const setBasic = (k, v) => emit('data', { ...props.data, basics: { ...props.data.basics, [k]: v } });
const setItems = (key, items) => emit('data', { ...props.data, [key]: items });

async function importJson(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try { emit('data', normalize(await readJsonFile(file))); } catch (err) { window.alert(err.message); }
}
const print = () => window.print();
</script>

<template>
  <aside class="font-sans position-fixed pin-top-0 pin-right-0 pin-bottom-0 set-width-full max-width-420 background-gray-50 add-shadow-xl layer-50 make-flex flex-column add-border-left-1 border-color-gray-200 print:hidden" aria-label="Resume editor">
    <header class="background-white add-padding-x-20 add-padding-y-16 add-border-bottom-1 border-color-gray-200 make-flex align-center justify-between gap-12">
      <div>
        <p class="set-text-16 text-bold color-gray-900">Edit resume</p>
        <p class="set-text-12 color-gray-500">{{ hosted ? 'Live site · ' + siteLabel : 'Local draft · saved in this browser' }}</p>
      </div>
      <button type="button" :class="iconBtn" aria-label="Close editor" @click="emit('close')">✕</button>
    </header>

    <nav class="background-white add-padding-x-12 add-padding-y-8 add-border-bottom-1 border-color-gray-200 make-flex gap-4 overflow-x-auto">
      <button
        v-for="[k, label] in tabs"
        :key="k"
        type="button"
        :class="'flex-shrink-0 add-padding-x-12 add-padding-y-6 make-pill set-text-13 text-semibold cursor-pointer add-border-0 ' + (tab === k ? 'background-gray-900 color-white' : 'background-transparent color-gray-600 on-hover:background-gray-100')"
        @click="tab = k"
      >{{ label }}</button>
    </nav>

    <div class="flex-1 overflow-y-auto add-padding-20">
      <div v-if="section && section.type === 'object'" class="make-grid grid-cols-2 gap-12">
        <Field v-for="f in section.fields" :key="f.k" :field="f" :value="data.basics[f.k]" @change="v => setBasic(f.k, v)" />
      </div>
      <ListSection v-if="section && section.type === 'list'" :key="section.key" :section="section" :items="data[section.key]" @items="items => setItems(section.key, items)" />
      <div v-if="tab === 'design'">
        <p class="set-text-12 text-semibold color-gray-600 add-margin-bottom-8">Template</p>
        <div class="make-grid grid-cols-2 gap-8 add-margin-bottom-24">
          <button
            v-for="t in templates"
            :key="t.id"
            type="button"
            :class="'text-left add-padding-12 round-corners-10 cursor-pointer add-border-2 background-white ' + (t.id === templateId ? 'border-color-blue-600' : 'border-color-gray-200 on-hover:border-color-gray-400')"
            @click="emit('template', t.id)"
          >
            <span class="make-block set-text-14 text-bold color-gray-900">{{ t.name }}<span v-if="t.tier === 'premium'" class="color-amber-600"> ★</span></span>
            <span class="make-block set-text-12 color-gray-500">{{ t.job }}</span>
          </button>
        </div>
        <p class="set-text-12 text-semibold color-gray-600 add-margin-bottom-8">Accent colour</p>
        <div class="make-flex flex-wrap gap-8 add-margin-bottom-24">
          <button
            v-for="name in accents"
            :key="name"
            type="button"
            :title="name"
            :aria-label="'Accent ' + name"
            :class="'set-width-36 set-height-36 make-circle cursor-pointer add-border-4 ' + accentFor(name).solid + ' ' + (name === accent ? 'border-color-gray-900' : 'border-color-white')"
            @click="emit('accent', name)"
          />
        </div>
        <p class="set-text-12 text-semibold color-gray-600 add-margin-bottom-8">Content</p>
        <div class="make-flex flex-wrap gap-8">
          <button type="button" :class="btnGhost" @click="downloadJson('resume.json', data)">Export JSON</button>
          <button type="button" :class="btnGhost" @click="fileRef && fileRef.click()">Import JSON</button>
          <button type="button" :class="btnGhost" @click="emit('reset')">Reset to sample</button>
          <input ref="fileRef" type="file" accept="application/json,.json" class="make-hidden" @change="importJson" />
        </div>
      </div>
    </div>

    <footer class="background-white add-padding-16 add-border-top-1 border-color-gray-200">
      <p v-if="status" class="set-text-12 color-gray-600 add-margin-bottom-10">{{ status }}</p>
      <div class="make-flex gap-8">
        <button type="button" :class="btnPrimary + ' flex-1'" :disabled="hosted && !dirty" @click="emit('save')">{{ hosted ? (dirty ? 'Publish changes' : 'Published') : 'Save' }}</button>
        <button type="button" :class="btnGhost" @click="print">Print / PDF</button>
      </div>
    </footer>
  </aside>
</template>
