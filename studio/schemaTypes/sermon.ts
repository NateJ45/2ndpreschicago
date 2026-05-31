// Sermons collection. A sermon/message with video (and optional audio),
// speaker, series, and scripture. Powers /sermons and /sermons/[slug].

import { defineType, defineField, defineArrayMember } from 'sanity';

export const sermon = defineType({
  name: 'sermon',
  title: 'Sermon',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date preached',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'speaker', title: 'Speaker', type: 'string' }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
      description: 'Optional. Groups sermons that belong to a teaching series.',
    }),
    defineField({
      name: 'scripture',
      title: 'Scripture',
      type: 'string',
      description: 'Primary passage, e.g. "John 1:1-14".',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube or Vimeo link. Used for the embedded player and the watch link.',
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio URL (optional)',
      type: 'url',
      description: 'Direct link to an audio file or podcast episode.',
    }),
    defineField({
      name: 'description',
      title: 'Summary / notes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }] },
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Thumbnail image (optional)',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Pin to the top of the sermons page.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', speaker: 'speaker', date: 'date', media: 'image' },
    prepare: ({ title, speaker, date, media }) => ({
      title: title ?? 'Untitled sermon',
      subtitle: [speaker, date ? new Date(date).toLocaleDateString() : null].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Series', name: 'series', by: [{ field: 'series', direction: 'asc' }, { field: 'date', direction: 'desc' }] },
  ],
});
