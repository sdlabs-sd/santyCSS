/**
 * Builds the downloadable project for one template + framework:
 *   <id>-resume-<framework>/
 *     package.json  vite.config.js  index.html  README.md  [LICENSE.txt]
 *     shared/*.js                 (accents, schema, store, format)
 *     src/…                       (app + editor, only the chosen template)
 *     src/santy.css               (SantyCSS purged to the classes this project uses)
 *     src/resume.json             (edit this, or use the in-page editor)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { TEMPLATES_DIR, REPO_DIR } from './config.js';
import { catalog, templateById, sampleFor } from './catalog.js';
import { createZip } from './zip.js';

const require = createRequire(import.meta.url);
const { purge } = require(path.join(REPO_DIR, 'lib', 'purge-core.js'));

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

/** Reads templates/index.js → { id: 'File.jsx' } */
export function templateFiles(framework) {
  const src = fs.readFileSync(path.join(TEMPLATES_DIR, framework, 'src', 'templates', 'index.js'), 'utf8');
  const imports = {};
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/([\w.-]+)['"]/g)) imports[m[1]] = m[2];
  const body = (src.match(/export\s+default\s*\{([\s\S]*?)\}/) || [])[1] || '';
  const map = {};
  for (const m of body.matchAll(/['"]?([\w-]+)['"]?\s*:\s*(\w+)/g)) if (imports[m[2]]) map[m[1]] = imports[m[2]];
  return map;
}

const VITE_CONFIG = {
  react: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@shared': r('./shared') } },
});
`,
  vue: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: { alias: { '@shared': r('./shared') } },
});
`,
};

function readme(t, framework, root) {
  const fw = framework === 'react' ? 'React' : 'Vue 3';
  return `# ${t.name} — ${t.job} resume (${fw} + SantyCSS)

Styled entirely with [SantyCSS](https://santycss.santy.in) utility classes.

## Run it

\`\`\`bash
npm install
npm run dev        # http://localhost:5173  — click “✎ Edit resume”
npm run build      # static site in dist/ — deploy anywhere
\`\`\`

## Edit your content

* **In the browser (admin):** open the site and click **✎ Edit resume** (or add \`?admin\`).
  Every section, the accent colour and the layout are editable; changes autosave
  to this browser. Use **Export JSON** to keep a copy and **Print / PDF** for a PDF.
* **In code:** replace \`src/resume.json\` with your own data (same shape), then rebuild.
  Use \`?embed\` to hide the editor button, e.g. when you deploy.

## Files

* \`src/templates/\` — the ${t.name} template (only SantyCSS classes)
* \`src/admin/\` — the editor
* \`shared/\` — schema, accent colours, helpers
* \`src/santy.css\` — SantyCSS, purged to exactly the classes this project uses.
  If you add new classes, swap it for the full build:
  \`npm i santycss\` and import \`santycss/dist/santy.css\` in \`src/main.*\`.

Don't want to host it yourself? Get **${root.replace(/^https?:\/\//, '')}** hosting with a
custom sub-domain and an online editor for ₹999 / year.
`;
}

const LICENSE = (t) => `SantyCSS Premium Template Licence — "${t.name}"

This template was purchased for personal use. You may use and modify it for
your own resume / personal website, including commercially (job applications,
freelance profile). You may not resell, redistribute or share the template
source, alone or as part of a template collection.
`;

const cache = new Map();

export function buildPackage(templateId, framework, publicUrl = '') {
  const key = templateId + ':' + framework;
  if (cache.has(key)) return cache.get(key);

  const t = templateById(templateId);
  const fwDir = path.join(TEMPLATES_DIR, framework);
  const tplFile = templateFiles(framework)[templateId];
  if (!t || !tplFile) throw Object.assign(new Error('Unknown template'), { status: 404 });

  const root = `${t.id}-resume-${framework}/`;
  const files = [];
  const add = (name, data) => files.push({ name: root + name, data });

  // App sources, minus the multi-template bits we regenerate.
  for (const rel of walk(path.join(fwDir, 'src'))) {
    if (rel === 'registry.js' || rel === 'santy.css' || rel.startsWith('templates/')) continue;
    add('src/' + rel, fs.readFileSync(path.join(fwDir, 'src', rel)));
  }
  for (const rel of walk(path.join(fwDir, 'src', 'templates'))) {
    if (rel.startsWith('parts.') || rel === tplFile) add('src/templates/' + rel, fs.readFileSync(path.join(fwDir, 'src', 'templates', rel)));
  }
  const name = tplFile.replace(/\.\w+$/, '');
  add('src/templates/index.js', `import ${name} from './${tplFile}';\n\nexport default {\n  ${JSON.stringify(t.id)}: ${name},\n};\n`);
  add('src/registry.js', `import catalog from './catalog.json';\nimport sample from './resume.json';\n\nexport const samples = { ${JSON.stringify(t.sample)}: sample };\nexport { catalog };\n`);
  add('src/catalog.json', JSON.stringify({ accents: catalog.accents, templates: [t] }, null, 2) + '\n');
  add('src/resume.json', JSON.stringify(sampleFor(t), null, 2) + '\n');
  for (const rel of walk(path.join(TEMPLATES_DIR, 'shared'))) add('shared/' + rel, fs.readFileSync(path.join(TEMPLATES_DIR, 'shared', rel)));

  add('index.html', fs.readFileSync(path.join(fwDir, 'index.html'), 'utf8')
    .replace('<title>Resume</title>', `<title>${t.name} resume</title>`).replace(/\s*<!--resume-head-->/, ''));
  add('vite.config.js', VITE_CONFIG[framework]);
  const pkg = JSON.parse(fs.readFileSync(path.join(fwDir, 'package.json'), 'utf8'));
  pkg.name = `${t.id}-resume-${framework}`;
  pkg.description = `${t.name} resume template (${t.job}) — ${framework} + SantyCSS`;
  add('package.json', JSON.stringify(pkg, null, 2) + '\n');
  add('README.md', readme(t, framework, publicUrl));
  if (t.tier === 'premium') add('LICENSE.txt', LICENSE(t));

  // SantyCSS purged against everything we just packed.
  const content = files.filter(f => /\.(jsx?|vue|html)$/.test(f.name)).map(f => '\n' + f.data.toString());
  const fullCss = fs.readFileSync(path.join(REPO_DIR, 'dist', 'santy.css'), 'utf8');
  const { css } = purge({ css: fullCss, content, minifyOutput: false });
  add('src/santy.css', `/* SantyCSS — purged for the ${t.name} template. Full build: npm i santycss */\n` + css);

  const result = { filename: root.slice(0, -1) + '.zip', buffer: createZip(files) };
  cache.set(key, result);
  return result;
}
