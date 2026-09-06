// scripts/seed-seo.mjs
//
// Seeds seoTitle + seoDescription on the page singletons whose SEO fields were
// blank (the site showed a built-in fallback title in the browser tab / Google
// while the Studio SEO field sat empty). Values are the exact resolved fallback
// each template uses, so the rendered <title>/<meta> are byte-identical; the win
// is that the Studio SEO fields now mirror what search engines see. Also seeds
// the home headline's green keyword (heroKeyword: "Jesus").
//
// Idempotent (setIfMissing). Run: node scripts/seed-seo.mjs

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
if (!projectId || !token) { console.error('Need PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env'); process.exit(1); }

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

const SEO = {
  worshipPage: { seoTitle: 'Worship · Second Presbyterian Church of Chicago', seoDescription: 'Join us for worship Sundays at 11am. A traditional, liturgical service with communion on the first Sunday of each month. Whoever you are, you are welcome here.' },
  musicPage: { seoTitle: 'Music · Second Presbyterian Church of Chicago', seoDescription: 'Hymns, spirituals, and anthems led by a professional quartette choir and a historic 1917 Austin pipe organ. The musical life of Second Presbyterian Church of Chicago.' },
  beliefsPage: { seoTitle: 'What We Believe · Second Presbyterian Church of Chicago', seoDescription: 'Second Presbyterian is a Reformed congregation in the Presbyterian Church (USA). What we believe about humanity, God, and the good news of Jesus Christ, and where we fit and are going as a church.' },
  useOurSpacePage: { seoTitle: 'Use Our Space · Second Presbyterian Church of Chicago', seoDescription: 'Host your event at a National Historic Landmark in the South Loop. Second Presbyterian offers competitive rates, a premium location near transit, and free parking.' },
  weddingsPage: { seoTitle: 'Weddings · Second Presbyterian Church of Chicago', seoDescription: 'Get married in a National Historic Landmark. Our 1901 Arts and Crafts sanctuary, home to nine Tiffany windows and extraordinary murals, welcomes weddings of all sizes.' },
  givePage: { seoTitle: 'Give · Second Presbyterian Church of Chicago', seoDescription: 'Support the ministry of Second Presbyterian Church of Chicago. Give online, by mail, or designate your gift to the food ministry. Thank you for your generosity.' },
  contactPage: { seoTitle: 'Contact · Second Presbyterian Church of Chicago', seoDescription: 'Reach Second Presbyterian Church of Chicago. Address, phone, email, office hours, and how to find us in the South Loop.' },
  faqPage: { seoTitle: 'Frequently Asked Questions · Second Presbyterian Church of Chicago', seoDescription: 'Everything a first-time visitor wants to know about worship, parking, kids, giving, weddings, and our food ministry at Second Presbyterian Church of Chicago.' },
  foodPage: { seoTitle: 'Food Ministry · Second Presbyterian Church of Chicago', seoDescription: 'Free food for all in need, no questions asked, at our Cullerton door. Lunch Bag runs Tuesday through Thursday, and the South Loop Community Table gathers on Sunday evenings.' },
  growPage: { seoTitle: 'Grow · Second Presbyterian Church of Chicago', seoDescription: 'Community groups at Second: Bible study, Theology on Tap, and reading groups. Drop in and walk with others on the Way of Jesus.' },
  kidsPage: { seoTitle: 'Kids · Second Presbyterian Church of Chicago', seoDescription: 'Children are part of the worshipping congregation at Second Presbyterian Church. How we welcome kids and families on Sunday morning.' },
  servePage: { seoTitle: 'Serve · Second Presbyterian Church of Chicago', seoDescription: 'Serve alongside Second Presbyterian Church. From our Cullerton-door food ministry to neighborhood gatherings, there are many ways to love our South Loop neighbors.' },
  staffPage: { seoTitle: 'Pastors & Staff · Second Presbyterian Church of Chicago', seoDescription: 'Meet the pastors and staff of Second Presbyterian Church of Chicago: Rev. Chesna Hinkley, Rev. Judy Landt, Michael Shawgo, and Ashley McLean.' },
};

const EXTRA = { homePage: { heroKeyword: 'Jesus' } };

async function patch(id, fields, label) {
  try {
    await client.patch(id).setIfMissing(fields).commit();
    console.log(`  patched ${label}`);
  } catch (e) {
    if (e?.statusCode === 404) { console.log(`  skipped ${label} (no document)`); return; }
    throw e;
  }
}

async function run() {
  console.log(`Seeding SEO + heroKeyword to ${projectId}/${dataset} (setIfMissing)...\n`);
  for (const [id, fields] of Object.entries({ ...SEO, ...EXTRA })) {
    const merged = { ...(SEO[id] || {}), ...(EXTRA[id] || {}) };
    console.log(`${id}: ${Object.keys(merged).join(', ')}`);
    await patch(id, merged, id);
    await patch(`drafts.${id}`, merged, `drafts.${id}`);
  }
  console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
