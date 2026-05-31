// Events collection. Supports both recurring rhythms (weekly worship, Bible
// study) and one-time dated events (a block fest, a special service).
// Recurring events always show on /events; one-time events drop off the
// "upcoming" list once their date passes (on the next build).

import { defineType, defineField, defineArrayMember } from 'sanity';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version (auto-generated from the title).',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventType',
      title: 'Type',
      type: 'string',
      description: 'Recurring events (weekly worship, Bible study) always show. One-time events show until their date passes.',
      options: {
        list: [
          { title: 'Recurring', value: 'recurring' },
          { title: 'One-time', value: 'oneTime' },
        ],
        layout: 'radio',
      },
      initialValue: 'oneTime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Worship', value: 'Worship' },
          { title: 'Study', value: 'Study' },
          { title: 'Meals', value: 'Meals' },
          { title: 'Music', value: 'Music' },
          { title: 'Fellowship', value: 'Fellowship' },
          { title: 'Service', value: 'Service' },
          { title: 'Special', value: 'Special' },
        ],
      },
    }),
    defineField({
      name: 'scheduleLabel',
      title: 'Schedule (display text)',
      type: 'string',
      description: 'How the time reads on the page. Examples: "Sundays, 11am" or "Saturday, June 27, 11am to 3pm". For recurring events this is the main time shown.',
    }),
    defineField({
      name: 'start',
      title: 'Start date & time',
      type: 'datetime',
      description: 'For one-time events, set the actual date so it sorts and drops off after it passes. Optional for recurring events.',
    }),
    defineField({
      name: 'end',
      title: 'End date & time',
      type: 'datetime',
      description: 'Optional. Used to keep an event on the upcoming list through its end time.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Leave blank to use the church address.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'One or two sentences shown on the events list.',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      description: 'Optional longer details shown on the event page.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration / RSVP link',
      type: 'url',
      description: 'Optional. Adds a button to register or RSVP.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Pin to the top of the upcoming list.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', eventType: 'eventType', schedule: 'scheduleLabel', start: 'start', media: 'image' },
    prepare: ({ title, eventType, schedule, start, media }) => ({
      title: title ?? 'Untitled event',
      subtitle: `${eventType === 'recurring' ? '↻ ' : ''}${schedule ?? (start ? new Date(start).toLocaleDateString() : '')}`,
      media,
    }),
  },
  orderings: [
    { title: 'Start date (soonest first)', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] },
    { title: 'Title', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
});
