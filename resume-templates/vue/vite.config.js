import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));
// The repo's own purge plugin: full santy.css in dev, only used classes in build.
const santycss = createRequire(import.meta.url)('../../vite-plugin-santycss.js');

export default defineConfig({
  // Relative asset URLs so the same build works at /preview/vue/ and on
  // every hosted <name>.<root-domain> site.
  base: './',
  plugins: [
    santycss({ cssFile: r('../../dist/santy.css'), content: [r('./index.html'), r('./src'), r('../shared')] }),
    vue(),
  ],
  resolve: {
    alias: {
      '@shared': r('../shared'),
      '@data': r('..'),
    },
  },
  server: { fs: { allow: [r('../..')] } },
});
