// Foundation, edit with care
// Generates one OG PNG per page at public/og/<route-slug>.png, matching the
// per-route convention in BaseLayout (the pathname with slashes turned into
// dashes; falls back to og-default.png when a route has no matching file).
//
// Covers the core route singletons. When your project adds dynamic collections
// (blog posts, case studies, etc.) extend COLLECTIONS below with the matching
// Sanity _type, prefix, and field names.
//
// Run via `npm run og:pages` after editing seoTitle in Sanity or after adding a
// page. Output PNGs are committed to git so Cloudflare does not need Sanity
// access at build time. BaseLayout picks the right PNG per pathname; anything
// without a file gracefully falls back to og-default.png.

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { renderOg } from './lib/render-og.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ---- Read env (.env or process.env) -------------------------------------


const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
// This dataset filters anonymous reads down to the page singletons only; a read
// token is needed to see the collections (projects, journal entries, guides),
// exactly as src/lib/sanity.ts does at build time. Falls back to the write
// token, which can also read. Without any token, only the singletons render.
const readToken = env.SANITY_API_READ_TOKEN || env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('PUBLIC_SANITY_PROJECT_ID not set. Skipping page OG generation.');
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Token reads disable the CDN (Sanity rejects token + useCdn:true).
  useCdn: !readToken,
  perspective: 'published',
  ...(readToken ? { token: readToken } : {}),
});

const outDir = resolve(root, 'public/og');

// Business name for the OG wordmark. Reads SITE_NAME from env first so CI can
// override without touching source; falls back to the value in src/data/site.ts
// (hard-coded here to avoid a TypeScript import from a plain .mjs script).
// Update this default when you replace the starter identity in src/data/site.ts.
const WORDMARK = env.SITE_NAME ?? 'Second Presbyterian';

import { loadEnv } from './lib/loadEnv.mjs';
let count = 0;
async function render(slug, tagline) {
  await renderOg({ wordmark: WORDMARK, tagline, outPath: resolve(outDir, `${slug}.png`) });
  count += 1;
  const t = String(tagline);
  console.log(`  ${slug}.png — ${t.slice(0, 60)}${t.length > 60 ? '…' : ''}`);
}

// ---- Page singletons → /og/<slug>.png -----------------------------------
// `slug` matches the route (slashes already dash-free here). `defaultTitle` is
// the fallback when Sanity's seoTitle / heroHeadline are both empty.
// These are the core routes every starter project ships with. Add rows for any
// additional page singletons you define in your Sanity schema.
const SINGLETONS = [
  { type: 'homePage',        slug: 'home',            defaultTitle: 'Serving and celebrating Jesus for the good of the world.' },
  { type: 'worshipPage',     slug: 'worship',         defaultTitle: "There's a place for you here." },
  { type: 'aboutPage',       slug: 'about',           defaultTitle: 'A landmark church with an open door' },
  { type: 'beliefsPage',     slug: 'what-we-believe', defaultTitle: 'The faith we share' },
  { type: 'musicPage',       slug: 'music',           defaultTitle: 'Our musical life at Second' },
  { type: 'staffPage',       slug: 'pastor-staff',    defaultTitle: 'Pastors & Staff' },
  { type: 'growPage',        slug: 'grow',            defaultTitle: 'Community Groups at Second' },
  { type: 'servePage',       slug: 'serve',           defaultTitle: 'Love our neighbors' },
  { type: 'kidsPage',        slug: 'kids',            defaultTitle: 'Children are welcome here' },
  { type: 'foodPage',        slug: 'food',            defaultTitle: 'Food for all in need, no questions asked' },
  { type: 'useOurSpacePage', slug: 'use-our-space',   defaultTitle: 'Use our historic space' },
  { type: 'weddingsPage',    slug: 'weddings',        defaultTitle: 'Weddings in a National Historic Landmark' },
  { type: 'givePage',        slug: 'give',            defaultTitle: 'Give to Second' },
  { type: 'eventsPage',      slug: 'events',          defaultTitle: 'Upcoming at Second' },
  { type: 'sermonsPage',     slug: 'sermons',         defaultTitle: 'Messages from Second' },
  { type: 'faqPage',         slug: 'faq',             defaultTitle: 'Questions, answered' },
  { type: 'contactPage',     slug: 'contact',         defaultTitle: 'Get in touch' },
  { type: 'privacyPage',     slug: 'privacy',         defaultTitle: 'Privacy policy' },
];

for (const page of SINGLETONS) {
  const doc = await client
    .fetch(`*[_type == $type][0]{ seoTitle, heroHeadline }`, { type: page.type })
    .catch(() => null);
  const tagline = doc?.seoTitle || doc?.heroHeadline || page.defaultTitle;
  await render(page.slug, tagline);
}

// ---- Dynamic collections → /og/<prefix>-<slug>.png ----------------------
// Mirrors BaseLayout: /journal/my-post → journal-my-post.png, etc.
// Add an entry here for each dynamic collection your project defines.
// Example (uncomment and adapt when you have a journal or case-study schema):
//
// const COLLECTIONS = [
//   {
//     prefix: 'journal',
//     query: `*[_type=="journalEntry" && defined(slug.current)]{ "slug": slug.current, seoTitle, title }`,
//     pick: (d) => d.seoTitle || d.title,
//   },
// ];
//
// for (const col of COLLECTIONS) {
//   const docs = await client.fetch(col.query).catch(() => []);
//   for (const d of docs) {
//     const tagline = col.pick(d);
//     if (!d.slug || !tagline) continue;
//     await render(`${col.prefix}-${d.slug}`, tagline);
//   }
// }

console.log(`\nDone. ${count} OG images written to ${outDir}`);
