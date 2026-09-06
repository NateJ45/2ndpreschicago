// scripts/seed-service-time.mjs
//
// Part of single-sourcing the worship service time:
//  1. Sets siteSettings.worshipService (the one canonical service-time object)
//     to the church's current values. Every structured display + the Google
//     JSON-LD hours derive from this (src/lib/serviceTime.ts).
//  2. Overwrites the prose fields that previously baked in "11am" with the
//     reworded, time-agnostic copy (matching the new template fallbacks), so the
//     time no longer lives in those sentences.
//
// The worshipService write is setIfMissing (won't clobber editor edits); the
// prose writes are .set() (they intentionally replace the old "...11am..."
// seeded values). Patches published + draft.
//
// Run: node scripts/seed-service-time.mjs

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
if (!projectId || !token) {
  console.error('Need PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

// The canonical service time (current church values).
const worshipService = { time: '11am', day: 'Sunday', startTime24: '11:00', endTime24: '12:15' };

// Reworded, time-agnostic prose (must match the new template fallbacks exactly).
const REWORD = {
  homePage: {
    seoDescription:
      "A historic, welcoming Presbyterian church in Chicago's South Loop. Join us for worship this Sunday. Whoever you are, you are welcome here.",
  },
  worshipPage: {
    seoDescription:
      'Join us for worship this Sunday. A traditional, liturgical service with communion on the first Sunday of each month. Whoever you are, you are welcome here.',
  },
  aboutPage: {
    finalCtaSubhead:
      'Join us for worship this Sunday, and see the Church of the Angels for yourself.',
  },
  contactPage: {
    finalCtaSubhead: 'We gather for worship every Sunday. Whoever you are, you are welcome here.',
  },
  musicPage: { finalCtaSubhead: 'Worship with us on Sunday, or watch the livestream online.' },
  kidsPage: {
    finalCtaSubhead:
      'Join us this Sunday, or reach out with any question about visiting with children.',
  },
  beliefsPage: {
    finalCtaSubhead:
      'Join us this Sunday, or reach out with any question about faith and life at Second.',
  },
  eventsPage: {
    finalCtaSubhead:
      'Worship is the heart of our week, and everyone is welcome at every gathering.',
    detailFinalCtaSubhead:
      'Everyone is welcome. Worship is every Sunday, and the door is always open.',
  },
  sermonsPage: {
    watchBody:
      'We livestream Sunday worship and post recent messages on our YouTube channel. Watch the latest, or join us live on Sunday.',
    finalCtaSubhead:
      'There is nothing like being in the room. Join us this Sunday at the Church of the Angels.',
    detailFinalCtaSubhead:
      'Worship is every Sunday at the Church of the Angels. Everyone is welcome.',
  },
};

async function run() {
  console.log(`Seeding service time + reworded prose to ${projectId}/${dataset}...\n`);

  // 1. Canonical worshipService (setIfMissing on siteSettings + draft).
  for (const id of ['siteSettings', 'drafts.siteSettings']) {
    try {
      await client.patch(id).setIfMissing({ worshipService }).commit();
      console.log(`  worshipService -> ${id}`);
    } catch (e) {
      if (e?.statusCode !== 404) throw e;
    }
  }

  // 2. Reworded prose (overwrite the old "...11am..." values).
  for (const [docId, fields] of Object.entries(REWORD)) {
    for (const id of [docId, `drafts.${docId}`]) {
      try {
        await client.patch(id).set(fields).commit();
        console.log(`  reworded ${Object.keys(fields).join(', ')} -> ${id}`);
      } catch (e) {
        if (e?.statusCode !== 404) throw e;
      }
    }
  }
  console.log('\nDone.');
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
