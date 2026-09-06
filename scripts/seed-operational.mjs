import { loadEnv } from './lib/loadEnv.mjs';
// Seeds a single DISABLED sample announcement so the secretary has a ready
// example to duplicate (Content -> Announcements). Disabled means it never
// shows on the site until someone turns it on. Idempotent (fixed _id).
//
// Run: node scripts/seed-operational.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');


const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or a write token in .env. Create the announcement in the Studio instead.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

async function run() {
  await client.createOrReplace({
    _id: 'announcement-sample',
    _type: 'announcement',
    title: 'Sample — Christmas Eve services',
    message: 'Join us for Christmas Eve worship at 5pm and 11pm.',
    style: 'special',
    link: { label: 'See service times', url: '/events' },
    enabled: false,
  });
  console.log('  upserted sample announcement (disabled)');
  console.log('\nDone. Turn it on or duplicate it in Content -> Announcements.');
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
