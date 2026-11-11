// Catalog + sample data for every template. The download packager replaces
// this file with a single-template version.
import catalog from '@data/catalog.json';

const mods = import.meta.glob('../../samples/*.json', { eager: true, import: 'default' });
export const samples = Object.fromEntries(
  Object.entries(mods).map(([p, v]) => [p.split('/').pop().replace('.json', ''), v]),
);
export { catalog };
