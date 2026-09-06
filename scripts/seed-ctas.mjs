// scripts/seed-ctas.mjs
//
// Seeds the call-to-action BUTTON fields (ctaBlock objects) that the templates
// otherwise fall back to as hardcoded literals: the home hero Primary/Secondary
// buttons (heroPrimaryCta / heroSecondaryCta) and every page singleton's closing
// finalCta button. Values are the exact current label + link each template uses,
// so the live site is byte-identical; the win is that the Studio's CTA fields now
// show the real button instead of a blank input.
//
// The two link-derived buttons (home "Watch Online" -> watchUrl, give "Give Now"
// -> giveUrl) are seeded with the CURRENT resolved URL from siteSettings so the
// rendered link does not change. Idempotent (setIfMissing); patches published +
// draft.
//
// Run: node scripts/seed-ctas.mjs

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

// Current resolved URLs from siteSettings (so link-derived buttons don't drift).
const WATCH_URL = 'https://www.youtube.com/@secondpreschicago';
const GIVE_URL = 'https://www.eservicepayments.com/cgi-bin/Vanco_ver3.vps?appver3=wWsk24ZWJSTZKsGd1RMKlg0BDvsSG3VIWQCPJNNxD8upkiY7JlDavDsozUE7KG0nFx2NSo8LdUKGuGuF396vbQob3Vy7b9Yfe_jNfJWTbVeXHubq5Z7ap5JVmPEpc4ZeYHCKCZhESjGNQmZ5B-6dx5zOQjapagb4-GcDOvSEdsc=&ver=3';

const cta = (label, externalUrl, openInNewTab = false) => {
  const o = { _type: 'ctaBlock', label, linkType: 'external', externalUrl };
  if (openInNewTab) o.openInNewTab = true;
  return o;
};

// Each page's CTA buttons, matching the literal fallback in its template.
const CTAS = {
  homePage: {
    heroPrimaryCta: cta('Plan a Visit', '/worship'),
    heroSecondaryCta: cta('Watch Online', WATCH_URL, true),
    finalCta: cta('Plan a Visit', '/worship'),
  },
  aboutPage: { finalCta: cta('Plan a Visit', '/worship') },
  worshipPage: { finalCta: cta('Get in Touch', '/contact') },
  beliefsPage: { finalCta: cta('Plan a Visit', '/worship') },
  musicPage: { finalCta: cta('Plan a Visit', '/worship') },
  staffPage: { finalCta: cta('Plan a Visit', '/worship') },
  growPage: { finalCta: cta('See the Calendar', '/events') },
  servePage: { finalCta: cta('Get in Touch', '/contact') },
  kidsPage: { finalCta: cta('Plan a Visit', '/worship') },
  foodPage: { finalCta: cta('Get Involved', '/serve') },
  useOurSpacePage: { finalCta: cta('Plan a Visit', '/worship') },
  weddingsPage: { finalCta: cta('Contact the Office', '/contact') },
  givePage: { finalCta: cta('Give Now', GIVE_URL, true) },
  contactPage: { finalCta: cta('Plan a Visit', '/worship') },
  faqPage: { finalCta: cta('Get in Touch', '/contact') },
  eventsPage: { finalCta: cta('Plan a Visit', '/worship') },
  sermonsPage: { finalCta: cta('Plan a Visit', '/worship') },
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
  console.log(`Seeding CTA buttons to ${projectId}/${dataset} (setIfMissing)...\n`);
  for (const [id, fields] of Object.entries(CTAS)) {
    console.log(`${id}: ${Object.keys(fields).join(', ')}`);
    await patch(id, fields, id);
    await patch(`drafts.${id}`, fields, `drafts.${id}`);
  }
  console.log('\nDone.');
}

run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
