// Seeds the Pastors & Staff (staffMember) collection from the bios + headshots
// that previously lived only as a hardcoded fallback in src/pages/pastor-staff.astro.
// Uploads each headshot from src/assets to the Sanity asset library, then creates
// the staffMember documents (fixed _ids + createOrReplace).
//
// Run ONCE: node scripts/seed-staff.mjs
// (Re-running re-uploads the photos as new assets, so avoid unless intended.)

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
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

const OFFICE_EMAIL = 'office@secondpreschicago.org';
const PASTOR_EMAIL = 'pastorchesna@secondpreschicago.org';

// Each bio paragraph becomes one Portable Text block.
function bio(paragraphs) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `b${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
  }));
}

function favorites(pairs) {
  return pairs.map(([label, value], i) => ({ _type: 'favoriteItem', _key: `fav${i}`, label, value }));
}

const STAFF = [
  {
    id: 'staff-chesna-hinkley',
    name: 'Rev. Chesna Hinkley',
    role: 'Interim Pastor',
    email: PASTOR_EMAIL,
    photo: 'chesna-hinkley.webp',
    displayOrder: 1,
    bio: [
      'The Rev. Chesna Hinkley has been Interim Pastor at Second since the fall of 2024. She holds degrees from Princeton Theological Seminary and the University of Pittsburgh, where she concentrated in neuroscience, and she is pursuing a Doctor of Ministry in Reformed Theology at Pittsburgh Theological Seminary.',
      "She was ordained in 2021 at Madison Avenue Presbyterian Church in New York City, where she led children's ministry, mission, adult education, and the young adult group. At work, her passions are people, preaching, and strategizing for the future.",
      'Outside of ministry she loves literature, traveling (23 countries and 28 states so far), sharing meals with friends, and keeping company with her cat, Regan.',
    ],
    favorites: [
      ['Reading', 'The Divine Conspiracy by Dallas Willard, and When You Are Engulfed in Flames by David Sedaris'],
      ['Watching', '30 Rock, Midnight Mass, and Ozark'],
      ['Listening', 'The Ezra Klein Show, the Bible Project podcast, and Sufjan Stevens'],
    ],
  },
  {
    id: 'staff-judy-landt',
    name: 'Rev. Judy Landt',
    role: 'Parish Associate',
    email: null,
    photo: 'judy-landt.webp',
    displayOrder: 2,
    bio: [
      'The Rev. Judy Landt serves as Parish Associate at Second. She holds a Master of Divinity from McCormick Theological Seminary, BA and MAT degrees from the University of Chicago, and a JD from Illinois Institute of Technology Chicago-Kent College of Law.',
      'She was ordained as a Minister of Word and Sacrament in the PCUSA in 2003, and has served churches in Illinois, Wisconsin, and Minnesota. She is also experienced as a mediator and conflict consultant for churches, families, businesses, and courts.',
    ],
    favorites: [],
  },
  {
    id: 'staff-michael-shawgo',
    name: 'Michael Shawgo',
    role: 'Director of Music & Organist',
    email: null,
    photo: 'michael-shawgo.webp',
    displayOrder: 3,
    bio: [
      'Michael Shawgo earned his Bachelor of Music in Organ Performance from Illinois Wesleyan University in Bloomington, studying under Dr. David Gehrenbeck. He has additionally studied with J. Marcus Ritchie at the Cathedral of St. Philip in Atlanta and with Dexter Bailey in Chicago.',
      'He is a member of the American Guild of Organists, the Organ Historical Society, the American Theatre Organ Society, and Phi Mu Alpha.',
    ],
    favorites: [
      ['Reading', 'Grant Williams by Giancarlo Stampalia'],
      ['Watching', 'Downton Abbey'],
      ['Listening', '20s and 30s blues and jazz, and opera'],
    ],
  },
  {
    id: 'staff-ashley-mclean',
    name: 'Ashley McLean',
    role: 'Office Administrator',
    email: OFFICE_EMAIL,
    photo: 'ashley-mclean.webp',
    displayOrder: 4,
    bio: [
      'Ashley McLean is the Office Administrator at Second. She has a background in communications, graphic arts, and office management.',
      'Ashley likes making jewelry, experimenting with her 3D printer, and working on home improvement and decor projects around the house. She and her fiance have two dogs, James Brown (JB) and Bella, who is blind, and together they love to cook and try new recipes.',
    ],
    favorites: [
      ['Reading', "The Artist's Way by Julia Cameron, and women's health"],
      ['Watching', 'documentaries and docuseries'],
      ['Listening', '90s and 00s neo soul and R&B, and audiobooks'],
    ],
  },
];

async function run() {
  for (const person of STAFF) {
    const filePath = resolve(root, 'src/assets', person.photo);
    const asset = await client.assets.upload('image', readFileSync(filePath), { filename: person.photo });
    console.log(`  uploaded ${person.photo} -> ${asset._id}`);

    const doc = {
      _id: person.id,
      _type: 'staffMember',
      name: person.name,
      role: person.role,
      ...(person.email ? { email: person.email } : {}),
      photo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: `${person.name}, ${person.role} at Second Presbyterian Church`,
      },
      bio: bio(person.bio),
      ...(person.favorites.length ? { favorites: favorites(person.favorites) } : {}),
      displayOrder: person.displayOrder,
    };
    await client.createOrReplace(doc);
    console.log(`  upserted ${person.id} — ${person.name} (${person.role})`);
  }
  console.log(`\nDone. Seeded ${STAFF.length} staff members.`);
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
