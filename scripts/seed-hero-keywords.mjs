// One-time seed for the heroKeyword gold-emphasis field (the Highland Park
// "key word in a second color" device, extended from the home hero to the
// interior page heroes).
//
// Safe by construction:
//   - setIfMissing only: never clobbers a keyword an editor already set.
//   - Verifies the keyword actually appears in the page's CURRENT headline
//     (the published Sanity value, else the code default mirrored here)
//     before writing, so a stale keyword can never render unmatched.
//
// Run: node scripts/seed-hero-keywords.mjs            (dry run)
//      node scripts/seed-hero-keywords.mjs --apply    (write)

import { createClient } from '@sanity/client';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const env = loadEnv(root);

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
});

// docId -> { keyword, defaultHeadline } (defaults mirror the page singletons).
// Pages with short or unsuited headlines (give "Thank you", privacy, 404,
// events "Upcoming...", sermons, faq) are deliberately not seeded.
const SEEDS = {
  worshipPage: { keyword: 'place', defaultHeadline: "There's a place for you here." },
  aboutPage: { keyword: 'open door', defaultHeadline: 'A landmark church with an open door' },
  beliefsPage: { keyword: 'faith', defaultHeadline: 'The faith we share' },
  musicPage: { keyword: 'musical life', defaultHeadline: 'Our musical life at Second' },
  staffPage: { keyword: 'people', defaultHeadline: "The people you'll meet at Second" },
  growPage: { keyword: 'Community', defaultHeadline: 'Community Groups at Second' },
  servePage: { keyword: 'neighbors', defaultHeadline: 'Love our neighbors' },
  kidsPage: { keyword: 'welcome', defaultHeadline: 'Children are welcome here' },
  foodPage: {
    keyword: 'no questions asked',
    defaultHeadline: 'Food for all in need, no questions asked',
  },
  useOurSpacePage: { keyword: 'space', defaultHeadline: 'Interested in using space at Second?' },
  weddingsPage: {
    keyword: 'Landmark',
    defaultHeadline: 'Get married in a National Historic Landmark',
  },
  contactPage: { keyword: 'love', defaultHeadline: "We'd love to hear from you" },
};

const APPLY = process.argv.includes('--apply');
const ids = Object.keys(SEEDS);
const docs = await client.fetch(`*[_id in $ids]{ _id, heroHeadline, heroKeyword }`, { ids });
const byId = Object.fromEntries(docs.map((d) => [d._id, d]));

let writes = 0;
for (const [id, { keyword, defaultHeadline }] of Object.entries(SEEDS)) {
  const doc = byId[id];
  if (!doc) {
    console.log(`SKIP ${id}: no published document`);
    continue;
  }
  if (doc.heroKeyword) {
    console.log(`SKIP ${id}: heroKeyword already set ("${doc.heroKeyword}")`);
    continue;
  }
  const headline = doc.heroHeadline || defaultHeadline;
  if (!headline.includes(keyword)) {
    console.log(`SKIP ${id}: "${keyword}" not in current headline "${headline}"`);
    continue;
  }
  console.log(
    `${APPLY ? 'SET ' : 'WOULD SET'} ${id}.heroKeyword = "${keyword}"  (headline: "${headline}")`,
  );
  if (APPLY) {
    await client.patch(id).setIfMissing({ heroKeyword: keyword }).commit();
    writes += 1;
  }
}
console.log(
  APPLY ? `\nDone: ${writes} documents patched.` : '\nDry run only. Re-run with --apply to write.',
);
