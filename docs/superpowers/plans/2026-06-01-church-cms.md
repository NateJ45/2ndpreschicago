# Church CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax. This project has **no unit-test runner**; "verification" means `npm run typegen` clean, `npm run build` green, `npm run build` green, and Playwright screenshots of touched pages (light/dark, mobile/desktop). TDD test-fail/test-pass cycles are replaced by these gates.

**Goal:** Let a non-technical pastor + secretary run the entire Second Pres site from Sanity for a year (configurable forms, announcements, operational content, fully editable pages), while keeping the project a reusable church template.

**Architecture:** Sanity schemas + GROQ getters (single `sanityFetch` chokepoint with inline fallbacks) feed Astro static pages and a few React islands. New: a `form` collection rendered by a `FormRenderer` island (native fields → Web3Forms/Formspree/mailto; embed → shared `Embed` island that re-creates `<script>` elements so Subsplash/Planning Center embeds run). Later phases add operational collections, a seasonal hero, and a shared block library + `Sections.astro` renderer.

**Tech Stack:** Astro 6 (static), Sanity v5, React 19 islands, Tailwind v4 (`@theme` tokens), Web3Forms, Cloudflare. Source spec: `docs/superpowers/specs/2026-06-01-church-cms-editability-design.md`.

**Conventions (carried):** No em-dashes in public copy. Build light+dark, mobile+desktop. Desktop nav stays server-rendered. `/what-we-believe` copy is leadership's (seed verbatim). After ANY schema change: `npm run typegen` → wire/seed → build → `npm run studio:deploy` → commit. Never click "Remove field" (use a cleanup script). Back up the dataset before destructive migrations. Don't run `npm run build` while the dev server is up.

**Branch:** `feature/church-cms` (already created off master).

---

## File Structure (created / modified across all phases)

**Phase 1 — forms**
- Create `src/sanity/schemaTypes/form.ts` — the `form` collection + inline `formField` object.
- Create `src/components/Embed.tsx` — shared iframe / script-safe embed island (reused in Phase 2).
- Create `src/components/FormRenderer.tsx` — native + embed form island.
- Create `src/components/FormBlock.astro` — resolves a form (or fallback) and mounts the island.
- Create `scripts/seed-forms.mjs` — idempotent seed of 3 forms + reference wiring.
- Modify `src/sanity/schemaTypes/churchPages.ts` — factory gains optional `extraGroups`/`extraFields`; weddings + use-our-space get an `inquiryForm` reference.
- Modify `src/sanity/schemaTypes/contactPage.ts` — add `contactForm` reference.
- Modify `src/sanity/schemaTypes/index.ts` — register `form`.
- Modify `src/sanity/structure.ts` — add `form` to the Content list.
- Modify `src/lib/queries.ts` — `FORM_PROJECTION`, `getContactPage` (form-aware), `getWeddingsPage`, `getUseOurSpacePage`, `getForm`.
- Modify `src/pages/contact.astro`, `src/pages/weddings.astro`, `src/pages/use-our-space.astro` — render the form via `FormBlock`.

**Phase 2 — operational + integrations**
- Create `src/sanity/schemaTypes/announcement.ts`, `worshipResource.ts`, `sermonSeries.ts`, `embed.ts` (object).
- Modify `event.ts`, `ministry.ts` (enrich), `siteSettings.ts` (Connect & integrations group; drop `announcement` object), `sermon.ts` (`series` → reference), `index.ts`, `structure.ts`, `sanity.config.ts`.
- Create `src/components/EmbedBlock.astro`; worship-resources section partial; `/ministries` index.
- Migrations: `scripts/migrate-sermon-series.mjs`, extend cleanup for `siteSettings.announcement`.
- Modify `src/lib/queries.ts`, `src/layouts/BaseLayout.astro`, `/worship`, `/events`, home.

**Phase 3 — home + seasonal hero**
- Modify `src/sanity/schemaTypes/homePage.ts` (heroKeyword, `seasonalHero` object, `thisSunday` object, home section copy fields), `src/pages/index.astro`, `src/lib/queries.ts`.

**Phase 4 — full editability**
- Create `src/sanity/schemaTypes/blocks/*` (richText, imageText, cardGrid, quote, ctaBand, accordion, embed ref, formRef, gallery, dynamicList) + `src/components/Sections.astro` + one component per block.
- Add structured fields + `flexibleSections[]` to each page singleton; convert each `.astro` to render from Sanity with inline copy as fallback. Optional generic `page` type + `/[slug]`.
- Seed every field from current copy.

> Phases 1–2 are specified task-by-task below. Phases 3–4 are specified structurally (file + field + render + verify); their fine-grained tasks are written just-in-time when reached, because their shape depends on decisions locked in during Phases 1–2 (block render conventions, integration fields). This is deliberate, not a placeholder.

---

## PHASE 1 — Configurable contact forms

### Task 1.1: `form` schema (collection + `formField` object)

**Files:** Create `src/sanity/schemaTypes/form.ts`; Modify `src/sanity/schemaTypes/index.ts`.

- [ ] **Step 1: Write `src/sanity/schemaTypes/form.ts`**

```ts
// Configurable contact/inquiry form. A church admin builds a form here (native
// fields submitted via Web3Forms/Formspree/email) OR pastes an external embed
// (Subsplash sign-up, Google Form, Planning Center). Referenced from pages
// (contact, weddings, use-our-space) and, in Phase 4, droppable as a page block.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const form = defineType({
  name: 'form',
  title: 'Form',
  type: 'document',
  groups: [
    { name: 'content', title: 'Heading + intro', default: true },
    { name: 'fields', title: 'Fields' },
    { name: 'provider', title: 'Where submissions go' },
    { name: 'embed', title: 'External embed' },
  ],
  fields: [
    defineField({
      name: 'title', title: 'Internal name', type: 'string',
      description: 'For your reference in the Studio, e.g. "Wedding Inquiry". Not shown on the site.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug',
      options: { source: 'title' }, validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heading', title: 'Heading (shown above the form)', type: 'string', group: 'content' }),
    defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 3, group: 'content' }),
    defineField({
      name: 'mode', title: 'Form type', type: 'string', group: 'content',
      options: {
        list: [
          { title: 'Build fields here (native)', value: 'native' },
          { title: 'Paste an external embed', value: 'embed' },
        ],
        layout: 'radio',
      },
      initialValue: 'native', validation: (Rule) => Rule.required(),
    }),

    // ---- Native mode ----
    defineField({
      name: 'fields', title: 'Fields', type: 'array', group: 'fields',
      hidden: ({ parent }) => parent?.mode === 'embed',
      of: [
        defineArrayMember({
          type: 'object', name: 'formField',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'name', title: 'Field key', type: 'string',
              description: 'Sent with the submission, e.g. "email", "eventDate". Lowercase, no spaces.',
              validation: (R) => R.required().regex(/^[a-zA-Z0-9_]+$/, { name: 'letters, numbers, underscore' }),
            }),
            defineField({
              name: 'type', title: 'Type', type: 'string',
              options: {
                list: [
                  { title: 'Short text', value: 'text' },
                  { title: 'Email', value: 'email' },
                  { title: 'Phone', value: 'tel' },
                  { title: 'Long text', value: 'textarea' },
                  { title: 'Dropdown', value: 'select' },
                  { title: 'Checkbox', value: 'checkbox' },
                  { title: 'Date', value: 'date' },
                ],
              },
              initialValue: 'text', validation: (R) => R.required(),
            }),
            defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: false }),
            defineField({ name: 'placeholder', title: 'Placeholder', type: 'string' }),
            defineField({ name: 'helpText', title: 'Help text', type: 'string' }),
            defineField({
              name: 'options', title: 'Dropdown options', type: 'array', of: [{ type: 'string' }],
              hidden: ({ parent }) => parent?.type !== 'select',
            }),
            defineField({
              name: 'width', title: 'Width', type: 'string',
              options: { list: [{ title: 'Full', value: 'full' }, { title: 'Half', value: 'half' }], layout: 'radio' },
              initialValue: 'full',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'type' } },
        }),
      ],
    }),
    defineField({
      name: 'submitLabel', title: 'Submit button label', type: 'string', group: 'fields',
      initialValue: 'Send', hidden: ({ parent }) => parent?.mode === 'embed',
    }),
    defineField({
      name: 'successMessage', title: 'Success message', type: 'text', rows: 2, group: 'fields',
      initialValue: 'Thank you. We will be in touch soon.', hidden: ({ parent }) => parent?.mode === 'embed',
    }),
    defineField({
      name: 'consentNote', title: 'Consent note (small print)', type: 'text', rows: 2, group: 'fields',
      description: 'Shown under the button. If it contains "privacy policy", that phrase links to /privacy.',
      hidden: ({ parent }) => parent?.mode === 'embed',
    }),

    // ---- Provider ----
    defineField({
      name: 'provider', title: 'Where submissions go', type: 'object', group: 'provider',
      hidden: ({ parent }) => parent?.mode === 'embed',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'service', title: 'Service', type: 'string',
          options: {
            list: [
              { title: 'Web3Forms (email delivery, free)', value: 'web3forms' },
              { title: 'Formspree', value: 'formspree' },
              { title: 'Open visitor email app (mailto)', value: 'email' },
            ],
          },
          initialValue: 'web3forms',
        }),
        defineField({
          name: 'accessKey', title: 'Access key / form ID', type: 'string',
          description: 'Web3Forms: your access key from web3forms.com. Formspree: the form ID. Leave blank to fall back to the site default or the visitor email app.',
        }),
        defineField({
          name: 'notifyEmail', title: 'Notification email', type: 'string',
          description: 'Where replies should go. Used as the mailto target when Service is "Open visitor email app".',
        }),
      ],
    }),

    // ---- Embed mode ----
    defineField({
      name: 'embedUrl', title: 'Embed URL (simple iframe)', type: 'url', group: 'embed',
      description: 'A page URL to show in an iframe (e.g. a Google Form). For Subsplash/Planning Center script embeds, paste the snippet below instead.',
      hidden: ({ parent }) => parent?.mode !== 'embed',
    }),
    defineField({
      name: 'embedHtml', title: 'Embed snippet (HTML)', type: 'text', rows: 6, group: 'embed',
      description: 'Paste the full embed code from Subsplash, Planning Center, Jotform, etc. Scripts are executed safely.',
      hidden: ({ parent }) => parent?.mode !== 'embed',
    }),
  ],
  preview: {
    select: { title: 'title', mode: 'mode' },
    prepare: ({ title, mode }) => ({ title: title || 'Form', subtitle: mode === 'embed' ? 'External embed' : 'Native form' }),
  },
});
```

- [ ] **Step 2: Register in `src/sanity/schemaTypes/index.ts`** — import `form` and add it to the object-types block (top, since pages reference it) right after `ctaBlock`:

```ts
import { form } from './form';
// ...
export const schemaTypes = [
  ctaBlock,
  form,
  // Singletons ...
```

- [ ] **Step 3: Verify Studio compiles** — Run: `npm run build` — Expected: green (no schema errors).

- [ ] **Step 4: Commit** — `git add src/sanity/schemaTypes/form.ts src/sanity/schemaTypes/index.ts && git commit -m "Add configurable form schema (native fields + external embed)"`

### Task 1.2: Page reference fields (factory extension + contactPage)

**Files:** Modify `src/sanity/schemaTypes/churchPages.ts`, `src/sanity/schemaTypes/contactPage.ts`.

- [ ] **Step 1: Extend the factory** — change `definePageSingleton` signature to accept extra groups + fields; insert `...(extra.fields ?? [])` as the last entry of the `fields` array (after `seoImage`), and `...(extra.groups ?? [])` after the seo group. Import `defineField` is already present.

```ts
export function definePageSingleton(
  name: string,
  title: string,
  defaults: PageDefaults = {},
  extra: { groups?: { name: string; title: string }[]; fields?: any[] } = {},
) {
  return defineType({
    name, title, type: 'document',
    options: { canvasApp: { exclude: true } },
    groups: [
      { name: 'hero', title: 'Hero', default: true },
      { name: 'seo', title: 'SEO' },
      ...(extra.groups ?? []),
    ],
    fields: [
      // ... existing hero + seo fields unchanged ...
      ...(extra.fields ?? []),
    ],
    preview: { prepare: () => ({ title }) },
  });
}
```

- [ ] **Step 2: Wire the inquiry form into weddings + use-our-space** — add the 4th arg to their `definePageSingleton(...)` calls:

```ts
}, {
  groups: [{ name: 'form', title: 'Inquiry form' }],
  fields: [
    defineField({
      name: 'inquiryForm', title: 'Inquiry form', type: 'reference', to: [{ type: 'form' }], group: 'form',
      description: 'The form shown in the inquiry section. Leave empty to show a direct email link instead.',
    }),
  ],
});
```

- [ ] **Step 3: Add `contactForm` to `contactPage.ts`** — add to the `form` group, after `formIntroNote`:

```ts
defineField({
  name: 'contactForm', title: 'Contact form', type: 'reference', to: [{ type: 'form' }], group: 'form',
  description: 'The form shown on the contact page. Leave empty to show direct contact links only.',
}),
```

- [ ] **Step 4: Typegen + Studio build** — Run: `npm run typegen` then `npm run build` — Expected: both green.

- [ ] **Step 5: Commit** — `git add studio/ src/lib/sanity.types.ts && git commit -m "Wire form references into contact, weddings, use-our-space singletons"`

### Task 1.3: `Embed.tsx` shared island

**Files:** Create `src/components/Embed.tsx`.

- [ ] **Step 1: Write the component** — handles iframe (`url`) and script-safe HTML (`html`). Uses `DOMParser` + node import (no raw-HTML assignment) and re-creates every `<script>` so Subsplash/Planning Center embeds actually run.

```tsx
// Shared embed renderer. Two modes:
//   url  -> a plain <iframe> (Google Forms, calendars, maps, simple players).
//   html -> arbitrary pasted markup (Subsplash "Smart Embeds", Planning Center
//           sign-ups). We parse the markup with DOMParser and append the nodes,
//           then re-create every <script> element (copying src + attributes +
//           inline code) so the browser executes them — parsed/imported scripts
//           do NOT auto-run. Editor-only input (authenticated Studio users).
// Reused by FormRenderer (embed-mode forms) and the Phase 2 `embed` page block.

import { useEffect, useRef } from 'react';

export interface EmbedProps {
  mode: 'url' | 'html';
  url?: string | null;
  html?: string | null;
  title?: string;
  /** Aspect ratio for url iframes, e.g. "16/9". Omit for auto height. */
  aspect?: string | null;
}

export default function Embed({ mode, url, html, title, aspect }: EmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== 'html' || !html || !containerRef.current) return;
    const container = containerRef.current;
    container.replaceChildren();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    for (const node of Array.from(parsed.body.childNodes)) {
      container.appendChild(document.importNode(node, true));
    }
    // Imported scripts don't execute; re-create them so embeds load.
    for (const old of Array.from(container.querySelectorAll('script'))) {
      const next = document.createElement('script');
      for (const attr of Array.from(old.attributes)) next.setAttribute(attr.name, attr.value);
      if (old.textContent) next.textContent = old.textContent;
      old.parentNode?.replaceChild(next, old);
    }
  }, [mode, html]);

  if (mode === 'url' && url) {
    return (
      <div
        className="overflow-hidden rounded-md border border-border-soft"
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <iframe
          src={url}
          title={title || 'Embedded content'}
          loading="lazy"
          className="w-full"
          style={{ border: 0, minHeight: aspect ? undefined : 480, height: aspect ? '100%' : undefined }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  if (mode === 'html' && html) {
    return <div ref={containerRef} className="embed-html" />;
  }

  return null;
}
```

- [ ] **Step 2: Commit** together with FormRenderer in 1.4.

### Task 1.4: `FormRenderer.tsx` island

**Files:** Create `src/components/FormRenderer.tsx`.

Mirrors `NewsletterSignup.tsx` conventions: honeypot, status machine, a11y (role=status/alert, aria-live, 44px targets, focus-on-error), semantic tokens. Submit resolution order: per-form Web3Forms/Formspree key → env `PUBLIC_WEB3FORMS_KEY` → `mailto:` fallback (notifyEmail or `fallbackEmail`) so a freshly-seeded keyless form still reaches the church.

- [ ] **Step 1: Write the component** (full code):

```tsx
// Renders a configurable `form` document. Native mode builds inputs from
// form.fields and submits to the form's provider; embed mode delegates to <Embed>.
//
// Submit resolution (native): Web3Forms (form.provider.accessKey || PUBLIC_WEB3FORMS_KEY)
// -> Formspree (provider.accessKey as form id) -> mailto: fallback (provider.notifyEmail
// || fallbackEmail) so a freshly-seeded keyless form still reaches the church.
// A11y + honeypot patterns match NewsletterSignup.tsx.

import { useRef, useState, type FormEvent } from 'react';
import Embed from './Embed';

export interface FormFieldDef {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  width?: 'full' | 'half';
}

export interface FormDoc {
  _id?: string;
  title?: string;
  heading?: string;
  intro?: string;
  mode?: 'native' | 'embed';
  fields?: FormFieldDef[];
  submitLabel?: string;
  successMessage?: string;
  consentNote?: string;
  provider?: { service?: 'web3forms' | 'formspree' | 'email'; accessKey?: string; notifyEmail?: string };
  embedUrl?: string | null;
  embedHtml?: string | null;
}

interface Props {
  form: FormDoc;
  /** Site contact email, used as the final mailto fallback. */
  fallbackEmail?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ENV_WEB3FORMS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined;

const inputCls =
  'w-full px-s py-s border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]';

export default function FormRenderer({ form, fallbackEmail }: Props) {
  if (!form) return null;

  // ---- Embed mode -------------------------------------------------------
  if (form.mode === 'embed') {
    const hasEmbed = form.embedUrl || form.embedHtml;
    if (!hasEmbed) return null;
    return (
      <div>
        {form.heading && <h2 className="font-display text-h3 text-foreground">{form.heading}</h2>}
        {form.intro && <p className="mt-s text-foreground/80 leading-relaxed">{form.intro}</p>}
        <div className="mt-m">
          <Embed
            mode={form.embedUrl ? 'url' : 'html'}
            url={form.embedUrl ?? undefined}
            html={form.embedHtml ?? undefined}
            title={form.heading || form.title}
          />
        </div>
      </div>
    );
  }

  // ---- Native mode ------------------------------------------------------
  const fields = form.fields ?? [];
  const submitLabel = form.submitLabel || 'Send';
  const successMessage = form.successMessage || 'Thank you. We will be in touch soon.';
  const consentNote = form.consentNote;
  const service = form.provider?.service || 'web3forms';
  const accessKey = form.provider?.accessKey || ENV_WEB3FORMS_KEY;
  const notifyEmail = form.provider?.notifyEmail || fallbackEmail;

  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [botcheck, setBotcheck] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  function setField(name: string, value: string | boolean) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function firstMissingRequired(): FormFieldDef | null {
    for (const f of fields) {
      if (!f.required) continue;
      const v = values[f.name];
      if (f.type === 'checkbox') { if (!v) return f; continue; }
      if (!v || (typeof v === 'string' && !v.trim())) return f;
      if (f.type === 'email' && typeof v === 'string' && !/.+@.+\..+/.test(v)) return f;
    }
    return null;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    if (botcheck) { setStatus('success'); return; } // honeypot

    const missing = firstMissingRequired();
    if (missing) {
      setErrorMsg(`Please complete the "${missing.label}" field.`);
      formRef.current?.querySelector<HTMLElement>(`[name="${missing.name}"]`)?.focus();
      return;
    }

    // mailto path: service=email, or no key configured for web3forms/formspree.
    const needsKey = service === 'web3forms' || service === 'formspree';
    if (service === 'email' || (needsKey && !accessKey)) {
      const to = notifyEmail || '';
      const subject = encodeURIComponent(`${form.title || 'Website'} inquiry`);
      const body = encodeURIComponent(
        fields.map((f) => `${f.label}: ${formatVal(values[f.name])}`).join('\n'),
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      setStatus('success');
      return;
    }

    setStatus('submitting');
    try {
      let ok = false;
      if (service === 'formspree') {
        const res = await fetch(`https://formspree.io/f/${accessKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(plainValues(values)),
        });
        ok = res.ok;
      } else {
        const res = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `${form.title || 'Website'} inquiry`,
            from_name: 'Second Presbyterian website',
            ...plainValues(values),
          }),
        });
        const json = await res.json().catch(() => ({}));
        ok = res.ok && (json as Record<string, unknown>).success !== false;
      }
      if (ok) setStatus('success');
      else { setStatus('error'); setErrorMsg('Something went wrong sending your message. Please try again, or email us directly.'); }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the server. Check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className="rounded-md border border-primary bg-muted p-l">
        <p className="font-display text-h4 text-foreground">{successMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {form.heading && <h2 className="font-display text-h3 text-foreground">{form.heading}</h2>}
      {form.intro && <p className="mt-s text-foreground/80 leading-relaxed">{form.intro}</p>}

      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-m" aria-busy={status === 'submitting'}>
        {/* honeypot */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Leave blank<input type="text" name="botcheck" tabIndex={-1} autoComplete="off" value={botcheck} onChange={(e) => setBotcheck(e.target.value)} /></label>
        </div>

        {errorMsg && (
          <div role="alert" aria-live="polite" className="mb-s rounded-md border border-destructive bg-destructive/10 p-s text-sm text-foreground">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-s">
          {fields.map((f) => {
            const id = `f-${f.name}`;
            const span = f.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2';
            if (f.type === 'checkbox') {
              return (
                <div key={f.name} className={`${span} flex items-start gap-s`}>
                  <input id={id} name={f.name} type="checkbox" checked={!!values[f.name]} onChange={(e) => setField(f.name, e.target.checked)} className="mt-1 h-5 w-5" />
                  <label htmlFor={id} className="text-sm text-foreground">{f.label}{f.required && ' *'}</label>
                </div>
              );
            }
            return (
              <div key={f.name} className={span}>
                <label htmlFor={id} className="block text-sm font-semibold text-foreground mb-1">{f.label}{f.required && ' *'}</label>
                {f.type === 'textarea' ? (
                  <textarea id={id} name={f.name} rows={4} placeholder={f.placeholder} value={(values[f.name] as string) || ''} onChange={(e) => setField(f.name, e.target.value)} className={inputCls} />
                ) : f.type === 'select' ? (
                  <select id={id} name={f.name} value={(values[f.name] as string) || ''} onChange={(e) => setField(f.name, e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input id={id} name={f.name} type={f.type} placeholder={f.placeholder} value={(values[f.name] as string) || ''} onChange={(e) => setField(f.name, e.target.value)} className={inputCls} />
                )}
                {f.helpText && <p className="mt-1 text-xs text-foreground/70">{f.helpText}</p>}
              </div>
            );
          })}
        </div>

        <button type="submit" disabled={status === 'submitting'} className="press-tactile mt-m inline-flex items-center justify-center min-h-[44px] px-l py-s rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {status === 'submitting' ? 'Sending…' : submitLabel}
        </button>
      </form>

      {consentNote && (
        <p className="mt-s text-xs text-foreground/70 leading-relaxed">
          {consentNote.includes('privacy policy') ? (
            <>{consentNote.replace('privacy policy', '').trimEnd()}{' '}<a href="/privacy" className="underline underline-offset-2 hover:text-link transition-colors">privacy policy</a>.</>
          ) : consentNote}
        </p>
      )}
    </div>
  );
}

function formatVal(v: string | boolean | undefined): string {
  if (v === true) return 'Yes';
  if (v === false || v == null) return '';
  return String(v);
}
function plainValues(values: Record<string, string | boolean>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) out[k] = formatVal(v);
  return out;
}
```

- [ ] **Step 2: Commit** — `git add src/components/Embed.tsx src/components/FormRenderer.tsx && git commit -m "Add Embed + FormRenderer islands (native submit + script-safe embeds)"`

### Task 1.5: `FormBlock.astro` wrapper

**Files:** Create `src/components/FormBlock.astro`.

- [ ] **Step 1: Write it** — mounts the island when a form exists, else renders a graceful mailto fallback so the page keeps its inquiry path.

```astro
---
// Resolves a referenced `form` doc and mounts FormRenderer (client:visible).
// When no form is linked (Sanity unconfigured or editor left it blank), renders
// a fallback pill linking to a mailto, preserving the page's existing contact path.
import FormRenderer from '@/components/FormRenderer.tsx';
import type { FormDoc } from '@/components/FormRenderer.tsx';

interface Props {
  form?: FormDoc | null;
  fallbackEmail?: string;
  fallbackLabel?: string;
}
const { form = null, fallbackEmail, fallbackLabel = 'Email Us' } = Astro.props;
const pill =
  'press-tactile inline-flex items-center justify-center min-h-[44px] px-l py-s rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary-dark transition-colors';
---
{form ? (
  <FormRenderer client:visible form={form} fallbackEmail={fallbackEmail} />
) : (
  fallbackEmail && (
    <a href={`mailto:${fallbackEmail}`} class={pill}>{fallbackLabel}</a>
  )
)}
```

- [ ] **Step 2: Commit** with the query + page wiring in 1.6/1.7.

### Task 1.6: Queries — `FORM_PROJECTION` + form-aware getters

**Files:** Modify `src/lib/queries.ts`.

- [ ] **Step 1: Add `FORM_PROJECTION`** near the top projections:

```ts
const FORM_PROJECTION = `{
  _id, title, "slug": slug.current, heading, intro, mode,
  fields[]{ label, name, type, required, placeholder, helpText, options, width },
  submitLabel, successMessage, consentNote,
  provider,
  embedUrl, embedHtml
}`;
```

- [ ] **Step 2: Make `getContactPage` form-aware** (it already exists) — add `contactForm->${FORM_PROJECTION}` to its projection.

- [ ] **Step 3: Add `getWeddingsPage` + `getUseOurSpacePage`** (hero + dereferenced form):

```ts
export async function getWeddingsPage() {
  return sanityFetch(`*[_type == "weddingsPage"][0]{
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    seoTitle, seoDescription, seoImage${IMAGE_PROJECTION},
    inquiryForm->${FORM_PROJECTION}
  }`, {}, null);
}

export async function getUseOurSpacePage() {
  return sanityFetch(`*[_type == "useOurSpacePage"][0]{
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    seoTitle, seoDescription, seoImage${IMAGE_PROJECTION},
    inquiryForm->${FORM_PROJECTION}
  }`, {}, null);
}
```

- [ ] **Step 4: Add a standalone `getForm(slug)`** (used by Phase 4 formRef + handy for testing):

```ts
export async function getForm(slug: string) {
  return sanityFetch(`*[_type == "form" && slug.current == $slug][0]${FORM_PROJECTION}`, { slug }, null);
}
```

### Task 1.7: Render forms on the three pages

**Files:** Modify `src/pages/contact.astro`, `src/pages/weddings.astro`, `src/pages/use-our-space.astro`.

- [ ] **Step 1: contact.astro** — switch to `getContactPage`, import `FormBlock`, add a form section between the details/map section and `FinalCta`. Intro from `page.formIntroNote`. Render `<FormBlock form={page?.contactForm} fallbackEmail={site.contact.email} fallbackLabel="Email the Office" />`. Keep the "what to expect" copy if present.

- [ ] **Step 2: weddings.astro** — switch hero source to `getWeddingsPage`; replace the pricing-section mailto pill with a form section below pricing: `<FormBlock form={page?.inquiryForm} fallbackEmail={site.contact.email} fallbackLabel="Inquire About Your Date" />`.

- [ ] **Step 3: use-our-space.astro** — switch hero source to `getUseOurSpacePage`; in the inquiry section render `<FormBlock form={page?.inquiryForm} fallbackEmail={site.contact.email} fallbackLabel="Inquire About the Space" />` while keeping the "email the Pastor directly" secondary link.

- [ ] **Step 4: Build** — Run: `npm run build` — Expected: green.

- [ ] **Step 5: Commit** — `git add src/lib/queries.ts src/components/FormBlock.astro src/pages/contact.astro src/pages/weddings.astro src/pages/use-our-space.astro && git commit -m "Render configurable forms on contact, weddings, use-our-space (mailto fallback preserved)"`

### Task 1.8: Seed three forms + wire references

**Files:** Create `scripts/seed-forms.mjs`.

- [ ] **Step 1: Write the seed script** — `loadEnv` pattern from `scripts/cleanup-orphaned-fields.mjs`; `createOrReplace` for 3 forms with fixed IDs; `setIfMissing` the references on the three singletons so editor choices are never clobbered. Forms: **General Contact** (name, email, phone[half], message[textarea]); **Wedding Inquiry** (partner1Name, partner2Name, email, phone, eventDate[date], guestCount, ceremonyType[select], hearAboutUs, message) mirroring the Squarespace flow; **Space Use Inquiry** (name, organization, email, phone, eventType, eventDate[date], attendance, message). All `provider.service = 'web3forms'`, `accessKey` blank, `notifyEmail` = office email; success/consent copy set.

- [ ] **Step 2: Run** — Run: `node scripts/seed-forms.mjs` — Expected: logs created form IDs + reference patches. If the write token is absent it logs and exits 1 (manual follow-up; schema + UI still ship and forms can be created in-Studio).

- [ ] **Step 3: Studio deploy** — Run: `npm run studio:deploy` — Expected: deployed.

- [ ] **Step 4: Commit** — `git add scripts/seed-forms.mjs && git commit -m "Seed General Contact, Wedding Inquiry, Space Use Inquiry forms"`

### Task 1.9: Phase 1 verification

- [ ] Build green (`npm run build`), Studio build green (`npm run build`).
- [ ] `npm run dev`; Playwright screenshot `/contact`, `/weddings`, `/use-our-space` in light + dark, mobile + desktop; confirm the form renders, validates, and the mailto fallback works with no key.
- [ ] Confirm the three forms appear under Content → Forms in the Studio and the page singletons show the reference field.

---

## PHASE 2 — Operational content + integrations

### Task 2.1: `announcement` collection (replaces `siteSettings.announcement` object)
- New `src/sanity/schemaTypes/announcement.ts`: `title`, `message` (string), `link` ({label,url}), `style` (info|special|urgent), `startDate`/`endDate` (datetime), `enabled` (boolean). Preview shows message + window.
- `getActiveAnnouncement()` in queries: `*[_type=="announcement" && enabled && (!defined(startDate)||startDate<=$now) && (!defined(endDate)||endDate>=$now)] | order(select(style=="urgent"=>0,style=="special"=>1,2) asc, endDate asc)[0]`.
- BaseLayout: replace `siteSettings.announcement` read with `getActiveAnnouncement`; map `style` → existing banner colors (info=primary, special=chapel, urgent=destructive). Keep markup.
- Migration: re-create existing announcement data as a doc, then extend `scripts/cleanup-orphaned-fields.mjs` to unset `siteSettings.announcement`; remove the object field from `siteSettings.ts`. Seed one disabled sample announcement.
- Studio: register; add Announcements to Content list; `urlForDoc` → null.
- typegen → build → studio deploy → commit.

### Task 2.2: `worshipResource` collection
- `title`, `date` (date), `type` (Bulletin|Order of Worship|Liturgy|Hymn list|Newsletter (The Record)|Annual report|Other), `file` (file) OR `externalUrl` (url), `description` (text). Order by date desc.
- `getWorshipResources(limit)` query + fallback `[]`.
- Surface a "Latest bulletins / worship resources" section on `/worship` (recent 6) — file download link or external link, grouped/labelled by type.
- Register + Content list + `urlForDoc` null. typegen → build → deploy → commit.

### Task 2.3: `sermonSeries` + `sermon.series` → reference (DESTRUCTIVE — back up first)
- Back up dataset: `npx sanity dataset export production backups/pre-sermonseries-<date>.tar.gz` (run if creds allow; else STOP + note as manual follow-up rather than risk data).
- New `sermonSeries.ts`: `title`, `slug`, `description`, `image`, `startDate`, `endDate`.
- `scripts/migrate-sermon-series.mjs`: read distinct `sermon.series` strings, `createOrReplace` a series doc each (id from slugified string), patch each sermon's `series` to a reference. Idempotent.
- Change `sermon.series` to `reference(sermonSeries)`. Update SERMON_CARD + sermon getters to deref `series->{title,"slug":slug.current}`. Update `/sermons` grouping + detail.
- Optional `/sermons/series/[slug].astro` (defer if time-boxed; note it).
- typegen → build → deploy → commit.

### Task 2.4: Enrich `event`
- Add `audience`, `specialService` (bool), `liturgicalSeason`, `cost`, `registrationLabel`, `contactName`, `contactEmail`, `allDay` (bool), `featuredOnHome` (bool). Expand category list for church use.
- EVENT_CARD + getters: add fields; add `getSpecialServices()` (upcoming where specialService==true) and `getHomeFeaturedEvents()` (featuredOnHome==true upcoming).
- Surfaces: Special Services band on `/events` (and home in Phase 3); show cost/registrationLabel/contact on event detail.
- typegen → build → deploy → commit.

### Task 2.5: Enrich `ministry` + `/ministries` index
- Add `ageRange`, `schedule`, `season`, `contactName`, `contactEmail`, `registrationUrl`, `parentMinistry` (reference to ministry).
- MINISTRY_CARD + getters: include new fields; `getMinistriesGrouped()` by audience; sub-programs via parentMinistry.
- New `/ministries` index page grouped by audience; parent ministry detail lists sub-programs.
- typegen → build → deploy → commit.

### Task 2.6: `siteSettings` "Connect & integrations" group + `embed` object + EmbedBlock
- siteSettings: new group "Connect & integrations"; KEEP `watchUrl`+`giveUrl` (move into group, no rename); ADD `appUrl`, `directoryUrl`, `registrationBaseUrl`, `prayerUrl` (all optional). Update getSiteSettings projection + surface where set.
- New `embed.ts` object: `{ title?, mode (url|html), url?, html?, aspect? }`. New `src/components/EmbedBlock.astro` mounting the existing `Embed.tsx` (client:visible). Available in Portable Text + as Phase 4 block.
- typegen → build → deploy → commit.

---

## PHASE 3 — Home editability + seasonal hero + "This Sunday"

### Task 3.1: Fully editable home hero
- `homePage`: add `heroKeyword` (string; the chapel-green word). Wire `index.astro` split hero to render `heroEyebrow/heroHeadline/heroKeyword/heroSubhead/heroPrimaryCta/heroSecondaryCta/heroImage` from Sanity with current inline copy as fallback. getHomePage already returns most; add heroKeyword.

### Task 3.2: Seasonal hero override (dated)
- `homePage.seasonalHero` object: `enabled`, `startDate`, `endDate`, `eyebrow`, `headline`, `keyword`, `subhead`, `image`, `primaryCta`, `secondaryCta`. Build-time now-in-window check selects seasonal vs default. getHomePage projection + index.astro logic.

### Task 3.3: "This Sunday" block
- `homePage.thisSunday` object: `enabled`, `dateLabel`, `sermonTitle`, `scripture`, `preacher`, `note`, Watch CTA from `siteSettings.watchUrl`. Render on home + `/worship`.

### Task 3.4: Home section copy → fields
- Convert welcome, inclusive-welcome, service-band, The Record copy to homePage fields, seeded with current values; index.astro renders from Sanity with inline fallback.
- typegen → build → deploy → seed → commit.

---

## PHASE 4 — Full page editability (block library + structured fields)

### Task 4.1: Block object types + `Sections.astro`
- `src/sanity/schemaTypes/blocks/`: `richText`, `imageText`, `cardGrid`, `quote`, `ctaBand`, `accordion` (reuse `ui/accordion` via FaqAccordion pattern), `embed` (Phase 2), `formRef` (reference form), `gallery`, `dynamicList` (latestSermons|upcomingEvents|ministries|staff|worshipResources + count).
- `src/components/Sections.astro` maps `block._type` → component; one component per block under `src/components/blocks/`. Each renders on-brand (tokens + arch motif + chapel bands).

### Task 4.2: Per-page structured fields + `flexibleSections[]`
- For each page singleton add structured fields mirroring its current designed sections (all text + images editable, design preserved) + optional `flexibleSections[]`. Pages: worship, about, what-we-believe (seed verbatim), music, grow, serve, kids, food, give, use-our-space, faq, contact, privacy, events/sermons index intros.
- Convert each `.astro` to render from Sanity with current inline content kept as `sanityFetch` fallback. Seed every field from current copy/images.

### Task 4.3: Optional generic `page` type + `/[slug]`
- `page` type (title, slug, hero, `flexibleSections[]`, SEO) routed at `/[slug].astro` for one-off pages. getPageBySlug + getAllPageSlugs.

### Task 4.4: Final verification
- Build + studio build green; screenshots of every converted page light/dark, mobile/desktop; Lighthouse on a representative page; create one sample doc per new block type; confirm Studio + render.

---

## Cross-cutting checklist (every phase)
- [ ] Register new types in `schemaTypes/index.ts`; place in `structure.ts`; extend `sanity.config.ts` `urlForDoc`/`SINGLETON_TYPES` as needed.
- [ ] `npm run typegen` after each schema change; commit `src/lib/sanity.types.ts`.
- [ ] Extend `src/lib/queries.ts` with projection + fallback per type.
- [ ] Migrations backed up first; cleanup script for orphaned fields (never "Remove field").
- [ ] Build green; `npm run build` green; screenshots; one sample doc per new type.
- [ ] `npm run studio:deploy`; commit per phase. Site stays green + shippable after every phase.

## Self-review notes (against the spec)
- Forms: native + embed (Subsplash script re-creation via DOMParser) ✓; per-form provider + key ✓; mailto fallback added for keyless resilience (decision, beyond spec, preserves inline-fallback principle).
- Announcements collection replaces the object ✓; worshipResource ✓; sermonSeries reference + migration ✓; event/ministry enrichment ✓; integrations group keeps watch/give names ✓; shared Embed renderer built once (Phase 1) reused (Phase 2) ✓.
- Home hero + seasonal + This Sunday + section copy ✓. Block library + per-page structured fields + generic page ✓.
- Out of scope respected (no giving checkout, RSVP backend, directory, prayer DB, ticketing, media hosting).
