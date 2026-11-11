<script setup>
import { computed, useId } from 'vue';
import { toInput, fromInput } from '@shared/schema.js';
import { input } from './ui.js';

const props = defineProps({
  field: { type: Object, required: true },
  value: { default: undefined },
});
const emit = defineEmits(['change']);
const id = useId();
const multiline = computed(() => props.field.type === 'textarea' || props.field.type === 'lines');
const inputType = computed(() => {
  const t = props.field.type;
  return t === 'number' ? 'number' : t === 'email' ? 'email' : t === 'url' ? 'url' : 'text';
});
const onInput = (e) => emit('change', fromInput(props.field, e.target.value));
</script>

<template>
  <div :class="field.half ? '' : 'span-col-2'">
    <label :for="id" class="make-block set-text-12 text-semibold color-gray-600 add-margin-bottom-4">{{ field.label }}</label>
    <textarea v-if="multiline" :id="id" :rows="field.type === 'lines' ? 5 : 4" :class="input" :value="toInput(field, value)" @input="onInput" />
    <input v-else :id="id" :type="inputType" min="0" max="100" :class="input" :value="toInput(field, value)" @input="onInput" />
  </div>
</template>
