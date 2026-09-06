// scripts/inspect-settings.mjs
//
// READ-ONLY diagnostic. Prints which siteSettings fields are populated vs empty
// in the live dataset (published + draft), so we know what must be migrated into
// Sanity before the hardcoded site.ts fallbacks are removed.
//
// Run: node scripts/inspect-settings.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

import { loadEnv } from './lib/loadEnv.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('Need PUBLIC_SANITY_PROJECT_ID + a token in .env');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

// Fields the refactor cares about, grouped by how empty should be treated.
const REQUIRED = [
  'title',
  'tagline',
  'email',
  'phone',
  'addressLine',
  'cityStateZip',
  'socialInstagram',
  'socialFacebook',
  'socialYoutube',
];
const OPTIONAL = [
  'mission',
  'officeHours',
  'giveUrl',
  'watchUrl',
  'appUrl',
  'directoryUrl',
  'prayerUrl',
  'registrationBaseUrl',
  'footerCredit',
  'footerCreditUrl',
];

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

function show(v) {
  if (isEmpty(v)) return '(empty)';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

async function run() {
  const published = await client.fetch(`*[_type == "siteSettings"][0]`);
  const draft = await client.fetch(`*[_id == "drafts.siteSettings"][0]`);
  const doc = published ?? draft;

  console.log(`\nProject ${projectId}/${dataset}`);
  console.log(`published siteSettings: ${published ? 'yes (id ' + published._id + ')' : 'NONE'}`);
  console.log(`draft siteSettings:     ${draft ? 'yes' : 'none'}\n`);

  if (!doc) {
    console.log('No siteSettings document found at all.');
    return;
  }

  console.log('REQUIRED (fallback removal would blank these if empty):');
  for (const f of REQUIRED) console.log(`  ${isEmpty(doc[f]) ? 'X' : 'OK'}  ${f}: ${show(doc[f])}`);

  console.log('\nworshipService:');
  const ws = doc.worshipService ?? {};
  for (const f of ['time', 'day', 'startTime24', 'endTime24'])
    console.log(`  ${isEmpty(ws[f]) ? 'X' : 'OK'}  worshipService.${f}: ${show(ws[f])}`);

  console.log('\nOPTIONAL (empty is allowed; element hides):');
  for (const f of OPTIONAL)
    console.log(`  ${isEmpty(doc[f]) ? '--' : 'OK'}  ${f}: ${show(doc[f])}`);

  console.log('\nfavicon:', show(doc.favicon ? { present: true } : null));
  console.log(
    'navItems:',
    Array.isArray(doc.navItems)
      ? doc.navItems.length + ' item(s)'
      : '(empty -> built-in default menu)',
  );
  console.log(
    'footerColumns:',
    Array.isArray(doc.footerColumns)
      ? doc.footerColumns.length + ' column(s)'
      : '(empty -> built-in default columns)',
  );
}

run().catch((e) => {
  console.error('Inspect failed:', e.message);
  process.exit(1);
});
