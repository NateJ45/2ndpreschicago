// Fills the empty siteSettings fields the content audit flagged (service time,
// mission, give/watch URLs, YouTube) so they live in Sanity rather than only as
// code fallbacks. Uses setIfMissing, so any value an editor already set is never
// overwritten. Patches both the published doc and a draft if one exists.
//
// Run: node scripts/seed-settings.mjs

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
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or a write token in .env.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const VALUES = {
  serviceTimes: 'Sundays at 11am',
  mission: 'Serving and celebrating Jesus for the good of the world.',
  addressLine: '1936 South Michigan Ave',
  cityStateZip: 'Chicago, IL 60616',
  giveUrl:
    'https://www.eservicepayments.com/cgi-bin/Vanco_ver3.vps?appver3=wWsk24ZWJSTZKsGd1RMKlg0BDvsSG3VIWQCPJNNxD8upkiY7JlDavDsozUE7KG0nFx2NSo8LdUKGuGuF396vbQob3Vy7b9Yfe_jNfJWTbVeXHubq5Z7ap5JVmPEpc4ZeYHCKCZhESjGNQmZ5B-6dx5zOQjapagb4-GcDOvSEdsc=&ver=3',
  watchUrl: 'https://www.youtube.com/@secondpreschicago',
  socialYoutube: 'https://www.youtube.com/@secondpreschicago',
};

async function run() {
  for (const id of ['siteSettings', 'drafts.siteSettings']) {
    try {
      const exists = await client.fetch(`defined(*[_id == $id][0]._id)`, { id });
      if (!exists) {
        console.log(`  ${id}: not present, skipped`);
        continue;
      }
      await client.patch(id).setIfMissing(VALUES).commit({ visibility: 'async' });
      console.log(`  ${id}: filled missing fields (${Object.keys(VALUES).join(', ')})`);
    } catch (e) {
      const msg = String(e?.message || '');
      const is404 = msg.includes('not found') || String(e?.statusCode) === '404';
      if (!is404) console.log(`  ${id}: ${e.message}`);
    }
  }
  console.log('\nDone. siteSettings gaps filled (setIfMissing — existing values preserved).');
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
