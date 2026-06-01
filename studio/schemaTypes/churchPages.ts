// Per-page singletons for the church's inline pages (worship, music, grow, etc.).
// Each one carries the page's hero (image + eyebrow/headline/subhead) plus SEO.
// The page bodies still render from inline copy in src/pages/*.astro; these
// singletons let an editor set/override the hero from the Studio, and the site
// falls back to a built-in church photo + the default copy below when a field
// is left empty.
//
// Built with a small factory so all the church page singletons stay identical
// in shape. To add another page: call definePageSingleton(...) and register the
// export in index.ts (schemaTypes), structure.ts (SINGLETON_TYPES + a Pages
// item) and sanity.config.ts (SINGLETON_TYPES set + urlForDoc case).

import { defineType, defineField } from 'sanity';

interface PageDefaults {
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubhead?: string;
}

export function definePageSingleton(
  name: string,
  title: string,
  defaults: PageDefaults = {},
  // Optional per-page extras: extra field groups + extra fields appended after
  // the shared hero + SEO set. Lets a specific page (e.g. weddings) gain its own
  // field (an inquiry-form reference) without changing every other singleton.
  extra: { groups?: { name: string; title: string }[]; fields?: any[] } = {},
) {
  return defineType({
    name,
    title,
    type: 'document',
    // Structural marketing copy — edit fields directly in the Studio, not Canvas.
    options: { canvasApp: { exclude: true } },
    groups: [
      { name: 'hero', title: 'Hero', default: true },
      { name: 'seo', title: 'SEO' },
      ...(extra.groups ?? []),
    ],
    fields: [
      defineField({
        name: 'heroImage',
        title: 'Hero background image',
        type: 'image',
        group: 'hero',
        description:
          'Full-bleed photo behind the hero text. Landscape works best; the page lays a soft dark gradient over the bottom for readability. Leave empty to use the built-in church photo for this page.',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      }),
      defineField({
        name: 'heroEyebrow',
        title: 'Hero eyebrow',
        type: 'string',
        group: 'hero',
        description: 'Small label above the headline. Leave empty to use the default.',
        initialValue: defaults.heroEyebrow,
      }),
      defineField({
        name: 'heroHeadline',
        title: 'Hero headline',
        type: 'string',
        group: 'hero',
        description: 'The big line. Leave empty to use the default.',
        initialValue: defaults.heroHeadline,
      }),
      defineField({
        name: 'heroSubhead',
        title: 'Hero subhead',
        type: 'text',
        rows: 3,
        group: 'hero',
        description: 'One or two sentences under the headline. Leave empty to use the default.',
        initialValue: defaults.heroSubhead,
      }),
      defineField({
        name: 'seoTitle',
        title: 'SEO title',
        type: 'string',
        group: 'seo',
        description: 'Browser tab + Google result title. Aim for 50 to 60 characters.',
        validation: (Rule) => Rule.max(60).warning('Titles longer than ~60 characters get cut off in Google.'),
      }),
      defineField({
        name: 'seoDescription',
        title: 'SEO description',
        type: 'text',
        rows: 3,
        group: 'seo',
        description: 'The sentence under the title in Google results. Aim for 150 to 160 characters.',
        validation: (Rule) => Rule.max(160).warning('Descriptions longer than ~160 characters get cut off in Google.'),
      }),
      defineField({
        name: 'seoImage',
        title: 'Social share image (this page)',
        type: 'image',
        group: 'seo',
        description: 'Optional. Shown when this page is shared. ~1200x630. Overrides the site default.',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      }),
      ...(extra.fields ?? []),
    ],
    preview: { prepare: () => ({ title }) },
  });
}

export const worshipPage = definePageSingleton('worshipPage', "Worship (I'm New)", {
  heroEyebrow: 'Sunday Worship',
  heroHeadline: "There's a place for you here.",
  heroSubhead:
    "Whether you're a weekly churchgoer, haven't been in ages, or don't know anything about Christianity, you are welcome at Second.",
});

export const beliefsPage = definePageSingleton('beliefsPage', 'What We Believe', {
  heroEyebrow: 'What We Believe',
  heroHeadline: 'The faith we share',
  heroSubhead: 'What we hold to be true about humanity, about God, and about the good news of Jesus Christ.',
});

export const musicPage = definePageSingleton('musicPage', 'Music', {
  heroEyebrow: 'Music',
  heroHeadline: 'Our musical life at Second',
  heroSubhead: 'I will sing of your strength, in the morning I will sing of your love. (Psalm 59:16)',
});

export const staffPage = definePageSingleton('staffPage', 'Pastors & Staff', {
  heroEyebrow: 'Pastors & Staff',
  heroHeadline: "The people you'll meet at Second",
  heroSubhead: 'A small, dedicated team serving a historic congregation in the South Loop.',
});

export const growPage = definePageSingleton('growPage', 'Grow', {
  heroEyebrow: 'Get Involved',
  heroHeadline: 'Community Groups at Second',
  heroSubhead: 'Drop in and walk with others on the Way of Jesus.',
});

export const servePage = definePageSingleton('servePage', 'Serve', {
  heroEyebrow: 'Get Involved',
  heroHeadline: 'Love our neighbors',
  heroSubhead:
    'We are called to serve and celebrate Jesus for the good of the world. Much of that happens right here in the South Loop.',
});

export const kidsPage = definePageSingleton('kidsPage', 'Kids', {
  heroEyebrow: 'Get Involved',
  heroHeadline: 'Children are welcome here',
  heroSubhead:
    'At Second, little ones are part of the worshipping congregation, and we welcome their noise and their needs.',
});

export const foodPage = definePageSingleton('foodPage', 'Food Ministry', {
  heroEyebrow: 'Food Ministry',
  heroHeadline: 'Food for all in need, no questions asked',
  heroSubhead: 'Find us at our Cullerton door on Tuesday, Wednesday, Thursday, and Sunday.',
});

export const useOurSpacePage = definePageSingleton(
  'useOurSpacePage',
  'Use Our Space',
  {
    heroEyebrow: 'Use Our Space',
    heroHeadline: 'Interested in using space at Second?',
    heroSubhead:
      'A historic, welcoming building in the heart of the South Loop, open to the wider community throughout the week.',
  },
  {
    groups: [{ name: 'form', title: 'Inquiry form' }],
    fields: [
      defineField({
        name: 'inquiryForm',
        title: 'Inquiry form',
        type: 'reference',
        to: [{ type: 'form' }],
        group: 'form',
        description: 'The form shown in the inquiry section. Leave empty to show a direct email link instead.',
      }),
    ],
  },
);

export const weddingsPage = definePageSingleton(
  'weddingsPage',
  'Weddings',
  {
    heroEyebrow: 'Weddings',
    heroHeadline: 'Get married in a National Historic Landmark',
    heroSubhead:
      'Our 1901 Arts and Crafts sanctuary, home to nine Tiffany windows and extraordinary murals, draws visitors from all over the world. We host weddings of every size.',
  },
  {
    groups: [{ name: 'form', title: 'Inquiry form' }],
    fields: [
      defineField({
        name: 'inquiryForm',
        title: 'Inquiry form',
        type: 'reference',
        to: [{ type: 'form' }],
        group: 'form',
        description: 'The wedding inquiry form. Leave empty to show a direct email link instead.',
      }),
    ],
  },
);

export const givePage = definePageSingleton('givePage', 'Give', {
  heroEyebrow: 'Give',
  heroHeadline: 'Thank you',
  heroSubhead:
    'For entrusting your tithes and offerings to Second. Your generosity sustains worship, music, and a food ministry that feeds our neighbors.',
});

// Collected for easy registration in index.ts.
export const churchPageSingletons = [
  worshipPage,
  beliefsPage,
  musicPage,
  staffPage,
  growPage,
  servePage,
  kidsPage,
  foodPage,
  useOurSpacePage,
  weddingsPage,
  givePage,
];

// Names, in desk order, for structure.ts + sanity.config.ts wiring.
export const CHURCH_PAGE_TYPES = churchPageSingletons.map((s) => s.name);
