// Contact page singleton. Email, social links, service area come from siteSettings.
// Form field options (project types) are wired in the Astro component, not Sanity.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'form', title: 'Form intro + expectations' },
    // removed empty interior-designer scheduling group during church remodel
  ],
  fields: [
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

    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', initialValue: 'Contact' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', initialValue: 'Start the Conversation.' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2, group: 'hero' }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image',
      type: 'image',
      group: 'hero',
      description: 'Full-bleed photo behind the hero text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in handwritten Pinyon Script. Must match exactly (case-sensitive). Leave blank to skip.',
    }),

    defineField({
      name: 'formIntroNote',
      title: 'Form intro note',
      type: 'text',
      rows: 3,
      group: 'form',
      description: 'Pre-submit expectation note shown above the form.',
    }),
    // removed interior-designer contact form dropdown option fields (formProjectTypeOptions, formLocationOptions, formBudgetOptions, formTimelineOptions, formSourceOptions) during church remodel
    defineField({
      name: 'whatToExpectEyebrow',
      title: '"What to expect" eyebrow',
      type: 'string',
      group: 'form',
      initialValue: 'What to Expect.',
    }),
    defineField({
      name: 'whatToExpectHeadline',
      title: '"What to expect" headline',
      type: 'string',
      group: 'form',
      initialValue: 'When you submit this form...',
    }),
    defineField({
      name: 'whatToExpectContent',
      title: '"What to expect" content',
      type: 'array',
      group: 'form',
      description: 'The "no automated sequence" copy.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
    }),
    // removed interior-designer postInquiryRoadmap field during church remodel

    // removed interior-designer scheduling fields (schedulingLink, schedulingLinkLabel, availabilityNote) during church remodel

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description: 'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});
