// scripts/seed-section-images.mjs
//
// Uploads the bundled in-body section photos into Sanity and sets the new
// per-page section-image fields, so the Studio SHOWS the current photo (an
// editor can swap it) instead of a blank image picker. The site already renders
// these same photos as code fallbacks; seeding moves the source of truth into
// Sanity. Also seeds siteSettings.officeHours from the value in src/data/site.ts.
//
// Idempotent + non-destructive: Sanity dedupes identical uploads by hash, and
// every write is setIfMissing, so re-running is safe and editor edits are kept.
//
// Run: node scripts/seed-section-images.mjs

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

import { loadEnv } from './lib/loadEnv.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');


const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) { console.error('Need PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env'); process.exit(1); }

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });
const assetsDir = resolve(root, 'src', 'assets');

const cache = new Map();
async function uploadImage(file) {
  if (cache.has(file)) return cache.get(file);
  const asset = await client.assets.upload('image', readFileSync(resolve(assetsDir, file)), { filename: file });
  cache.set(file, asset._id);
  return asset._id;
}
const img = (assetId, alt) => ({ _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt });

// One per (singleton, field): the bundled file + the alt currently hardcoded on
// that page's <Image>. Verified against the page templates.
const IMAGES = [
  { id: 'homePage', field: 'welcomeImage', file: 'sanctuary-interior.webp', alt: 'Inside the sanctuary at Second Presbyterian, with its Tiffany windows and Arts and Crafts ceiling' },
  { id: 'aboutPage', field: 'featureImage', file: 'angel-murals.jpg', alt: 'The painted choir of angels on the sanctuary ceiling that gives the church its nickname' },
  { id: 'aboutPage', field: 'buildingImage', file: 'sanctuary-interior.webp', alt: 'The nave of Second Presbyterian, lined with Tiffany windows beneath the Arts and Crafts ceiling' },
  { id: 'worshipPage', field: 'childrenImage', file: 'tiffany-windows.webp', alt: 'Three Tiffany landscape windows of trees and hills in the sanctuary' },
  { id: 'musicPage', field: 'organImage', file: 'mural-angels.jpg', alt: "A painted panel of angels with instruments in the sanctuary's Arts and Crafts decoration" },
];

async function patchSetIfMissing(id, fields, label) {
  try {
    await client.patch(id).setIfMissing(fields).commit();
    console.log(`  patched ${label}`);
  } catch (e) {
    if (e?.statusCode === 404) { console.log(`  skipped ${label} (no document)`); return; }
    throw e;
  }
}

async function run() {
  console.log(`Seeding section images + officeHours to ${projectId}/${dataset} (setIfMissing)...\n`);
  for (const it of IMAGES) {
    const assetId = await uploadImage(it.file);
    await patchSetIfMissing(it.id, { [it.field]: img(assetId, it.alt) }, `${it.id}.${it.field} (${it.file})`);
    await patchSetIfMissing(`drafts.${it.id}`, { [it.field]: img(assetId, it.alt) }, `drafts.${it.id}.${it.field}`);
  }
  // siteSettings.officeHours, verbatim from src/data/site.ts.
  await patchSetIfMissing('siteSettings', { officeHours: 'Tuesday-Friday, 10am-2pm' }, 'siteSettings.officeHours');
  console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
