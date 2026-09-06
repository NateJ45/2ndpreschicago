// scripts/seed-core.mjs
//
// Seeds the CORE singletons that the church site reads from Sanity with real
// Second Presbyterian content, so connecting a Sanity project is turnkey.
//
// Most church pages render from inline copy in src/pages/*.astro and do not
// depend on Sanity. The documents seeded here are the ones the live site
// actually consumes: siteSettings (header/footer/JSON-LD), the about/privacy/
// 404 singletons, home-page SEO, and the Studio "Start Here" handbook.
// Events are seeded separately by modules/events/seed.mjs.
//
// Prerequisites:
//   - PUBLIC_SANITY_PROJECT_ID in .env
//   - SANITY_API_WRITE_TOKEN in .env
// Idempotent: createOrReplace with deterministic _id values.

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

if (!projectId) { console.log('PUBLIC_SANITY_PROJECT_ID is not set. Configure your .env and re-run.'); process.exit(0); }
if (!token) { console.log('SANITY_API_WRITE_TOKEN is not set. A write token is required to seed content.'); process.exit(0); }

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

let _keyCounter = 0;
const key = () => `seed-${(_keyCounter += 1)}`;
const pt = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });
const ptH2 = (text) => ({ _type: 'block', _key: key(), style: 'h2', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });

const docs = [];

// ── 1. siteSettings ───────────────────────────────────────────────────────
// serviceAreas / travelFees / availabilityStatus are required by the shared
// starter schema; for the church they are filled with sensible church values
// (the editor can ignore them, they do not appear on the church pages).
docs.push({
  _id: 'siteSettings',
  _type: 'siteSettings',
  title: 'Second Presbyterian Church of Chicago',
  tagline: 'Serving and celebrating Jesus for the good of the world.',
  email: 'office@secondpreschicago.org',
  phone: '312-225-4951',
  availabilityStatus: 'Sundays at 11am',
  serviceAreas: ['South Loop, Chicago'],
  travelFees: [{ _type: 'travelFeeTier', _key: key(), distanceLabel: 'On site', fee: 'Free parking' }],
  socialInstagram: 'https://www.instagram.com/2ndpresbyterian',
  socialFacebook: 'https://www.facebook.com/2ndpreschicago',
  newsletter: {
    enabled: false,
    providerLabel: '',
    heading: 'Subscribe to The Record',
    blurb: 'News, reflections, and what is coming up at Second, in your inbox.',
    buttonLabel: 'Subscribe',
    successMessage: "You're subscribed. Welcome to The Record.",
    consentNote: 'No spam. Unsubscribe anytime.',
  },
});

// ── 2. homePage (SEO; the home layout itself renders inline copy) ──────────
docs.push({
  _id: 'homePage',
  _type: 'homePage',
  seoTitle: 'Second Presbyterian Church of Chicago',
  seoDescription:
    "A historic, welcoming Presbyterian church in Chicago's South Loop. Join us for worship Sundays at 11am. Whoever you are, you are welcome here.",
  heroEyebrow: 'The Church of the Angels · South Loop, Chicago',
  heroHeadline: 'Serving and celebrating Jesus for the good of the world.',
  heroSubhead:
    'We gather in the abundant life of Jesus to worship, love, serve, pray, and share the gospel in word and deed. Whoever you are, you are welcome here.',
});

// ── 3. aboutPage ───────────────────────────────────────────────────────────
docs.push({
  _id: 'aboutPage',
  _type: 'aboutPage',
  seoTitle: 'About · Second Presbyterian Church of Chicago',
  seoDescription:
    "A National Historic Landmark and a living congregation in Chicago's South Loop. The story of Second Presbyterian Church, the Church of the Angels.",
  heroEyebrow: 'About Second',
  heroHeadline: 'A landmark church with an open door',
  heroSubhead:
    'Known as the Church of the Angels, Second Presbyterian has worshipped on Michigan Avenue for generations. The building is extraordinary. The people are the point.',
  storyEyebrow: 'A National Historic Landmark',
  storyHeadline: 'The Church of the Angels',
  storyContent: [
    pt('Our sanctuary, rebuilt in 1901 in the Arts and Crafts style after fire, is home to nine Tiffany windows and a ceiling of painted angels that gave the church its nickname. Visitors travel from all over the world to see it.'),
    pt('It is one of the great interiors in American church architecture, and it is still, first and last, a room built for worship.'),
    pt('We are a Reformed congregation in the Presbyterian Church (USA), gathering each week to worship, love, serve, pray, and share the gospel in word and deed. We welcome everyone: women and men, gay and straight, lifelong believers and the simply curious.'),
  ],
});

// ── 4. privacyPage ─────────────────────────────────────────────────────────
docs.push({
  _id: 'privacyPage',
  _type: 'privacyPage',
  seoTitle: 'Privacy Policy · Second Presbyterian Church of Chicago',
  seoDescription: 'How we handle the information you share when you contact us or subscribe.',
  heroEyebrow: 'Transparency first.',
  heroHeadline: 'Privacy Policy',
  lastUpdated: '2026-05-31',
  body: [
    pt('This is the privacy policy for Second Presbyterian Church of Chicago. The goal here is to be straightforward about what information we collect and why.'),
    ptH2('What gets collected'),
    pt('When you email the church or send a message through this site, you share your name, email address, and whatever details you include. We use that information only to respond to you. Nothing else.'),
    pt('If you subscribe to our newsletter, your email address goes to our email provider so occasional news from the church can reach you. It is not shared with anyone else.'),
    ptH2("What doesn't happen"),
    pt('Your information is never sold. There is no ad targeting on this site. Traffic is measured with privacy-friendly analytics that count visits without setting cookies or identifying individual visitors.'),
    ptH2('Questions or data requests'),
    pt('If you have questions about how your information is handled, or want your data removed, email office@secondpreschicago.org and we will help.'),
  ],
});

// ── 5. notFoundPage ────────────────────────────────────────────────────────
docs.push({
  _id: 'notFoundPage',
  _type: 'notFoundPage',
  seoTitle: 'Page not found',
  seoDescription: 'That page wandered off. Head back home or join us for worship.',
  eyebrow: '404',
  headline: 'This page wandered off.',
  body: 'Maybe a link is old, or the address has a typo. Either way, here is where to head next.',
  primaryCtaLabel: 'Back home',
  primaryCtaHref: '/',
  secondaryCtaLabel: 'Plan a visit',
  secondaryCtaHref: '/worship',
  tertiaryCtaLabel: 'Get in touch',
  tertiaryCtaHref: '/contact',
});

// ── 6. studioGuide (editor handbook, "Start Here") ─────────────────────────
docs.push({
  _id: 'studioGuide',
  _type: 'studioGuide',
  guideTitle: 'How the website works',
  guideIntro:
    'Welcome. Most of the church website is set in the page files, but a few things live here in Sanity so you can edit them without code: your contact details and tagline, the events calendar, and the about/privacy pages.',
  studioMap: [
    { _type: 'mapRow', _key: key(), area: 'Site Settings', description: 'Church name, tagline, public email and phone, social links, and the newsletter signup. Start here.' },
    { _type: 'mapRow', _key: key(), area: 'Events', description: 'Add recurring rhythms (worship, Bible study) and one-time events (a concert, a block fest). One-time events drop off after their date.' },
    { _type: 'mapRow', _key: key(), area: 'About / Privacy / 404 pages', description: 'The hero text and body copy for these pages.' },
  ],
  howTos: [
    { _type: 'howTo', _key: key(), title: 'Add an event', steps: ['Open "Events" from the left navigation.', 'Click "Create new".', 'Choose Recurring or One-time, fill in the title, schedule, and a short summary.', 'Click Publish. It appears on the Events page within a few minutes.'] },
    { _type: 'howTo', _key: key(), title: 'Update your contact info', steps: ['Open "Site Settings".', 'Edit the email, phone, or social links.', 'Click Publish.'] },
  ],
  tips: [
    { _type: 'tip', _key: key(), heading: 'Publishing is quick', tone: 'default', body: 'When you click Publish, the change goes live on the site within a few minutes after the next rebuild.' },
    { _type: 'tip', _key: key(), heading: 'One-time vs recurring events', tone: 'primary', body: 'Use "Recurring" for weekly rhythms like worship and Bible study, and "One-time" for dated events. One-time events drop off the upcoming list after they pass.' },
  ],
});

// ── 7. studioNotes (voice + business notes for the editor) ─────────────────
docs.push({
  _id: 'studioNotes',
  _type: 'studioNotes',
  businessSummary:
    'Second Presbyterian Church of Chicago is a historic, inclusive Reformed congregation (PCUSA) in the South Loop, known as the Church of the Angels for its nine Tiffany windows. Worship is Sundays at 11am.',
  idealClient:
    'First-time visitors and neighbors: people who may not have been to church in years, or ever, and who need to feel genuinely welcome and find the practical details quickly.',
  voiceSummary:
    'Warm, plain-spoken, and unpretentious. Take God seriously and ourselves lightly. Lead with welcome and people, let the landmark building come second.',
  wordsToAvoid: ['do life together', 'unchurched', 'worship experience', 'life-changing', 'passionate about', 'radical', 'transformative', 'seamless'],
});

async function seed() {
  console.log(`Seeding ${docs.length} core documents to ${projectId}/${dataset}...`);
  let created = 0, replaced = 0;
  for (const doc of docs) {
    try {
      const existing = await client.fetch(`*[_id == $id][0]._id`, { id: doc._id });
      await client.createOrReplace(doc);
      if (existing) replaced += 1;
      else created += 1;
      console.log(`  ${existing ? 'replaced' : 'created '}  ${doc._type}  ${doc._id}`);
    } catch (err) {
      console.error(`  ERROR on ${doc._id}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${created} created, ${replaced} replaced.`);
  console.log('Run "node modules/events/seed.mjs" next to seed the events calendar.');
}

seed();
