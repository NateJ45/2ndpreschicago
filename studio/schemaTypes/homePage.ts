// Home page singleton. Content for hero and final CTA.
// removed interior-designer sections (meet founder, featured work, featured journal,
// process preview, testimonials, services grid, service-area cue) during church remodel.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    // removed interior-designer groups (meetFounder, featuredWork, featuredJournal, process, testimonials, services) during church remodel
    { name: 'final', title: 'Final CTA' },
  ],
  fields: [
    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab and Google result title. Aim for 50 to 60 characters. Front-load the location or service.',
      validation: (Rule) => Rule.max(60).warning('Titles longer than about 60 characters get cut off in Google search results.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'The sentence under the title in Google results. Aim for 150 to 160 characters. Write it for a person, not a search engine.',
      validation: (Rule) => Rule.max(160).warning('Descriptions longer than about 160 characters get cut off in Google search results.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Social share image (this page)',
      type: 'image',
      group: 'seo',
      description: 'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site Settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),

    // Hero
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero' }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 3, group: 'hero' }),
    defineField({
      name: 'heroImage',
      title: 'Hero image (legacy)',
      type: 'image',
      group: 'hero',
      hidden: true,
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero images',
      type: 'array',
      group: 'hero',
      description:
        'The home hero. Add one photo for a single static hero. Add two or more for a slow cross-fading slideshow with a subtle zoom. Drag to set the order they appear in.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'heroPrimaryCta', title: 'Primary CTA', type: 'ctaBlock', group: 'hero' }),
    defineField({ name: 'heroSecondaryCta', title: 'Secondary CTA', type: 'ctaBlock', group: 'hero' }),
    defineField({
      name: 'heroRotatingWords',
      title: 'Rotating first-word swap (optional)',
      type: 'array',
      group: 'hero',
      description:
        'On the first visit per session, the FIRST word of the headline cycles through this list once before locking back to the original. Leave empty (or with fewer than 2 alternates) to skip the effect. Example: ["Lived-in", "Considered", "Quiet"]. Honors prefers-reduced-motion.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in handwritten Pinyon Script for editorial flourish. Must match the word exactly (case-sensitive). The first occurrence wins. Leave blank to skip. Note: when "rotating words" is also set, the rotation wins and this is ignored.',
    }),

    // removed interior-designer meetFounder, featuredWork, and featuredJournal field blocks during church remodel

    // removed interior-designer process preview, testimonials, and services grid field blocks during church remodel

    // Final CTA
    // removed interior-designer serviceAreaCue field during church remodel
    defineField({ name: 'finalCtaEyebrow', title: 'Final CTA eyebrow', type: 'string', group: 'final', initialValue: 'Ready to Begin?' }),
    defineField({ name: 'finalCtaHeadline', title: 'Final CTA headline', type: 'string', group: 'final', initialValue: 'Whoever you are, you are welcome here.' }),
    defineField({
      name: 'finalCtaScriptAccent',
      title: 'Final CTA heading script accent (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in handwritten Pinyon Script. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({ name: 'finalCtaSubhead', title: 'Final CTA subhead', type: 'text', rows: 2, group: 'final', initialValue: "Let's start with a conversation." }),
    defineField({ name: 'finalCta', title: 'Final CTA button', type: 'ctaBlock', group: 'final' }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
