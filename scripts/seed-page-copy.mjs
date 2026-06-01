// scripts/seed-page-copy.mjs
//
// Pre-fills every page singleton's body-copy text fields with the EXACT copy
// currently hardcoded as the inline fallback in each src/pages/*.astro template
// (data in scripts/page-copy.json, extracted verbatim from those templates).
// The site already renders this copy via the fallbacks, so seeding it is
// byte-identical on the live site; the win is that the Studio now SHOWS the
// real copy in every field instead of a blank input, so editors can actually
// edit it. This is the data half of the content-editability remediation.
//
// Idempotent + non-destructive: every write is setIfMissing, so any field an
// editor (or an earlier seed) has already populated is left untouched. Patches
// the published id and its draft; a missing draft 404 is caught as a no-op.
//
// Run: node scripts/seed-page-copy.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf-8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* .env optional */ }
  return env;
}

const env = loadEnv();
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or a write token (SANITY_API_WRITE_TOKEN) in .env.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const COPY = JSON.parse(readFileSync(resolve(__dirname, 'page-copy.json'), 'utf-8'));

async function patchDoc(id, fields, label) {
  try {
    await client.patch(id).setIfMissing(fields).commit();
    console.log(`  patched ${label}`);
  } catch (e) {
    if (e?.statusCode === 404) { console.log(`  skipped ${label} (no document)`); return; }
    throw e;
  }
}

async function run() {
  console.log(`Seeding page copy to ${projectId}/${dataset} (setIfMissing)...\n`);
  let totalFields = 0;
  for (const [id, fields] of Object.entries(COPY)) {
    const names = Object.keys(fields);
    totalFields += names.length;
    console.log(`${id}: ${names.length} field(s)`);
    await patchDoc(id, fields, id);
    await patchDoc(`drafts.${id}`, fields, `drafts.${id}`);
  }
  console.log(`\nDone. Seeded ${totalFields} field(s) across ${Object.keys(COPY).length} singletons.`);
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
