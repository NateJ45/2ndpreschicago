import { loadEnv } from './lib/loadEnv.mjs';
// Seeds the starter FAQ questions as faqItem documents, grouped into the same
// categories the FAQ Page singleton orders by.
//
// Idempotent: each question uses a fixed _id + createOrReplace, so re-running
// refreshes the starter set to these defaults. Run this ONCE at setup. After an
// editor starts curating questions in the Studio, do NOT re-run it (createOrReplace
// would reset their edits on these seeded docs).
//
// The FAQ page reads these via getFaqPage(); when the collection is empty (e.g.
// Sanity not configured) the page falls back to a built-in copy of this set, so
// it is never broken or empty.
//
// Run: node scripts/seed-faq-items.mjs

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
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or a write token (SANITY_API_WRITE_TOKEN) in .env.');
  console.error('Schema + UI still ship; the FAQ page falls back to its built-in starter questions.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// Wrap a plain answer string in a single Portable Text paragraph block.
function paragraph(text) {
  return [
    {
      _type: 'block',
      _key: 'a',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 's', text, marks: [] }],
    },
  ];
}

// displayOrder is per-category (lower shows first within its group). Categories
// must match the option values on faqItem.category and the FAQ Page categoryOrder.
const ITEMS = [
  {
    id: 'faq-item-1',
    category: 'Visiting',
    displayOrder: 1,
    question: 'What time is worship?',
    answer:
      'Worship is every Sunday at 11am, and it usually runs about an hour and fifteen minutes. We are at 1936 South Michigan Avenue in the South Loop.',
  },
  {
    id: 'faq-item-2',
    category: 'Visiting',
    displayOrder: 2,
    question: 'Where do I park?',
    answer:
      'We sit on Michigan Avenue close to public transit, with first-come, first-served free parking. There are additional public parking options nearby.',
  },
  {
    id: 'faq-item-3',
    category: 'Visiting',
    displayOrder: 3,
    question: 'Do I have to be a member, or a Christian, to come?',
    answer:
      'Not at all. Whether you are a weekly churchgoer, have not been in ages, or do not know anything about Christianity, there is a place for you here. Everyone is welcome.',
  },
  {
    id: 'faq-item-4',
    category: 'Worship',
    displayOrder: 1,
    question: 'I have never been here. What should I expect?',
    answer:
      'Our service is traditional and liturgical, with hymns, spirituals, and anthems led by organ and choir. We share communion on the first Sunday of each month. Casual attire is always welcome.',
  },
  {
    id: 'faq-item-5',
    category: 'Worship',
    displayOrder: 2,
    question: 'Can I watch online?',
    answer:
      'Yes. We livestream worship on our YouTube channel, so you can join from anywhere.',
  },
  {
    id: 'faq-item-6',
    category: 'Kids & Family',
    displayOrder: 1,
    question: 'Can I bring my kids?',
    answer:
      "Please do. Little ones are part of the worshipping congregation, and we welcome their noise and their needs. There is a children's message during the service, plus books and quiet toys, and a cry room with an audio stream if you need it.",
  },
  {
    id: 'faq-item-7',
    category: 'Giving',
    displayOrder: 1,
    question: 'How do I give?',
    answer:
      'You can give online through our secure giving portal, by mail with a check, or designate your gift to the food ministry. Visit the Give page to get started.',
  },
  {
    id: 'faq-item-8',
    category: 'Weddings & Space',
    displayOrder: 1,
    question: 'Can I get married at Second?',
    answer:
      'Yes. We welcome gay and straight couples to marry in our historic sanctuary. See the Weddings page for details, pricing, and how to inquire about your date.',
  },
  {
    id: 'faq-item-9',
    category: 'Weddings & Space',
    displayOrder: 2,
    question: 'Can my group use the building?',
    answer:
      'Often, yes. We host all sorts of gatherings throughout the week. See the Use Our Space page and get in touch about fees and availability.',
  },
  {
    id: 'faq-item-10',
    category: 'Food Ministry',
    displayOrder: 1,
    question: 'I need food. How does that work?',
    answer:
      'Find free food for all in need, no questions asked, at our Cullerton door. Lunch Bag runs Tuesday through Thursday from 11am to 1pm, and the South Loop Community Table gathers on Sunday evenings.',
  },
];

async function run() {
  for (const item of ITEMS) {
    const doc = {
      _id: item.id,
      _type: 'faqItem',
      question: item.question,
      answer: paragraph(item.answer),
      category: item.category,
      displayOrder: item.displayOrder,
    };
    await client.createOrReplace(doc);
    console.log(`  upserted ${item.id} (${item.category} #${item.displayOrder}) ${item.question}`);
  }

  console.log(`\nDone. Seeded ${ITEMS.length} FAQ questions.`);
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
