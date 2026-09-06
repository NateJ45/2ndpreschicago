// scripts/seed-page-lists.mjs
//
// Pre-fills the newly-added Sanity page list/object fields with the exact
// content currently hardcoded in each page template's FALLBACK_ const. The
// site already renders this content via those fallbacks; seeding it makes the
// same content editable and visible in the Studio (the fallbacks only render
// when a field is empty, so the page is byte-identical until an editor edits).
//
// Idempotent + non-destructive: every write is setIfMissing, so a field an
// editor has already populated is left untouched. Re-running is safe.
//
// Patches both the published id (<id>) and its draft (drafts.<id>) for each
// singleton, so the Studio shows the seeded content whether or not a draft
// exists. A missing draft surfaces as a 404 on commit, which is caught and
// treated as a no-op.
//
// Source of truth for each value (copied VERBATIM):
//   weddingsPage.weddingFaqs / weddingPricing  <- src/pages/weddings.astro
//   growPage.groups                            <- src/pages/grow.astro
//   servePage.ways                             <- src/pages/serve.astro
//   useOurSpacePage.uses                       <- src/pages/use-our-space.astro
//   contactPage.contactReasons                 <- src/pages/contact.astro (emails
//                                                  inlined from src/data/site.ts)
//   beliefsPage.resources                      <- src/pages/what-we-believe.astro
//   homePage.serviceBand / weeklyRhythms       <- src/pages/index.astro
//
// Run: node scripts/seed-page-lists.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

import { loadEnv } from './lib/loadEnv.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;

if (!projectId || !token) {
  console.error(
    'Missing PUBLIC_SANITY_PROJECT_ID or a write token (SANITY_API_WRITE_TOKEN) in .env.',
  );
  console.error('Schema + UI still ship; the pages fall back to their built-in starter content.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// Tag each array-of-objects item with its schema member _type + a stable,
// unique _key. The member names are verified against the schema files
// (studio/schemaTypes/{churchPages,contactPage,homePage}.ts).
function members(field, type, rows) {
  return rows.map((row, i) => ({ _type: type, _key: `${field}-${i}`, ...row }));
}

// Literal contact emails inlined from src/data/site.ts (no code refs in seeded data):
//   site.contact.email       -> office@secondpreschicago.org
//   site.contact.pastorEmail -> pastorchesna@secondpreschicago.org
const OFFICE_EMAIL = 'office@secondpreschicago.org';
const PASTOR_EMAIL = 'pastorchesna@secondpreschicago.org';

// One entry per singleton: its document id + the fields to seed. Object fields
// (serviceBand) and plain-string arrays (uses) carry no _key/_type.
const PAGES = [
  {
    id: 'weddingsPage',
    fields: {
      // weddingsPage.weddingFaqs -> defineArrayMember name 'weddingFaq' (q, a)
      weddingFaqs: members('weddingFaqs', 'weddingFaq', [
        {
          q: 'Who can get married at Second?',
          a: 'We welcome gay and straight couples. Because the sanctuary is a consecrated space, religious ceremonies must be Christian. Nonreligious ceremonies are welcome as long as they are respectful of the space and its purpose. There is no dress code.',
        },
        {
          q: 'What about music?',
          a: "Our Music Director's services are built into a typical wedding package, which may include our exceptional 1917 Austin organ and a piano. Recorded music is available through a CD player or aux cable. The organ predates standardized pitch, so any instrument played with it must be tuned down to match.",
        },
        {
          q: 'Can we use our own officiant?',
          a: 'Yes. We require premarital counseling for couples married in our sanctuary. Our pastor is glad to officiate Christian weddings, and that fee is waived for members of the congregation.',
        },
        {
          q: 'Can we celebrate communion?',
          a: 'Ordained Protestant clergy of the sacramental tradition (Presbyterian, Anglican, Methodist, Lutheran, and certain other evangelical churches) may preside at communion with the special permission of the church Session.',
        },
        {
          q: 'How many guests can the sanctuary hold?',
          a: 'The main floor of the sanctuary seats 600 people, with additional balcony seating should you need it.',
        },
        {
          q: 'What support and spaces are included?',
          a: 'A Wedding Coordinator assists at the rehearsal and the ceremony. The Bridal Parlor and North Parlor are included for preparation. Parking accommodates 18 vehicles, with more public options nearby, and the sanctuary is accessible.',
        },
        {
          q: 'Is there space for a reception?',
          a: 'Our Fellowship Hall may be rented for an additional fee. Please note that it is a carpeted space.',
        },
      ]),
      // weddingsPage.weddingPricing -> defineArrayMember name 'weddingPriceRow' (item, price)
      weddingPricing: members('weddingPricing', 'weddingPriceRow', [
        { item: 'Standard package (rehearsal plus 3 hours of wedding-day use)', price: '$1,500' },
        { item: 'Officiant', price: '$500' },
        { item: 'Premarital counseling only', price: '$250' },
        { item: 'Live stream of the ceremony', price: '$250' },
      ]),
    },
  },
  {
    id: 'growPage',
    fields: {
      // growPage.groups -> defineArrayMember name 'communityGroup' (name, when, where, body)
      groups: members('groups', 'communityGroup', [
        {
          name: 'Mid-Morning Bible Study',
          when: 'First and third Thursdays, 10am',
          where: "The Pastor's Office",
          body: 'Read through books of the Bible together over coffee.',
        },
        {
          name: 'Theology on Tap',
          when: 'Third Thursdays, 7pm',
          where: 'Rotating neighborhood pubs',
          body: 'Read short pieces of theological writing over drinks and good conversation.',
        },
        {
          name: 'Alpha to Omega Bible Reading Group',
          when: 'Thursdays, 5pm to 6pm',
          where: 'By conference call',
          body: 'Read through the whole Bible together, a stretch at a time.',
        },
        {
          name: 'Second Church Book Group',
          when: 'Select Sundays, 9:30am',
          where: 'At the church',
          body: 'Read and discuss a book together before worship.',
        },
      ]),
    },
  },
  {
    id: 'servePage',
    fields: {
      // servePage.ways -> defineArrayMember name 'serveWay' (name, href, body)
      ways: members('ways', 'serveWay', [
        {
          name: 'Food ministry',
          href: '/food',
          body: 'Help pack and hand out Lunch Bags, or host the South Loop Community Table alongside Care for Friends. This is the heart of how we serve our neighbors.',
        },
        {
          name: 'Sunday hospitality',
          href: '/worship',
          body: 'Welcome visitors, help with coffee and fellowship, and make sure everyone who walks in feels at home.',
        },
        {
          name: 'Neighborhood events',
          href: '/events',
          body: 'Lend a hand at gatherings like the South Michigan Avenue Block Fest, free and open to all our neighbors.',
        },
      ]),
    },
  },
  {
    id: 'useOurSpacePage',
    fields: {
      // useOurSpacePage.uses -> array of plain strings (no _key/_type)
      uses: [
        'Youth sports',
        'Board meetings',
        'Worship',
        'Meal programs',
        'Social services',
        'Speakers',
        'Concerts',
        'Performance rehearsals',
        'Parties',
        '12-step groups',
      ],
    },
  },
  {
    id: 'contactPage',
    fields: {
      // contactPage.contactReasons -> defineArrayMember name 'contactReason' (label, value, href)
      // Emails inlined from site.ts (office@secondpreschicago.org / pastorchesna@secondpreschicago.org).
      contactReasons: members('contactReasons', 'contactReason', [
        { label: 'General questions', value: OFFICE_EMAIL, href: `mailto:${OFFICE_EMAIL}` },
        { label: 'Pastoral care', value: PASTOR_EMAIL, href: `mailto:${PASTOR_EMAIL}` },
        { label: 'Weddings', value: 'See wedding details', href: '/weddings' },
        { label: 'Use our space', value: 'Inquire about the building', href: '/use-our-space' },
      ]),
    },
  },
  {
    id: 'beliefsPage',
    fields: {
      // beliefsPage.resources -> defineArrayMember name 'beliefsResource' (label, href, external)
      resources: members('resources', 'beliefsResource', [
        { label: 'Community groups at Second', href: '/grow', external: false },
        {
          label: 'Lectio 365',
          href: 'https://www.24-7prayer.com/resource/lectio-365/',
          external: true,
        },
        { label: 'BibleProject', href: 'https://bibleproject.com/', external: true },
        { label: 'Practicing the Way', href: 'https://practicingtheway.org/', external: true },
      ]),
    },
  },
  {
    id: 'homePage',
    fields: {
      // homePage.serviceBand -> single object (subfield names match the schema;
      // no _key). The "Where" address is not seeded; it comes from site.ts.
      serviceBand: {
        worshipLabel: 'Sunday Worship',
        worshipTime: '11am, every Sunday',
        joinLabel: 'How to join',
        joinNote: 'In person and online. Communion the first Sunday of each month.',
        whereLabel: 'Where',
      },
      // homePage.weeklyRhythms -> defineArrayMember name 'weeklyRhythm' (label, time)
      // (the en dashes below are display punctuation in schedule ranges)
      weeklyRhythms: members('weeklyRhythms', 'weeklyRhythm', [
        { label: 'Sunday Worship', time: 'Sundays, 11am' },
        { label: 'Lunch Bag', time: 'Tue–Thu, 11am–1pm' },
        { label: 'South Loop Community Table', time: 'Sundays, 6:45pm' },
        { label: 'Mid-Morning Bible Study', time: 'Thursdays, 10am' },
      ]),
    },
  },
];

// setIfMissing on one document id; swallow the 404 a missing draft throws.
async function patchDoc(id, fields, label) {
  try {
    await client.patch(id).setIfMissing(fields).commit();
    console.log(`  patched ${label}`);
  } catch (e) {
    if (e?.statusCode === 404) {
      console.log(`  skipped ${label} (document does not exist)`);
      return;
    }
    throw e;
  }
}

async function run() {
  console.log(`Seeding page list fields to ${projectId}/${dataset} (setIfMissing)...\n`);

  for (const page of PAGES) {
    const fieldNames = Object.keys(page.fields);
    console.log(`${page.id}: ${fieldNames.length} field(s) -> ${fieldNames.join(', ')}`);
    await patchDoc(page.id, page.fields, page.id);
    await patchDoc(`drafts.${page.id}`, page.fields, `drafts.${page.id}`);
  }

  const totalFields = PAGES.reduce((n, p) => n + Object.keys(p.fields).length, 0);
  console.log(`\nDone. Seeded ${totalFields} field(s) across ${PAGES.length} page singletons.`);
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
