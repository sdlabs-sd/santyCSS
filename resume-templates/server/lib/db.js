/**
 * Tiny JSON-file store. Good for a few thousand sites on one instance; swap
 * for Postgres/SQLite behind the same functions when you outgrow it.
 * Writes are serialised and atomic (write temp file → rename).
 */
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

const FILE = path.join(config.dataDir, 'db.json');
const EMPTY = { users: {}, orders: {}, sites: {}, purchases: {}, reservations: {} };

let state = load();
let writing = Promise.resolve();

function load() {
  try {
    return { ...structuredClone(EMPTY), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    return structuredClone(EMPTY);
  }
}

function persist() {
  const snapshot = JSON.stringify(state, null, 2);
  writing = writing.then(async () => {
    await fs.promises.mkdir(config.dataDir, { recursive: true });
    const tmp = FILE + '.' + process.pid + '.tmp';
    await fs.promises.writeFile(tmp, snapshot);
    await fs.promises.rename(tmp, FILE);
  });
  return writing;
}

/** Run a mutation and persist it. fn receives the live state. */
export async function tx(fn) {
  const result = fn(state);
  await persist();
  return result;
}

export const read = () => state;
export const flush = () => writing;
/** For tests: point at a fresh state. */
export function reset() { state = structuredClone(EMPTY); }
