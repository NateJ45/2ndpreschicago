// Read-only content audit. Reports what's actually IN the Sanity dataset
// (published vs draft-only) so we can tell which content is loaded versus
// relying on the code's inline hardcoded fallbacks. Draft-only docs do NOT
// appear on the statically-built live site.
//
// Run: node scripts/audit-content.mjs

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

if (!projectId) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID in .env — cannot audit.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const SINGLETONS = [
  'siteSettings', 'homePage', 'aboutPage', 'worshipPage', 'beliefsPage', 'musicPage',
  'staffPage', 'growPage', 'servePage', 'kidsPage', 'foodPage', 'eventsPage',
  'sermonsPage', 'useOurSpacePage', 'weddingsPage', 'givePage', 'faqPage',
  'contactPage', 'notFoundPage', 'privacyPage',
];
const COLLECTIONS = [
  'staffMember', 'ministry', 'faqItem', 'event', 'sermon', 'form', 'announcement',
  'worshipResource', 'page',
];

const SYS = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt']);
function contentFieldCount(doc) {
  if (!doc) return 0;
  return Object.keys(doc).filter((k) => !SYS.has(k)).filter((k) => {
    const v = doc[k];
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return true;
  }).length;
}

async function run() {
  console.log(`\nContent audit — project ${projectId}, dataset "${dataset}"\n`);

  console.log('=== PAGE SINGLETONS ===');
  console.log('(a page with no published doc renders entirely from code fallbacks)\n');
  let missing = 0;
  let draftOnly = 0;
  for (const t of SINGLETONS) {
    const pub = await client.fetch(`*[_type == $t && !(_id in path("drafts.**"))][0]`, { t });
    const draft = await client.fetch(`*[_id == $id][0]`, { id: `drafts.${t}` });
    if (pub) {
      console.log(`  ${t.padEnd(16)} published — ${contentFieldCount(pub)} content fields set${draft ? ' (+ unpublished draft)' : ''}`);
    } else if (draft) {
      draftOnly++;
      console.log(`  ${t.padEnd(16)} DRAFT ONLY — not published, will NOT show on the live site`);
    } else {
      missing++;
      console.log(`  ${t.padEnd(16)} MISSING — no document; page runs 100% on code fallbacks`);
    }
  }

  console.log('\n=== COLLECTIONS ===\n');
  for (const t of COLLECTIONS) {
    const pub = await client.fetch(`count(*[_type == $t && !(_id in path("drafts.**"))])`, { t });
    const drafts = await client.fetch(`count(*[_type == $t && (_id in path("drafts.**"))])`, { t });
    const flag = pub === 0 ? '   <-- EMPTY' : '';
    console.log(`  ${t.padEnd(16)} ${String(pub).padStart(3)} published, ${drafts} draft${flag}`);
  }

  console.log('\n=== staffMember (who is loaded) ===');
  const staff = await client.fetch(
    `*[_type == "staffMember" && !(_id in path("drafts.**"))]{ name, "role": coalesce(role, title, position), "photo": defined(image) || defined(photo) } | order(displayOrder asc, name asc)`,
  );
  if (!staff.length) console.log('  (none loaded)');
  else staff.forEach((s) => console.log(`  - ${s.name ?? '(no name)'}${s.role ? ` — ${s.role}` : ''}${s.photo ? '' : '  [no photo]'}`));

  console.log('\n=== siteSettings (church identity) ===');
  const ss = await client.fetch(`*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{
    title, email, phone, serviceTimes, mission,
    "navItems": count(navItems), "footerColumns": count(footerColumns),
    "favicon": defined(favicon),
    socialInstagram, socialFacebook, socialYoutube, watchUrl, giveUrl
  }`);
  console.log(ss ? JSON.stringify(ss, null, 2) : '  MISSING — header/footer run on site.ts fallbacks');

  console.log(`\nSummary: ${missing} singleton(s) missing, ${draftOnly} draft-only.`);
  console.log('Note: the live static site reads PUBLISHED content; draft-only + missing docs render from code fallbacks.\n');
}

run().catch((e) => {
  console.error('Audit failed:', e.message);
  process.exit(1);
});
