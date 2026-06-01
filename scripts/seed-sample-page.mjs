// QA helper: create (or delete) a sample custom `page` exercising every block
// type, so the /[slug] route + Sections renderer can be verified end to end.
//
//   node scripts/seed-sample-page.mjs          # create published sample at /sample-page
//   node scripts/seed-sample-page.mjs --delete # remove it
//
// Not part of the seed flow; safe to delete this file.

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
const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
  token: env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const ID = 'page-sample-qa';

if (process.argv.includes('--delete')) {
  await client.delete(ID).catch(() => {});
  console.log('deleted sample page');
  process.exit(0);
}

const k = (n) => ({ _key: n });

await client.createOrReplace({
  _id: ID,
  _type: 'page',
  title: 'Sample Page',
  slug: { _type: 'slug', current: 'sample-page' },
  heroEyebrow: 'Sample',
  heroHeadline: 'Page builder demo',
  heroSubhead: 'Every block type, rendered from Sanity.',
  sections: [
    {
      _type: 'sectionRichText', ...k('a'), eyebrow: 'About', heading: 'A text section', align: 'left',
      body: [{ _type: 'block', _key: 'b1', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's1', text: 'This is a rich text block with a paragraph of body copy.', marks: [] }] }],
    },
    {
      _type: 'sectionCardGrid', ...k('b'), heading: 'Three cards', columns: '3',
      cards: [
        { _type: 'card', _key: 'c1', title: 'First', body: 'Card one body.' },
        { _type: 'card', _key: 'c2', title: 'Second', body: 'Card two body.' },
        { _type: 'card', _key: 'c3', title: 'Third', body: 'Card three body.' },
      ],
    },
    { _type: 'sectionQuote', ...k('c'), quote: 'We are called to an everlasting preoccupation with God.', attribution: 'A.W. Tozer' },
    { _type: 'sectionCtaBand', ...k('d'), eyebrow: 'Come and See', headline: 'Join us this Sunday', subhead: 'Worship at 11am.', ctaLabel: 'Plan a Visit', ctaUrl: '/worship' },
    {
      _type: 'sectionFeatureCards', ...k('e'), heading: 'Detailed feature cards', columns: '3', arched: false,
      cards: [
        { _type: 'featureCard', _key: 'fc1', eyebrow: 'Weekly', title: 'Bible study', body: 'Thursday mornings over coffee.', badge: 'New', ctaLabel: 'Learn more', ctaUrl: '/grow' },
        { _type: 'featureCard', _key: 'fc2', title: 'Lunch Bag', body: 'Grab-and-go food, no questions asked.' },
        { _type: 'featureCard', _key: 'fc3', title: 'Music', body: 'A professional quartette and a 1917 organ.' },
      ],
    },
    {
      _type: 'sectionStats', ...k('f'), heading: 'By the numbers', columns: '3',
      background: { tone: 'chapel', overlay: 55, padding: 'normal' },
      items: [
        { _type: 'stat', _key: 's1', value: '1901', label: 'Sanctuary rebuilt' },
        { _type: 'stat', _key: 's2', value: '9', label: 'Tiffany windows' },
        { _type: 'stat', _key: 's3', value: '600', label: 'Seats', note: 'plus balcony' },
      ],
    },
    {
      _type: 'sectionAccordion', ...k('g'), heading: 'Common questions',
      items: [
        { _type: 'qa', _key: 'q1', question: 'What time is worship?', answer: 'Sundays at 11am.' },
        { _type: 'qa', _key: 'q2', question: 'Is there parking?', answer: 'Yes, free first-come parking.' },
      ],
    },
  ],
});
console.log('created sample page at /sample-page');
