import { computed, defineComponent, h } from 'vue';
import { safeUrl, mailto, telto, prettyUrl, initials } from '@shared/format.js';

/**
 * Link that refuses unsafe schemes (javascript:, data:, …) — renders text instead.
 * `class` falls through to whichever root element is rendered.
 */
export const A = defineComponent({
  name: 'A',
  props: { href: { type: String, default: '' } },
  setup(props, { slots }) {
    return () => {
      const url = safeUrl(props.href);
      const children = slots.default ? slots.default() : [];
      if (!url) return h('span', null, children);
      const external = /^https?:/i.test(url);
      return h('a', {
        href: url,
        target: external ? '_blank' : undefined,
        rel: external ? 'noopener noreferrer' : undefined,
      }, children);
    };
  },
});

/** Photo if one is set, otherwise initials. `class` is applied to either element. */
export const Avatar = defineComponent({
  name: 'Avatar',
  inheritAttrs: false,
  props: {
    basics: { type: Object, required: true },
    fallbackClass: { type: String, default: '' },
  },
  setup(props, { attrs }) {
    return () => {
      const className = typeof attrs.class === 'string' ? attrs.class : '';
      const src = safeUrl(props.basics.photo);
      if (src) return h('img', { src, alt: props.basics.name, class: className + ' object-fit-cover' });
      return h('div', {
        class: className + ' make-flex align-center justify-center ' + props.fallbackClass,
        'aria-hidden': 'true',
      }, initials(props.basics.name));
    };
  },
});

/** Contact rows in a consistent order: email, phone, location, website. */
export function contacts(basics) {
  return [
    basics.email && { key: 'email', icon: '✉', label: basics.email, href: mailto(basics.email) },
    basics.phone && { key: 'phone', icon: '☎', label: basics.phone, href: telto(basics.phone) },
    basics.location && { key: 'location', icon: '⌖', label: basics.location, href: '' },
    basics.website && { key: 'website', icon: '↗', label: prettyUrl(basics.website), href: basics.website },
  ].filter(Boolean);
}

export const has = (arr) => Array.isArray(arr) && arr.length > 0;

/** Template props + the resume sections as computed refs (mirrors React's destructuring). */
export const templateProps = {
  data: { type: Object, required: true },
  accent: { type: Object, required: true },
};

const KEYS = ['basics', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'links', 'stats'];
export function useResume(props) {
  return Object.fromEntries(KEYS.map(k => [k, computed(() => props.data[k])]));
}
