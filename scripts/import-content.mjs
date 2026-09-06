// One-off importer for the extracted Squarespace content.
// Walks migration-docs/content/*.json (in dependency order), normalizes each
// document, and writes a single NDJSON file. Then it kicks off
// `sanity dataset import` against the configured project.
//
// Run via `node scripts/import-content.mjs`. Idempotent: passing `--replace`
// to the underlying import overwrites existing documents with the same _id.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const contentDir = resolve(root, 'migration-docs/content');
const outDir = resolve(root, 'tmp');
const outPath = resolve(outDir, 'content.ndjson');

// Import order matters because Sanity references resolve at import time.
// Singletons + atomic collections first, then page singletons that reference them.
const FILES = [
  'site-settings.json',
  'philosophy-points.json',
  'testimonials.json',
  'services.json',
  'process-steps.json',
  'faq-items.json',
  'home-page.json',
  'about-page.json',
  'process-page.json',
  'services-page.json',
  'faq-page.json',
  'contact-page.json',
];

function loadDocs(file) {
  const raw = readFileSync(resolve(contentDir, file), 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

const lines = [];
let total = 0;
for (const file of FILES) {
  const docs = loadDocs(file);
  for (const doc of docs) {
    if (!doc._type)
      throw new Error(`Missing _type in ${file}: ${JSON.stringify(doc).slice(0, 80)}…`);
    if (!doc._id) throw new Error(`Missing _id in ${file}: ${JSON.stringify(doc).slice(0, 80)}…`);
    lines.push(JSON.stringify(doc));
    total += 1;
  }
  console.log(`  ${file}: ${docs.length} docs`);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
console.log(`\nWrote ${total} documents to ${outPath}`);

// Run the import. The sanity CLI reads sanity.cli.ts (project id + dataset)
// from the repo root, which is where it lives since the studio folded into this
// package on 2026-09-06.
console.log('\nRunning sanity dataset import...\n');
const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['sanity', 'dataset', 'import', outPath, 'production', '--replace'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
process.exit(result.status ?? 0);
