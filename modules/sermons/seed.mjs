// modules/sermons/seed.mjs
//
// Seeds the sermonsPage singleton + a couple of example sermons. The examples
// have no videoUrl so nothing renders broken; the church replaces them with
// real messages (and pastes the YouTube/Vimeo link). Idempotent.
//
// Prerequisites: PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

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

if (!projectId) { console.log('PUBLIC_SANITY_PROJECT_ID is not set. Configure .env and re-run.'); process.exit(0); }
if (!token) { console.log('SANITY_API_WRITE_TOKEN is not set. A write token is required to seed.'); process.exit(0); }

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

let _k = 0;
const key = () => `seed-sm-${(_k += 1)}`;
const pt = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });

const docs = [];

docs.push({
  _id: 'sermonsPage',
  _type: 'sermonsPage',
  seoTitle: 'Sermons',
  seoDescription: 'Watch and listen to messages from Second Presbyterian Church of Chicago, and join Sunday worship online.',
  heroEyebrow: 'Sermons',
  heroHeadline: 'Messages from Second',
  heroSubhead: 'Sunday worship is preached from the Word and shared online. Catch up on a recent message or join us live.',
  livestreamUrl: 'https://www.youtube.com/@secondpreschicago',
});

docs.push({
  _id: 'sermon-example-1',
  _type: 'sermon',
  title: 'Serving and Celebrating Jesus',
  slug: { _type: 'slug', current: 'serving-and-celebrating-jesus' },
  date: '2026-05-24T11:00:00-05:00',
  speaker: 'Rev. Chesna Hinkley',
  scripture: 'Matthew 5:14-16',
  featured: true,
  description: [pt('An example sermon. Replace this with a real message and paste the YouTube or Vimeo link into the Video URL field so it plays here.')],
});

docs.push({
  _id: 'sermon-example-2',
  _type: 'sermon',
  title: 'A Light in the City',
  slug: { _type: 'slug', current: 'a-light-in-the-city' },
  date: '2026-05-17T11:00:00-05:00',
  speaker: 'Rev. Chesna Hinkley',
  scripture: 'Isaiah 60:1-3',
  description: [pt('An example sermon. Replace with a real message and video link.')],
});

async function seed() {
  console.log(`Seeding ${docs.length} sermon documents to ${projectId}/${dataset}...`);
  let created = 0, replaced = 0;
  for (const doc of docs) {
    try {
      const existing = await client.fetch(`*[_id == $id][0]._id`, { id: doc._id });
      await client.createOrReplace(doc);
      existing ? (replaced += 1) : (created += 1);
      console.log(`  ${existing ? 'replaced' : 'created '}  ${doc._type}  ${doc._id}`);
    } catch (err) {
      console.error(`  ERROR on ${doc._id}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${created} created, ${replaced} replaced.`);
}

seed();
