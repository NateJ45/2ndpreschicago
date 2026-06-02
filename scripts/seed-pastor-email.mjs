// scripts/seed-pastor-email.mjs
//
// One-time migration: move the pastoral-care email into Sanity
// siteSettings.pastorEmail. It used to be a hardcoded constant in
// src/data/site.ts (site.contact.pastorEmail), which has now been deleted, so
// the value has to live in Sanity for the Contact / Pastors & Staff / Use Our
// Space pages to keep showing the distinct pastoral address (otherwise the
// resolver falls back to the public office email).
//
// Run: node scripts/seed-pastor-email.mjs

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
const token = env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) { console.error('Need PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env'); process.exit(1); }

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

const PASTOR_EMAIL = 'pastorchesna@secondpreschicago.org';

async function run() {
  console.log(`Setting siteSettings.pastorEmail = ${PASTOR_EMAIL} on ${projectId}/${dataset}\n`);
  for (const id of ['siteSettings', 'drafts.siteSettings']) {
    try {
      await client.patch(id).set({ pastorEmail: PASTOR_EMAIL }).commit();
      console.log(`  set on ${id}`);
    } catch (e) {
      if (e?.statusCode === 404) { console.log(`  skipped ${id} (no document)`); continue; }
      throw e;
    }
  }
  console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
