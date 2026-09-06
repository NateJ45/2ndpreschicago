import { loadEnv } from './lib/loadEnv.mjs';
// One-off maintenance utility, safe to re-run.
// After the church remodel removed the interior-designer fields from the schema,
// the seeded singleton documents still carried the old field VALUES. Sanity
// shows those as "Unknown fields found" in the Studio (Developer info panel).
// They are harmless (the site never reads them), but this clears them so the
// Studio is tidy.
//
// `unset` is a no-op for keys a document doesn't have, so listing the full
// removed set per type is safe. Runs against both the published doc and its
// draft (if any). A dataset backup exists at backups/pre-remodel-*.tar.gz.
//
// Run: node scripts/cleanup-orphaned-fields.mjs

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
  console.error(
    'Missing PUBLIC_SANITY_PROJECT_ID or a write token (SANITY_API_WRITE_TOKEN) in .env',
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// Interior-designer fields removed from each singleton during the remodel.
const REMOVED = {
  siteSettings: [
    'availabilityStatus',
    'serviceAreas',
    'travelFees',
    'googleBusinessUrl',
    'reviewsNote',
    'satisfactionGuarantee',
    'sectionVisibility',
    // Church CMS Phase 2: the announcement banner moved from this object to its
    // own Announcement collection.
    'announcement',
  ],
  homePage: [
    'meetFounderPhoto',
    'meetFounderEyebrow',
    'meetFounderHeadline',
    'meetFounderContent',
    'meetFounderCta',
    'featuredWorkEyebrow',
    'featuredWorkHeadline',
    'featuredWorkSubhead',
    'featuredWorkCta',
    'featuredJournalEyebrow',
    'featuredJournalHeadline',
    'featuredJournalSubhead',
    'featuredJournalCta',
    'processPreviewEyebrow',
    'processPreviewHeadline',
    'processPreviewSubhead',
    'processPreviewCta',
    'featuredTestimonial',
    'testimonialsEyebrow',
    'testimonialsHeadline',
    'testimonialsScriptAccent',
    'testimonialsSubhead',
    'testimonialsToShow',
    'testimonialsAttribution',
    'servicesGridEyebrow',
    'servicesGridHeadline',
    'servicesGridScriptAccent',
    'servicesGridSubhead',
    'servicesGridCta',
    'servicesGridFootnote',
    'serviceAreaCue',
  ],
  aboutPage: [
    'philosophyEyebrow',
    'philosophyHeadline',
    'personalEyebrow',
    'personalHeadline',
    'personalIntro',
    'currentlyList',
    'rapidFire',
    'localSpots',
    'beyondDesign',
    'candidPhoto',
    'stats',
    'founderPhoto',
    'founderAttribution',
    'backgroundLine',
    'serviceAreaMention',
  ],
  contactPage: [
    'formProjectTypeOptions',
    'formLocationOptions',
    'formBudgetOptions',
    'formTimelineOptions',
    'formSourceOptions',
    'postInquiryRoadmap',
    'schedulingLink',
    'schedulingLinkLabel',
    'availabilityNote',
  ],
};

async function unsetOn(id, keys) {
  try {
    const res = await client.patch(id).unset(keys).commit({ visibility: 'async' });
    console.log(`  cleaned ${id} (rev ${res._rev})`);
  } catch (e) {
    // Missing draft / doc is fine; report anything else.
    if (!String(e?.message || '').includes('not found')) {
      console.log(`  skip ${id}: ${e.message}`);
    }
  }
}

let count = 0;
for (const [type, keys] of Object.entries(REMOVED)) {
  console.log(`Cleaning ${type} (${keys.length} possible orphaned fields)...`);
  await unsetOn(type, keys);
  await unsetOn(`drafts.${type}`, keys);
  count += 1;
}

// faqItem is a collection; clear the one removed toggle on every item.
const faqIds = await client.fetch(`*[_type == "faqItem"]._id`);
for (const id of faqIds) {
  await unsetOn(id, ['alsoShowOnProcessPage']);
}

console.log(`\nDone. Processed ${count} singletons + ${faqIds.length} faqItem docs.`);
