// scripts/seed-e3.mjs
//
// Seeds the in-body buttons/links/headings + detail-page closing CTAs that were
// just made editable (the "everything editable" pass). Each value is the EXACT
// current literal label/href/text, so the live site stays byte-identical; the
// win is that these Studio fields now show their values instead of being absent.
// Idempotent (setIfMissing); patches published + draft.
//
// Run: node scripts/seed-e3.mjs

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

const WATCH_URL = 'https://www.youtube.com/@secondpreschicago';
const cta = (label, externalUrl, newTab = false) => {
  const o = { _type: 'ctaBlock', label, linkType: 'external', externalUrl };
  if (newTab) o.openInNewTab = true;
  return o;
};

const E3 = {
  homePage: {
    welcomeCtaPrimary: cta('What We Believe', '/what-we-believe'),
    welcomeCtaSecondary: cta('Meet Our Pastors', '/pastor-staff'),
    serviceBandVisitCta: cta('Plan a Visit', '/worship'),
    serviceBandWatchCta: cta('Watch', WATCH_URL, true),
    eventsCalendarCta: cta('See the Full Calendar', '/events'),
  },
  aboutPage: {
    buildingCta: cta('Visit or Use the Space', '/use-our-space'),
    whoCtaPrimary: cta('What We Believe', '/what-we-believe'),
    whoCtaSecondary: cta('Meet Our Pastors', '/pastor-staff'),
  },
  worshipPage: {
    gatherDirectionsCta: cta('Get Directions', '/contact'),
    gatherWatchCta: cta('Watch Online', WATCH_URL, true),
    kidsMoreCta: cta('More for kids', '/kids'),
    resourcesEyebrow: 'Worship resources',
    resourcesHeadline: 'Bulletins and downloads',
  },
  musicPage: {
    organCreditCta: cta('Michael Shawgo, Director of Music & Organist', '/pastor-staff'),
  },
  foodPage: {
    lunchBagCta: cta('Support Lunch Bag', '/give'),
    tableCta: cta('Support the Table', '/give'),
  },
  servePage: {
    serveLinkLabel: 'Learn more',
  },
  sermonsPage: {
    watchLiveLabel: 'Watch Live',
    watchYoutubeLabel: 'Watch on YouTube',
    emptyVisitCta: cta('Plan a Visit', '/worship'),
    detailFinalCtaEyebrow: 'Come and See',
    detailFinalCtaHeadline: 'Join us this Sunday',
    detailFinalCtaSubhead: 'Worship is at 11am every Sunday at the Church of the Angels. Everyone is welcome.',
    detailFinalCta: cta('Plan a Visit', '/worship'),
  },
  eventsPage: {
    detailFinalCtaEyebrow: 'Come and See',
    detailFinalCtaHeadline: 'Join us at Second',
    detailFinalCtaSubhead: 'Everyone is welcome. Worship is at 11am every Sunday, and the door is always open.',
    detailFinalCta: cta('Plan a Visit', '/worship'),
  },
};

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
  console.log(`Seeding E3 in-body labels/CTAs to ${projectId}/${dataset} (setIfMissing)...\n`);
  for (const [id, fields] of Object.entries(E3)) {
    console.log(`${id}: ${Object.keys(fields).length} field(s)`);
    await patch(id, fields, id);
    await patch(`drafts.${id}`, fields, `drafts.${id}`);
  }
  console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
