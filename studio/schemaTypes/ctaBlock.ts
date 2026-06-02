// Reusable object type: a CTA button + link.
// Embedded by page singletons wherever a primary/secondary CTA appears.

import { defineType, defineField } from 'sanity';

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'CTA Block',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button text',
      type: 'string',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal page', value: 'internal' },
          { title: 'External URL', value: 'external' },
          { title: 'Email', value: 'email' },
          { title: 'Phone', value: 'phone' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'internalLink',
      title: 'Page to link to',
      type: 'reference',
      to: [
        { type: 'homePage' },
        { type: 'aboutPage' },
        { type: 'faqPage' },
        { type: 'contactPage' },
        { type: 'eventsPage' },
        { type: 'sermonsPage' },
        // removed journalPage and journalEntry targets during church remodel (those types are being deleted)
      ],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Link (full URL or site path)',
      type: 'url',
      description:
        'A full URL like https://example.com, or an internal site path starting with "/" (e.g. /worship, /events). Paths stay in the same tab; full URLs open in a new tab.',
      // allowRelative lets this double as an internal-link field (paths like
      // "/worship"). CtaLink.astro is built to accept relative external hrefs;
      // the default url type would reject them as "Not a valid URL".
      validation: (Rule) => Rule.uri({ allowRelative: true }),
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email address',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value, ctx: any) => {
          if (ctx.parent?.linkType !== 'email') return true;
          if (!value) return 'Email is required';
          return /.+@.+\..+/.test(value) ? true : 'Must be a valid email';
        }),
      hidden: ({ parent }) => parent?.linkType !== 'email',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone number',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'phone',
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { label: 'label', linkType: 'linkType' },
    prepare: ({ label, linkType }) => ({ title: label || '(no label)', subtitle: linkType }),
  },
});
