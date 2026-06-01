// Events index page singleton. Drives the hero copy + SEO on /events.

import { defineType, defineField } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS } from './blocks';

export const eventsPage = defineType({
  name: 'eventsPage',
  title: 'Events (index page)',
  type: 'document',
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2 }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'specialEyebrow', title: 'Special services eyebrow', type: 'string' }),
    defineField({ name: 'specialHeadline', title: 'Special services headline', type: 'string' }),
    defineField({ name: 'upcomingEyebrow', title: 'Upcoming events eyebrow', type: 'string' }),
    defineField({ name: 'upcomingHeadline', title: 'Upcoming events headline', type: 'string' }),
    defineField({ name: 'upcomingEmpty', title: 'Upcoming empty-state text', type: 'text', rows: 2 }),
    defineField({ name: 'rhythmsEyebrow', title: 'Weekly rhythms eyebrow', type: 'string' }),
    defineField({ name: 'rhythmsHeadline', title: 'Weekly rhythms headline', type: 'string' }),
    defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string' }),
    defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string' }),
    defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      description: 'Add on-brand sections below the hero (text, image + text, cards, quote, CTA band, form, embed). Drag to reorder.',
      of: FLEXIBLE_SECTION_MEMBERS,
    }),
  ],
  preview: { prepare: () => ({ title: 'Events (index page)' }) },
});
