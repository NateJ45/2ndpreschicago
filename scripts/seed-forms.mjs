import { loadEnv } from './lib/loadEnv.mjs';
// Seeds the three starter forms (General Contact, Wedding Inquiry, Space Use
// Inquiry) and links them to the contact / weddings / use-our-space singletons.
//
// Idempotent and safe to re-run:
//   - Forms use fixed _ids + createOrReplace, so re-running refreshes them.
//   - References use setIfMissing, so an editor's chosen form is NEVER clobbered.
//
// The Web3Forms access key is left BLANK on purpose. Out of the box each form
// falls back to the visitor's email app (mailto to the office). To switch to
// inbox delivery, paste an access key from web3forms.com into the form's
// "Where submissions go" group in the Studio.
//
// Run: node scripts/seed-forms.mjs

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
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or a write token (SANITY_API_WRITE_TOKEN) in .env.');
  console.error('Schema + UI still ship; create the forms in the Studio (Content -> Forms) instead.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const OFFICE_EMAIL = 'office@secondpreschicago.org';

// Build a formField array member with a stable _key (the field name is unique
// within a form) and the inline object _type.
function field(f) {
  return { _type: 'formField', _key: f.name, width: 'full', required: false, ...f };
}

const FORMS = [
  {
    _id: 'form-general-contact',
    title: 'General Contact',
    slug: 'general-contact',
    mode: 'native',
    fields: [
      field({ label: 'Your name', name: 'name', type: 'text', required: true }),
      field({ label: 'Email', name: 'email', type: 'email', required: true, width: 'half' }),
      field({ label: 'Phone (optional)', name: 'phone', type: 'tel', width: 'half' }),
      field({ label: 'How can we help?', name: 'message', type: 'textarea', required: true }),
    ],
    submitLabel: 'Send Message',
    successMessage: 'Thank you for reaching out. Someone from the church office will be in touch soon.',
    consentNote: 'We will only use your details to respond to your message. See our privacy policy.',
    provider: { service: 'web3forms', accessKey: '', notifyEmail: OFFICE_EMAIL },
  },
  {
    _id: 'form-wedding-inquiry',
    title: 'Wedding Inquiry',
    slug: 'wedding-inquiry',
    mode: 'native',
    fields: [
      field({ label: 'Your name', name: 'partner1Name', type: 'text', required: true, width: 'half' }),
      field({ label: "Partner's name", name: 'partner2Name', type: 'text', width: 'half' }),
      field({ label: 'Email', name: 'email', type: 'email', required: true, width: 'half' }),
      field({ label: 'Phone', name: 'phone', type: 'tel', width: 'half' }),
      field({ label: 'Preferred wedding date', name: 'eventDate', type: 'date', width: 'half' }),
      field({ label: 'Estimated guest count', name: 'guestCount', type: 'text', width: 'half' }),
      field({
        label: 'What are you planning?',
        name: 'ceremonyType',
        type: 'select',
        width: 'half',
        options: ['Ceremony only', 'Ceremony and reception'],
      }),
      field({ label: 'How did you hear about us?', name: 'hearAboutUs', type: 'text', width: 'half' }),
      field({ label: 'Tell us about your day', name: 'message', type: 'textarea' }),
    ],
    submitLabel: 'Send Inquiry',
    successMessage: 'Thank you. Our wedding coordinator will be in touch to talk about your date.',
    consentNote: 'We will only use your details to respond to your inquiry. See our privacy policy.',
    provider: { service: 'web3forms', accessKey: '', notifyEmail: OFFICE_EMAIL },
  },
  {
    _id: 'form-space-use-inquiry',
    title: 'Space Use Inquiry',
    slug: 'space-use-inquiry',
    mode: 'native',
    fields: [
      field({ label: 'Your name', name: 'name', type: 'text', required: true, width: 'half' }),
      field({ label: 'Organization (if any)', name: 'organization', type: 'text', width: 'half' }),
      field({ label: 'Email', name: 'email', type: 'email', required: true, width: 'half' }),
      field({ label: 'Phone', name: 'phone', type: 'tel', width: 'half' }),
      field({ label: 'What kind of event?', name: 'eventType', type: 'text' }),
      field({ label: 'Preferred date', name: 'eventDate', type: 'date', width: 'half' }),
      field({ label: 'Expected attendance', name: 'attendance', type: 'text', width: 'half' }),
      field({ label: 'Anything else we should know?', name: 'message', type: 'textarea' }),
    ],
    submitLabel: 'Send Inquiry',
    successMessage: 'Thank you. We will be in touch about availability and fees.',
    consentNote: 'We will only use your details to respond to your inquiry. See our privacy policy.',
    provider: { service: 'web3forms', accessKey: '', notifyEmail: OFFICE_EMAIL },
  },
];

// Which singleton gets which form reference, and on which field.
const LINKS = [
  { docId: 'contactPage', fieldName: 'contactForm', formId: 'form-general-contact' },
  { docId: 'weddingsPage', fieldName: 'inquiryForm', formId: 'form-wedding-inquiry' },
  { docId: 'useOurSpacePage', fieldName: 'inquiryForm', formId: 'form-space-use-inquiry' },
];

async function run() {
  for (const f of FORMS) {
    const doc = {
      _id: f._id,
      _type: 'form',
      title: f.title,
      slug: { _type: 'slug', current: f.slug },
      mode: f.mode,
      fields: f.fields,
      submitLabel: f.submitLabel,
      successMessage: f.successMessage,
      consentNote: f.consentNote,
      provider: f.provider,
    };
    await client.createOrReplace(doc);
    console.log(`  upserted form ${f._id} (${f.fields.length} fields)`);
  }

  for (const { docId, fieldName, formId } of LINKS) {
    const ref = { _type: 'reference', _ref: formId };
    // Published + draft (if any). setIfMissing never overwrites an editor's choice.
    for (const id of [docId, `drafts.${docId}`]) {
      try {
        await client.patch(id).setIfMissing({ [fieldName]: ref }).commit({ visibility: 'async' });
        console.log(`  linked ${id}.${fieldName} -> ${formId} (if missing)`);
      } catch (e) {
        // A missing draft is expected and fine; report anything else.
        const msg = String(e?.message || '');
        const is404 = msg.includes('not found') || String(e?.statusCode) === '404';
        if (!is404) console.log(`  skip ${id}: ${e.message}`);
      }
    }
  }

  console.log(`\nDone. Seeded ${FORMS.length} forms and linked ${LINKS.length} pages.`);
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
