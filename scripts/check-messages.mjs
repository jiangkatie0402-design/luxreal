// Verifies zh.json and en.json have identical key sets.
import fs from 'node:fs';
const load = (l) => JSON.parse(fs.readFileSync(new URL(`../messages/${l}.json`, import.meta.url)));
const keys = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`],
  );
const zh = new Set(keys(load('zh')));
const en = new Set(keys(load('en')));
const missing = [
  ...[...zh].filter((k) => !en.has(k)).map((k) => `en missing ${k}`),
  ...[...en].filter((k) => !zh.has(k)).map((k) => `zh missing ${k}`),
];
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log(`messages ok (${zh.size} keys)`);
