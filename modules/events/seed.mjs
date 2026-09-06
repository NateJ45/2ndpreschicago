// modules/events/seed.mjs
//
// Seeds the eventsPage singleton + a set of Event documents for Second
// Presbyterian: the church's weekly rhythms (recurring) plus one example
// one-time event. Idempotent (createOrReplace with deterministic _ids).
//
// Prerequisites: PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env.
// Run after scripts/seed-core.mjs.

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
const key = () => `seed-ev-${(_k += 1)}`;
const pt = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });

const docs = [];

docs.push({
  _id: 'eventsPage',
  _type: 'eventsPage',
  seoTitle: 'Events',
  seoDescription:
    'Worship, study, shared meals, music, and fellowship at Second Presbyterian Church of Chicago. See what is coming up and the rhythms of our week.',
  heroEyebrow: 'Events',
  heroHeadline: 'Upcoming at Second',
  heroSubhead: "There is always something happening here. We're formed in community: worship, fellowship, study, art, and food.",
});

// Recurring rhythms.
const recurring = [
  { id: 'event-sunday-worship', title: 'Sunday Worship', category: 'Worship', when: 'Sundays, 11am to 12:15pm', summary: 'A service of word and sacrament. Whoever you are, you are welcome here.' },
  { id: 'event-lunch-bag', title: 'Lunch Bag', category: 'Meals', when: 'Tuesday to Thursday, 11am to 1pm', summary: 'Grab-and-go food for all in need, no questions asked, at our Cullerton door.' },
  { id: 'event-community-table', title: 'South Loop Community Table', category: 'Meals', when: 'Sundays, 6:45pm to 8:30pm', summary: 'A free, sit-down meal hosted with Care for Friends. Pauses for the summer.' },
  { id: 'event-bible-study', title: 'Mid-Morning Bible Study', category: 'Study', when: 'First and third Thursdays, 10am', summary: 'Reading through books of the Bible together over coffee in the pastor\'s office.' },
  { id: 'event-theology-on-tap', title: 'Theology on Tap', category: 'Study', when: 'Third Thursdays, 7pm', summary: 'Short theological readings and conversation at rotating neighborhood pubs.' },
  { id: 'event-alpha-omega', title: 'Alpha to Omega Bible Reading Group', category: 'Study', when: 'Thursdays, 5pm to 6pm', summary: 'Reading through the whole Bible together by conference call.' },
  { id: 'event-book-group', title: 'Second Church Book Group', category: 'Study', when: 'Select Sundays, 9:30am', summary: 'Reading and discussing a book together before worship.' },
];

for (const r of recurring) {
  docs.push({
    _id: r.id,
    _type: 'event',
    title: r.title,
    slug: { _type: 'slug', current: r.id.replace(/^event-/, '') },
    eventType: 'recurring',
    category: r.category,
    scheduleLabel: r.when,
    summary: r.summary,
  });
}

// One example one-time event the church can edit or delete.
docs.push({
  _id: 'event-block-fest',
  _type: 'event',
  title: 'South Michigan Avenue Block Fest',
  slug: { _type: 'slug', current: 'block-fest' },
  eventType: 'oneTime',
  category: 'Special',
  scheduleLabel: 'Saturday, June 27, 11am to 3pm',
  start: '2026-06-27T11:00:00-05:00',
  end: '2026-06-27T15:00:00-05:00',
  summary: 'Free fun for our neighbors of all ages, open to the public.',
  description: [
    pt('Join us on the block for an afternoon of music, food, games, and neighbors. Everyone is welcome, members and strangers alike.'),
  ],
});

async function seed() {
  console.log(`Seeding ${docs.length} event documents to ${projectId}/${dataset}...`);
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
