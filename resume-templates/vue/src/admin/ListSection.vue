<script setup>
import { ref } from 'vue';
import Field from './Field.vue';
import { btnGhost, iconBtn } from './ui.js';

const props = defineProps({
  section: { type: Object, required: true },
  items: { type: Array, required: true },
});
const emit = defineEmits(['items']);
const openIdx = ref(props.items.length ? 0 : -1);
const noun = () => props.section.label.toLowerCase().replace(/s$/, '');

const set = (i, k, v) => emit('items', props.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
function move(i, d) {
  const j = i + d;
  if (j < 0 || j >= props.items.length) return;
  const next = props.items.slice();
  [next[i], next[j]] = [next[j], next[i]];
  emit('items', next);
  openIdx.value = j;
}
function remove(i) {
  if (!window.confirm('Remove this ' + noun() + '?')) return;
  emit('items', props.items.filter((_, j) => j !== i));
  openIdx.value = -1;
}
function add() {
  emit('items', [...props.items, JSON.parse(JSON.stringify(props.section.blank))]);
  openIdx.value = props.items.length;
}
</script>

<template>
  <div>
    <p v-if="items.length === 0" class="set-text-13 color-gray-500 add-margin-bottom-12">Nothing here yet — this section is hidden on your resume until you add something.</p>
    <div v-for="(item, i) in items" :key="i" class="add-border-1 border-color-gray-200 round-corners-10 add-margin-bottom-10 background-white">
      <div class="make-flex align-center gap-8 add-padding-x-12 add-padding-y-10">
        <button type="button" class="flex-1 text-left background-transparent add-border-0 cursor-pointer add-padding-0" @click="openIdx = openIdx === i ? -1 : i">
          <span class="make-block set-text-14 text-semibold color-gray-900 text-clamp-1">{{ section.title(item) }}</span>
          <span v-if="section.sub(item)" class="make-block set-text-12 color-gray-500 text-clamp-1">{{ section.sub(item) }}</span>
        </button>
        <button type="button" :class="iconBtn" aria-label="Move up" @click="move(i, -1)">↑</button>
        <button type="button" :class="iconBtn" aria-label="Move down" @click="move(i, 1)">↓</button>
        <button type="button" :class="iconBtn" aria-label="Remove" @click="remove(i)">✕</button>
      </div>
      <div v-if="openIdx === i" class="make-grid grid-cols-2 gap-12 add-padding-12 add-border-top-1 border-color-gray-100 background-gray-50 round-bottom-10">
        <Field v-for="f in section.fields" :key="f.k" :field="f" :value="item[f.k]" @change="v => set(i, f.k, v)" />
      </div>
    </div>
    <button type="button" :class="btnGhost + ' set-width-full'" @click="add">+ Add {{ noun() }}</button>
  </div>
</template>
