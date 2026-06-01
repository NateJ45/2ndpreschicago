// Ministries collection. Audience-oriented ministries (Grow / Serve / Kids /
// Food, plus any the church adds). Powers the home "Get involved" next-step
// cards and can drive a ministries grid. Content-driven so a new church swaps
// ministries without touching code.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const ministry = defineType({
  name: 'ministry',
  title: 'Ministry',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audience',
      title: 'Who it is for',
      type: 'string',
      options: {
        list: [
          { title: 'Everyone', value: 'everyone' },
          { title: 'Families', value: 'families' },
          { title: 'Kids', value: 'kids' },
          { title: 'Youth', value: 'youth' },
          { title: 'Adults', value: 'adults' },
          { title: 'Seniors', value: 'seniors' },
          { title: 'Neighbors in need', value: 'neighbors' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'everyone',
    }),
    defineField({
      name: 'summary',
      title: 'Short summary',
      type: 'text',
      rows: 2,
      description: 'One or two sentences for the ministry card.',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'image',
      title: 'Image (optional)',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'link',
      title: 'Learn-more link',
      type: 'string',
      description: 'Where the card points, e.g. "/grow" or a full https:// URL.',
    }),
    defineField({
      name: 'description',
      title: 'Full description (optional)',
      type: 'array',
      of: [defineArrayMember({ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [{ title: 'Bullet', value: 'bullet' }] })],
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 10,
    }),
    defineField({
      name: 'featured',
      title: 'Feature on the home page',
      type: 'boolean',
      description: 'Show in the home "Get involved" next-step row.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'audience', media: 'image' },
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }, { field: 'title', direction: 'asc' }] },
  ],
});
