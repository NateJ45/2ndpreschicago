// Site-wide singleton. Header utility bar, footer, contact info, worship times,
// giving link, mission line, and an optional announcement banner.
// One instance only; singleton enforcement happens in sanity.config.ts.
//
// Remodel note: the interior-designer fields (availability status, service
// areas, travel fees, Google Business / reviews, satisfaction guarantee, and
// the module section-visibility toggles) were removed. Church fields replace them.

import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Configuration, not prose — don't surface in Canvas's AI-assisted writing UI.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'identity', title: 'Identity & contact' },
    { name: 'worship', title: 'Worship & giving' },
    { name: 'social', title: 'Social & footer' },
    { name: 'newsletter', title: 'Newsletter' },
    { name: 'announcement', title: 'Announcement banner' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Church name',
      type: 'string',
      description: 'Used in the browser tab and search results.',
      initialValue: 'Second Presbyterian Church of Chicago',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short tagline shown under the wordmark in the footer.',
      group: 'identity',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'mission',
      title: 'Mission line',
      type: 'text',
      rows: 2,
      description: 'One-sentence mission shown in the footer. Example: "Serving and celebrating Jesus for the good of the world."',
      group: 'identity',
    }),
    defineField({
      name: 'email',
      title: 'Public email',
      type: 'string',
      description: 'Public email address shown on the Contact page and footer.',
      group: 'identity',
      validation: (Rule) =>
        Rule.required().regex(/.+@.+\..+/, { name: 'email', invert: false }),
    }),
    defineField({
      name: 'phone',
      title: 'Phone (optional)',
      type: 'string',
      description: 'Public phone number. Leave blank to hide.',
      group: 'identity',
    }),

    // ── Worship & giving ──────────────────────────────────────────────────────
    defineField({
      name: 'serviceTimes',
      title: 'Service time line',
      type: 'string',
      description: 'Shown in the header utility bar and home service band. Example: "Sundays at 11am".',
      initialValue: 'Sundays at 11am',
      group: 'worship',
    }),
    defineField({
      name: 'watchUrl',
      title: 'Livestream / Watch URL',
      type: 'url',
      description: 'Where "Watch Live" points (YouTube channel or livestream). Leave blank to use the Sermons page.',
      group: 'worship',
    }),
    defineField({
      name: 'giveUrl',
      title: 'Giving link',
      type: 'url',
      description: 'Online giving portal (e.g. Vanco). Leave blank to use the Give page.',
      group: 'worship',
    }),

    // ── Social & footer ───────────────────────────────────────────────────────
    defineField({ name: 'socialInstagram', title: 'Instagram URL', type: 'url', group: 'social' }),
    defineField({ name: 'socialFacebook', title: 'Facebook URL', type: 'url', group: 'social' }),
    defineField({ name: 'socialYoutube', title: 'YouTube URL', type: 'url', group: 'social' }),
    defineField({
      name: 'seoImage',
      title: 'Default social share image',
      type: 'image',
      description: 'The image shown when any page is shared on social media (the Open Graph image). Use a wide image, about 1200 by 630 pixels. Individual pages can override this. Leave blank to use the auto-generated branded cards.',
      options: { hotspot: true },
      group: 'social',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'footerCredit',
      title: 'Footer credit',
      type: 'string',
      description: 'Optional credit line in the footer (e.g., "Site by Nixon Creative Studio").',
      group: 'social',
    }),
    defineField({
      name: 'footerCreditUrl',
      title: 'Footer credit URL',
      type: 'url',
      description: 'Optional. When set, the footer credit becomes a link to this URL (opens in a new tab).',
      group: 'social',
    }),

    // ── Newsletter ──────────────────────────────────────────────────────────
    defineField({
      name: 'newsletter',
      title: 'Newsletter signup',
      type: 'object',
      group: 'newsletter',
      description:
        'Connect an email provider (MailerLite, Buttondown, Mailchimp). Paste the embedded-form action URL and list ID; the secret key goes in env as NEWSLETTER_API_KEY.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable newsletter signup',
          type: 'boolean',
          description: 'When off, the newsletter block does not render anywhere on the site.',
          initialValue: false,
        }),
        defineField({ name: 'providerLabel', title: 'Provider label', type: 'string', description: 'Internal label only. Example: "MailerLite". Not shown to visitors.' }),
        defineField({ name: 'formActionUrl', title: 'Form action URL', type: 'url', description: "The embedded-form POST endpoint from your email provider's dashboard." }),
        defineField({ name: 'audienceId', title: 'Audience / list ID', type: 'string', description: 'Your provider list or audience ID.' }),
        defineField({ name: 'heading', title: 'Heading', type: 'string', description: 'Headline above the signup form. Example: "Get The Record in your inbox."' }),
        defineField({ name: 'blurb', title: 'Blurb', type: 'text', rows: 3, description: 'One or two sentences under the heading explaining what subscribers get.' }),
        defineField({ name: 'buttonLabel', title: 'Button label', type: 'string', initialValue: 'Subscribe' }),
        defineField({ name: 'successMessage', title: 'Success message', type: 'text', rows: 2, description: 'Message shown after a successful signup.' }),
        defineField({ name: 'consentNote', title: 'Consent note', type: 'text', rows: 2, description: 'Small-print consent line near the submit button. Link to /privacy included automatically.' }),
      ],
    }),

    // ── Announcement banner ───────────────────────────────────────────────────
    // Optional site-wide banner for time-sensitive notices (special services,
    // closures). When disabled or empty, nothing renders.
    defineField({
      name: 'announcement',
      title: 'Announcement banner',
      type: 'object',
      group: 'announcement',
      description: 'Optional banner shown at the very top of every page. Use for special services or closures.',
      fields: [
        defineField({ name: 'enabled', title: 'Show banner', type: 'boolean', initialValue: false }),
        defineField({ name: 'text', title: 'Message', type: 'string', description: 'Example: "Join us for Christmas Eve worship at 5pm and 11pm."' }),
        defineField({ name: 'linkLabel', title: 'Link label (optional)', type: 'string' }),
        defineField({ name: 'linkUrl', title: 'Link URL (optional)', type: 'string', description: 'Internal path like "/events" or a full https:// URL.' }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
