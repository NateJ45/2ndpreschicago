// scripts/seed-nav.mjs
//
// Seeds siteSettings.navItems (header menu) + footerColumns (footer link columns)
// with the EXACT current built-in menus from Header.astro (FALLBACK_NAV_ITEMS)
// and Footer.astro (FALLBACK_FOOTER_COLUMNS). Until now those Studio fields were
// blank and the site ran on the code fallbacks, so an editor opening Navigation
// saw nothing. Seeding makes the menus live in Sanity (the source of truth);
// the code fallback stays only as a safety net. Byte-identical on the live site.
//
// Idempotent (setIfMissing). Run: node scripts/seed-nav.mjs

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

const link = (key, label, href) => ({ _type: 'navLink', _key: key, label, href });
const sub = (key, label, href) => ({ _type: 'navSubLink', _key: key, label, href });
const group = (key, label, links) => ({ _type: 'navGroup', _key: key, label, links });
const fLink = (key, label, href) => ({ _type: 'footerLink', _key: key, label, href });
const col = (key, title, links) => ({ _type: 'footerColumn', _key: key, title, links });

// Mirrors Header.astro FALLBACK_NAV_ITEMS exactly.
const navItems = [
  link('n0', "I'm New", '/worship'),
  group('n1', 'About Us', [
    sub('n1a', 'What We Believe', '/what-we-believe'),
    sub('n1b', 'Music', '/music'),
    sub('n1c', 'Pastors & Staff', '/pastor-staff'),
  ]),
  group('n2', 'Get Involved', [
    sub('n2a', 'Grow', '/grow'),
    sub('n2b', 'Serve', '/serve'),
    sub('n2c', 'Kids', '/kids'),
    sub('n2d', 'Food Ministry', '/food'),
  ]),
  link('n3', 'Watch', '/sermons'),
  link('n4', 'Events', '/events'),
  group('n5', 'Space', [
    sub('n5a', 'Use Our Space', '/use-our-space'),
    sub('n5b', 'Weddings', '/weddings'),
    sub('n5c', 'Friends of Historic Second Church', 'https://www.historicsecondchurch.org/'),
  ]),
  link('n6', 'Contact', '/contact'),
];

// Mirrors Footer.astro FALLBACK_FOOTER_COLUMNS exactly (Connect = CONNECT_LINKS;
// the optional app/directory/prayer integrations are unset, so nothing appended).
const footerColumns = [
  col('c0', 'Visit', [
    fLink('c0a', 'Plan a Visit', '/worship'),
    fLink('c0b', 'Watch Sermons', '/sermons'),
    fLink('c0c', 'What We Believe', '/what-we-believe'),
    fLink('c0d', 'Music', '/music'),
    fLink('c0e', 'Events', '/events'),
  ]),
  col('c1', 'Get Involved', [
    fLink('c1a', 'Grow', '/grow'),
    fLink('c1b', 'Serve', '/serve'),
    fLink('c1c', 'Kids', '/kids'),
    fLink('c1d', 'Food Ministry', '/food'),
  ]),
  col('c2', 'Connect', [
    fLink('c2a', 'Pastors & Staff', '/pastor-staff'),
    fLink('c2b', 'Use Our Space', '/use-our-space'),
    fLink('c2c', 'Weddings', '/weddings'),
    fLink('c2d', 'Contact', '/contact'),
    fLink('c2e', 'Give', '/give'),
  ]),
];

async function patch(id, label) {
  try {
    await client.patch(id).setIfMissing({ navItems, footerColumns }).commit();
    console.log(`  patched ${label}`);
  } catch (e) {
    if (e?.statusCode === 404) { console.log(`  skipped ${label} (no document)`); return; }
    throw e;
  }
}

async function run() {
  console.log(`Seeding nav menus to ${projectId}/${dataset} (setIfMissing)...\n`);
  await patch('siteSettings', 'siteSettings');
  await patch('drafts.siteSettings', 'drafts.siteSettings');
  console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
