// Sermons index page singleton. Hero copy + SEO for /sermons.

import { defineType, defineField } from 'sanity';

export const sermonsPage = defineType({
  name: 'sermonsPage',
  title: 'Sermons (index page)',
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
      name: 'livestreamUrl',
      title: 'Livestream URL',
      type: 'url',
      description: 'Where Sunday worship streams (e.g. the church YouTube). Shown as the Watch Live button.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Sermons (index page)' }) },
});
