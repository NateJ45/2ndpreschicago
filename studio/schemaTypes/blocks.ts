// Shared "page builder" block library. These object types are the building
// blocks for flexibleSections[] on the generic `page` type (and, later, any page
// singleton). Each renders on-brand via a matching component in
// src/components/blocks/. Editors add/remove/reorder them with no developer.
//
// Naming: all block types are prefixed `section` so they read clearly in the
// Studio "Add item" menu and never collide with document types. The shared
// `embed` object (embed.ts) is also allowed in flexibleSections.

import { defineType, defineField, defineArrayMember } from 'sanity';

// Reusable rich-text body (paragraphs, headings, lists, links).
const richBody = {
  type: 'array' as const,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h3' },
        { title: 'Subheading', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
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
            fields: [
              { name: 'href', type: 'url', title: 'URL', validation: (R: any) => R.uri({ allowRelative: true }) },
              { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab' },
            ],
          },
        ],
      },
    }),
  ],
};

export const sectionRichText = defineType({
  name: 'sectionRichText',
  title: 'Text section',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', ...richBody }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      options: { list: [{ title: 'Left', value: 'left' }, { title: 'Center', value: 'center' }], layout: 'radio' },
      initialValue: 'left',
    }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Text section' }) },
});

export const sectionImageText = defineType({
  name: 'sectionImageText',
  title: 'Image + text',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'imageSide',
      title: 'Image side',
      type: 'string',
      options: { list: [{ title: 'Left', value: 'left' }, { title: 'Right', value: 'right' }], layout: 'radio' },
      initialValue: 'right',
    }),
    defineField({ name: 'arched', title: 'Arched image (church motif)', type: 'boolean', initialValue: true }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', ...richBody }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button link', type: 'string', description: 'Internal path like "/give" or a full URL.' }),
  ],
  preview: { select: { title: 'heading', media: 'image' }, prepare: ({ title, media }) => ({ title: title || 'Image + text', media }) },
});

export const sectionCardGrid = defineType({
  name: 'sectionCardGrid',
  title: 'Card grid',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'string',
      options: { list: ['2', '3', '4'], layout: 'radio' },
      initialValue: '3',
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'card',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({ name: 'link', title: 'Link', type: 'string', description: 'Optional. Makes the card clickable.' }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Card grid' }) },
});

export const sectionQuote = defineType({
  name: 'sectionQuote',
  title: 'Quote / scripture',
  type: 'object',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (R) => R.required() }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string', description: 'e.g. a person or a scripture reference.' }),
  ],
  preview: { select: { title: 'quote', subtitle: 'attribution' } },
});

export const sectionCtaBand = defineType({
  name: 'sectionCtaBand',
  title: 'Call-to-action band',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 2 }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button link', type: 'string', description: 'Internal path like "/worship" or a full URL.' }),
  ],
  preview: { select: { title: 'headline' }, prepare: ({ title }) => ({ title: title || 'CTA band' }) },
});

export const sectionForm = defineType({
  name: 'sectionForm',
  title: 'Form',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({ name: 'form', title: 'Form', type: 'reference', to: [{ type: 'form' }], validation: (R) => R.required() }),
  ],
  preview: { select: { title: 'heading', form: 'form.title' }, prepare: ({ title, form }) => ({ title: title || form || 'Form' }) },
});

// All block types collected for registration in index.ts.
export const sectionBlocks = [
  sectionRichText,
  sectionImageText,
  sectionCardGrid,
  sectionQuote,
  sectionCtaBand,
  sectionForm,
];

// The array members allowed in a flexibleSections[] field (includes the shared
// embed object). Used by the generic `page` type and any page that opts in.
export const FLEXIBLE_SECTION_MEMBERS = [
  { type: 'sectionRichText' },
  { type: 'sectionImageText' },
  { type: 'sectionCardGrid' },
  { type: 'sectionQuote' },
  { type: 'sectionCtaBand' },
  { type: 'sectionForm' },
  { type: 'embed' },
];
