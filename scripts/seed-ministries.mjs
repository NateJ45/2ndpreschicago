// Seeds the ministry collection with the church's four ministry pillars
// (Grow / Serve / Kids / Food), all featured so they populate the home
// "Get involved" next-step row. The church can add finer-grained ministries
// (and nest them via parentMinistry) in the Studio later.
//
// Run: node scripts/seed-ministries.mjs

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
  } catch {
    /* .env optional */
  }
  return env;
}

const env = loadEnv();
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or a write token in .env.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const MINISTRIES = [
  {
    id: 'ministry-grow',
    title: 'Grow',
    audience: 'adults',
    summary: 'Bible study, classes, and small groups to grow your faith alongside others.',
    link: '/grow',
    displayOrder: 1,
  },
  {
    id: 'ministry-serve',
    title: 'Serve',
    audience: 'everyone',
    summary: 'Hands-on ways to serve the congregation and our South Loop neighbors.',
    link: '/serve',
    displayOrder: 2,
  },
  {
    id: 'ministry-kids',
    title: 'Kids & Family',
    audience: 'families',
    summary: 'A warm welcome and real care for children and families, on Sunday and through the week.',
    link: '/kids',
    displayOrder: 3,
  },
  {
    id: 'ministry-food',
    title: 'Food Ministry',
    audience: 'neighbors',
    summary: 'Free food for all who need it, no questions asked, through Lunch Bag and the South Loop Community Table.',
    link: '/food',
    displayOrder: 4,
  },
];

async function run() {
  for (const m of MINISTRIES) {
    const doc = {
      _id: m.id,
      _type: 'ministry',
      title: m.title,
      audience: m.audience,
      season: 'Year-round',
      summary: m.summary,
      link: m.link,
      featured: true,
      displayOrder: m.displayOrder,
    };
    await client.createOrReplace(doc);
    console.log(`  upserted ${m.id} — ${m.title}`);
  }
  console.log(`\nDone. Seeded ${MINISTRIES.length} ministries (all featured).`);
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
