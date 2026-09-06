// scripts/seed-hero-images.mjs
//
// Uploads each page's hero photo into Sanity and sets the page singleton's
// heroImage (homePage uses heroImages), so the Studio shows every hero
// pre-filled and an editor can swap any of them. The site already renders
// these same photos as code fallbacks; seeding them just moves the source of
// truth into Sanity and populates the Studio.
//
// Idempotent: Sanity dedupes identical image uploads by content hash, and the
// document writes are createOrReplace / set, so re-running is safe.
//
// Prerequisites: PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env.
// Run after scripts/seed-core.mjs (and the events/sermons seeds).

import { readFileSync } from 'node:fs';
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

if (!projectId) {
  console.log('PUBLIC_SANITY_PROJECT_ID is not set. Configure .env and re-run.');
  process.exit(0);
}
if (!token) {
  console.log('SANITY_API_WRITE_TOKEN is not set. A write token is required to seed.');
  process.exit(0);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });
const assetsDir = resolve(root, 'src', 'assets');

const assetCache = new Map();
async function uploadImage(file) {
  if (assetCache.has(file)) return assetCache.get(file);
  const buf = readFileSync(resolve(assetsDir, file));
  const asset = await client.assets.upload('image', buf, { filename: file });
  assetCache.set(file, asset._id);
  return asset._id;
}
const img = (assetId, alt) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: assetId },
  alt,
});

// New per-page church singletons: create with hero text + image so the Studio
// is fully populated (these documents do not exist until created here).
const churchPages = [
  {
    id: 'worshipPage',
    file: 'hero-worship.webp',
    alt: 'The sanctuary of Second Presbyterian set for Sunday worship',
    eyebrow: `Sunday Worship`,
    headline: `There's a place for you here.`,
    subhead: `Whether you're a weekly churchgoer, haven't been in ages, or don't know anything about Christianity, you are welcome at Second.`,
  },
  {
    id: 'beliefsPage',
    file: 'tiffany-windows.webp',
    alt: 'A Tiffany stained-glass window at Second Presbyterian',
    eyebrow: `What We Believe`,
    headline: `The faith we share`,
    subhead: `What we hold to be true about humanity, about God, and about the good news of Jesus Christ.`,
  },
  {
    id: 'musicPage',
    file: 'hero-music.webp',
    alt: 'The historic Austin pipe organ in the Second Presbyterian sanctuary',
    eyebrow: `Music`,
    headline: `Our musical life at Second`,
    subhead: `I will sing of your strength, in the morning I will sing of your love. (Psalm 59:16)`,
  },
  {
    id: 'staffPage',
    file: 'hero-staff.webp',
    alt: 'The sanctuary of Second Presbyterian Church',
    eyebrow: `Pastors & Staff`,
    headline: `The people you'll meet at Second`,
    subhead: `A small, dedicated team serving a historic congregation in the South Loop.`,
  },
  {
    id: 'growPage',
    file: 'hero-grow.webp',
    alt: 'Inside the historic sanctuary at Second Presbyterian',
    eyebrow: `Get Involved`,
    headline: `Community Groups at Second`,
    subhead: `Drop in and walk with others on the Way of Jesus.`,
  },
  {
    id: 'servePage',
    file: 'hero-exterior.webp',
    alt: 'Second Presbyterian Church on South Michigan Avenue',
    eyebrow: `Get Involved`,
    headline: `Love our neighbors`,
    subhead: `We are called to serve and celebrate Jesus for the good of the world. Much of that happens right here in the South Loop.`,
  },
  {
    id: 'kidsPage',
    file: 'sanctuary-interior.webp',
    alt: 'The welcoming nave of Second Presbyterian',
    eyebrow: `Get Involved`,
    headline: `Children are welcome here`,
    subhead: `At Second, little ones are part of the worshipping congregation, and we welcome their noise and their needs.`,
  },
  {
    id: 'foodPage',
    file: 'hero-food.webp',
    alt: 'Neighbors sharing a meal at the South Loop Community Table at Second Presbyterian',
    eyebrow: `Food Ministry`,
    headline: `Food for all in need, no questions asked`,
    subhead: `Find us at our Cullerton door on Tuesday, Wednesday, Thursday, and Sunday.`,
  },
  {
    id: 'useOurSpacePage',
    file: 'hero-space.webp',
    alt: 'The historic sanctuary interior available to rent at Second Presbyterian',
    eyebrow: `Use Our Space`,
    headline: `Interested in using space at Second?`,
    subhead: `A historic, welcoming building in the heart of the South Loop, open to the wider community throughout the week.`,
  },
  {
    id: 'weddingsPage',
    file: 'hero-weddings.webp',
    alt: 'The sanctuary aisle beneath the Tiffany windows at Second Presbyterian',
    eyebrow: `Weddings`,
    headline: `Get married in a National Historic Landmark`,
    subhead: `Our 1901 Arts and Crafts sanctuary, home to nine Tiffany windows and extraordinary murals, draws visitors from all over the world. We host weddings of every size.`,
  },
  {
    id: 'givePage',
    file: 'mural-angels.jpg',
    alt: 'The painted angels on the sanctuary ceiling at Second Presbyterian',
    eyebrow: `Give`,
    headline: `Thank you`,
    subhead: `For entrusting your tithes and offerings to Second. Your generosity sustains worship, music, and a food ministry that feeds our neighbors.`,
  },
];

// Existing singletons (already created by the other seeds, or created here if
// missing): only set the hero image so we never clobber their other content.
const existingPages = [
  {
    id: 'aboutPage',
    file: 'angel-murals.jpg',
    alt: 'The painted angels on the sanctuary ceiling at Second Presbyterian',
  },
  {
    id: 'eventsPage',
    file: 'hero-events.webp',
    alt: 'A gathering inside the historic sanctuary at Second Presbyterian',
  },
  {
    id: 'sermonsPage',
    file: 'hero-worship.webp',
    alt: 'The sanctuary at Second Presbyterian set for worship',
  },
  {
    id: 'privacyPage',
    file: 'hero-sanctuary.webp',
    alt: 'Second Presbyterian Church on South Michigan Avenue',
  },
  {
    id: 'faqPage',
    file: 'sanctuary-interior.webp',
    alt: 'Inside the sanctuary at Second Presbyterian',
  },
  {
    id: 'contactPage',
    file: 'hero-sanctuary.webp',
    alt: 'Second Presbyterian Church on South Michigan Avenue',
  },
];

async function run() {
  console.log(`Seeding hero images to ${projectId}/${dataset}...`);

  for (const p of churchPages) {
    const assetId = await uploadImage(p.file);
    await client.createOrReplace({
      _id: p.id,
      _type: p.id,
      heroEyebrow: p.eyebrow,
      heroHeadline: p.headline,
      heroSubhead: p.subhead,
      heroImage: img(assetId, p.alt),
    });
    console.log(`  set hero      ${p.id}  (${p.file})`);
  }

  for (const p of existingPages) {
    const assetId = await uploadImage(p.file);
    await client.createIfNotExists({ _id: p.id, _type: p.id });
    await client
      .patch(p.id)
      .set({ heroImage: img(assetId, p.alt) })
      .commit();
    console.log(`  patched hero  ${p.id}  (${p.file})`);
  }

  // Home hero renders a slideshow from the heroImages array: a slow Ken Burns
  // cross-fade through these photos inside the arched frame (see
  // HeroArchSlideshow.astro). Order matters: the first entry is the LCP image
  // (loaded eager) and carries the page's hero alt text. Alts mirror the ones
  // already used for these same files on their own pages, above.
  // NOTE: several hero-*.webp files in src/assets are byte-identical placeholder
  // copies (hero-weddings == tiffany-windows, hero-grow == sanctuary-interior).
  // Sanity dedupes by content hash, so listing both would render the same photo
  // twice. This set is 10 *distinct* images, verified by MD5.
  const homeHeroFiles = [
    ['hero-sanctuary.webp', 'Second Presbyterian Church on South Michigan Avenue'],
    [
      'hero-exterior.webp',
      'The Gothic stone facade of Second Presbyterian Church in the South Loop',
    ],
    ['sanctuary-interior.webp', 'The welcoming nave of the sanctuary at Second Presbyterian'],
    ['tiffany-windows.webp', 'A Tiffany stained-glass window at Second Presbyterian'],
    ['mural-angels.jpg', 'The painted angels on the sanctuary ceiling at Second Presbyterian'],
    ['hero-worship.webp', 'The sanctuary of Second Presbyterian set for Sunday worship'],
    ['hero-music.webp', 'The historic Austin pipe organ in the Second Presbyterian sanctuary'],
    ['hero-food.webp', 'Neighbors gathered for the food ministry at Second Presbyterian'],
    ['hero-events.webp', 'A gathering inside the historic sanctuary at Second Presbyterian'],
    [
      'hero-space.webp',
      'The historic sanctuary interior at Second Presbyterian, open to the community',
    ],
  ];
  const heroImages = [];
  for (let i = 0; i < homeHeroFiles.length; i++) {
    const [file, alt] = homeHeroFiles[i];
    const assetId = await uploadImage(file);
    heroImages.push({ ...img(assetId, alt), _key: `home-hero-${i + 1}` });
  }
  await client.createIfNotExists({ _id: 'homePage', _type: 'homePage' });
  await client.patch('homePage').set({ heroImages }).commit();
  console.log(`  patched hero  homePage  (${heroImages.length}-image slideshow)`);

  // If an unpublished draft of the home page exists, mirror the slideshow into
  // it too, so the Studio shows the new images whether or not an editor has a
  // draft open (otherwise a stale draft would mask the published change).
  const draft = await client.getDocument('drafts.homePage').catch(() => null);
  if (draft) {
    await client.patch('drafts.homePage').set({ heroImages }).commit();
    console.log(`  patched hero  drafts.homePage  (${heroImages.length}-image slideshow)`);
  }

  console.log(`Done. ${churchPages.length + existingPages.length + 1} page heroes set.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
