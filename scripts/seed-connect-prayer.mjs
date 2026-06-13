// Seed the prayer-request + connect-card experience (user-requested 2026-06-12).
// Pure content: no code changes. Creates two form docs, a /prayer page, places
// the connect card on the worship (I'm New) page, surfaces the footer
// "Prayer Request" link via siteSettings.prayerUrl, and adds a contact-page
// "Who to reach" row.
//
//   node scripts/seed-connect-prayer.mjs            (dry run)
//   node scripts/seed-connect-prayer.mjs --apply
//
// Idempotent: createIfNotExists for new docs; guarded patches for arrays
// (skipped when the target already exists). Never clobbers editor changes.

import { createClient } from '@sanity/client';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const env = loadEnv(root);
const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
});
const APPLY = process.argv.includes('--apply');

// Provider config mirrors the existing live forms (web3forms service; the
// accessKey lives in env as PUBLIC_WEB3FORMS_KEY, not in the document).
// Prayer requests notify the pastoral-care address; connect cards the office.
const FORMS = [
  {
    _id: 'form-prayer-request',
    _type: 'form',
    title: 'Prayer Request',
    slug: { _type: 'slug', current: 'prayer-request' },
    heading: 'How can we pray for you?',
    intro:
      'Our pastor prays over every request. Share as much or as little as you like, and tell us if you would rather keep it just between you and the pastor.',
    mode: 'native',
    provider: { service: 'web3forms', accessKey: '', notifyEmail: 'pastorchesna@secondpreschicago.org' },
    fields: [
      { _key: 'name', _type: 'formField', label: 'Your name (optional)', name: 'name', required: false, type: 'text', width: 'half' },
      { _key: 'email', _type: 'formField', label: 'Email (optional, if you would like us to follow up)', name: 'email', required: false, type: 'email', width: 'half' },
      { _key: 'request', _type: 'formField', label: 'Your request', name: 'request', required: true, type: 'textarea', width: 'full' },
      { _key: 'confidential', _type: 'formField', label: 'Keep this between the pastor and me', name: 'confidential', required: false, type: 'checkbox', width: 'full' },
    ],
    submitLabel: 'Send Request',
    successMessage: 'Thank you for trusting us with this. We are praying with you.',
    consentNote: 'Prayer requests are read only by our pastoral staff. See our privacy policy.',
  },
  {
    _id: 'form-connect-card',
    _type: 'form',
    title: 'Connect Card',
    slug: { _type: 'slug', current: 'connect-card' },
    heading: 'Let us get to know you',
    intro:
      'New to Second, or ready for a next step? Tell us a little about yourself and someone will follow up this week.',
    mode: 'native',
    provider: { service: 'web3forms', accessKey: '', notifyEmail: 'office@secondpreschicago.org' },
    fields: [
      { _key: 'name', _type: 'formField', label: 'Your name', name: 'name', required: true, type: 'text', width: 'full' },
      { _key: 'email', _type: 'formField', label: 'Email', name: 'email', required: true, type: 'email', width: 'half' },
      { _key: 'phone', _type: 'formField', label: 'Phone (optional)', name: 'phone', required: false, type: 'tel', width: 'half' },
      { _key: 'status', _type: 'formField', label: 'I am...', name: 'status', required: false, type: 'select', width: 'half', options: ['Planning my first visit', 'A recent visitor', 'A regular attender', 'Returning after a while'] },
      { _key: 'interest', _type: 'formField', label: 'I would like to...', name: 'interest', required: false, type: 'select', width: 'half', options: ['Talk with the pastor', 'Join a community group', 'Help serve', 'Learn about membership', 'Something else'] },
      { _key: 'message', _type: 'formField', label: 'Anything you want us to know?', name: 'message', required: false, type: 'textarea', width: 'full' },
    ],
    submitLabel: 'Connect',
    successMessage: 'Thank you. Someone from the church will reach out this week.',
    consentNote: 'We only use your details to follow up with you, and never share them. See our privacy policy.',
  },
];

// The /prayer page (generic page type renders hero + sections at /[slug]).
const PRAYER_PAGE = {
  _id: 'page-prayer',
  _type: 'page',
  title: 'Prayer',
  slug: { _type: 'slug', current: 'prayer' },
  heroEyebrow: 'Prayer',
  heroHeadline: 'How can we pray for you?',
  heroSubhead:
    'Our pastor and people pray for the needs of this congregation and our neighborhood every week. We would be honored to pray for yours.',
  seoTitle: 'Prayer Requests · Second Presbyterian Church',
  seoDescription:
    'Share a prayer request with Second Presbyterian Church of Chicago. Our pastor prays over every request, confidentially if you ask.',
  sections: [
    {
      _key: 'prayer-form',
      _type: 'sectionForm',
      heading: 'Share a request',
      form: { _type: 'reference', _ref: 'form-prayer-request' },
    },
  ],
};

// Connect-card section appended to the worship (I'm New) page, rendering
// below the built-in content and above the closing CTA.
const WORSHIP_SECTION = {
  _key: 'connect-card',
  _type: 'sectionForm',
  heading: 'Take a next step',
  intro:
    'Worshiped with us recently, or planning to? Fill out a connect card and someone from the church will follow up this week.',
  form: { _type: 'reference', _ref: 'form-connect-card' },
};

// Contact "Who to reach" row pointing at /prayer.
const CONTACT_ROW = {
  _key: 'contactReasons-prayer',
  _type: 'contactReason',
  label: 'Prayer requests',
  value: 'Share a prayer request',
  href: '/prayer',
};

const [worship, contact, settings] = await Promise.all([
  client.fetch(`*[_id == "worshipPage"][0]{ "keys": flexibleSections[]._key }`),
  client.fetch(`*[_id == "contactPage"][0]{ "hrefs": contactReasons[].href }`),
  client.fetch(`*[_id == "siteSettings"][0]{ prayerUrl }`),
]);

const plan = [];
for (const f of FORMS) plan.push(`createIfNotExists ${f._id}`);
plan.push(`createIfNotExists ${PRAYER_PAGE._id}  (live at /prayer)`);
if (worship?.keys?.includes(WORSHIP_SECTION._key)) plan.push('worshipPage: connect-card section already present, skip');
else plan.push('worshipPage: append connect-card sectionForm to flexibleSections');
if (contact?.hrefs?.includes('/prayer')) plan.push('contactPage: /prayer row already present, skip');
else plan.push('contactPage: append "Prayer requests" who-to-reach row');
if (settings?.prayerUrl) plan.push(`siteSettings.prayerUrl already set (${settings.prayerUrl}), skip`);
else plan.push('siteSettings: set prayerUrl -> https://www.secondpreschicago.org/prayer (footer "Prayer Request" link)');

console.log((APPLY ? 'APPLYING:' : 'DRY RUN (would do):') + '\n  ' + plan.join('\n  '));
if (!APPLY) process.exit(0);

let tx = client.transaction();
for (const f of FORMS) tx = tx.createIfNotExists(f);
tx = tx.createIfNotExists(PRAYER_PAGE);
if (!worship?.keys?.includes(WORSHIP_SECTION._key)) {
  tx = tx.patch('worshipPage', (p) =>
    p.setIfMissing({ flexibleSections: [] }).insert('after', 'flexibleSections[-1]', [WORSHIP_SECTION]),
  );
}
if (!contact?.hrefs?.includes('/prayer')) {
  tx = tx.patch('contactPage', (p) =>
    p.setIfMissing({ contactReasons: [] }).insert('after', 'contactReasons[-1]', [CONTACT_ROW]),
  );
}
if (!settings?.prayerUrl) {
  // Absolute URL so the url-type field validates cleanly in Studio.
  tx = tx.patch('siteSettings', (p) => p.set({ prayerUrl: 'https://www.secondpreschicago.org/prayer' }));
}
const res = await tx.commit();
console.log('\nDone. transactionId:', res.transactionId);
