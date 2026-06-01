# Church CMS Build — Summary & Decisions

Date: 2026-06-01. Branch: `feature/church-cms`. Spec: `docs/superpowers/specs/2026-06-01-church-cms-editability-design.md`. Plan: `docs/superpowers/plans/2026-06-01-church-cms.md`.

Goal: let a non-technical pastor + secretary run the site from Sanity for a year, and keep it a reusable church template. Built autonomously, phase by phase; site stayed green and shippable after each phase. Studio deployed after each phase.

## What shipped

### Phase 1 — Configurable forms (complete)
- New `form` collection: native field builder (text/email/tel/textarea/select/checkbox/date, required, half/full width, help text) OR external embed.
- `FormRenderer.tsx` island: honeypot, a11y (role/aria-live, 44px, focus-on-error), submit resolution **per-form Web3Forms key → `PUBLIC_WEB3FORMS_KEY` → `mailto:` fallback** so a keyless seeded form still reaches the office. Formspree + "open email app" providers supported.
- `Embed.tsx` shared island: iframe URLs + pasted snippets whose `<script>` tags are re-created (via DOMParser, no innerHTML) so Subsplash/Planning Center embeds run.
- `FormBlock.astro` mounts the island, or a mailto pill when no form is linked.
- Wired to contact / weddings / use-our-space; seeded 3 forms (General Contact, Wedding Inquiry modeled on the Squarespace flow, Space Use Inquiry).

### Phase 2 — Operational content + integrations (complete, 2 items deferred)
- `announcement` collection (scheduled by date, styled info/special/urgent) replaces the old `siteSettings.announcement` object; BaseLayout renders the active one. Old field cleared via `scripts/cleanup-orphaned-fields.mjs`. Sample (disabled) announcement seeded.
- `worshipResource` collection (bulletins, orders of worship, The Record, annual reports; PDF upload or external link) + "Worship resources" section on `/worship`.
- `event` enriched: audience, specialService, liturgicalSeason, cost, registrationLabel, contactName/Email, allDay, featuredOnHome + expanded categories. New "Special services" band on `/events` (Christmas Eve, Holy Week, Easter).
- `ministry` enriched: ageRange, schedule, season, contactName/Email, registrationUrl, parentMinistry (nest sub-programs, e.g. Youth → Confirmation/VBS).
- `siteSettings` "Connect & integrations" group: kept `watchUrl`/`giveUrl` (no rename); added `appUrl`, `directoryUrl`, `registrationBaseUrl`, `prayerUrl`. Footer surfaces app/directory/prayer when set (Subsplash/PCO-ready).
- Shared `embed` object + `EmbedBlock.astro` reuse the Phase 1 Embed island.

### Phase 3 — Home hero + seasonal hero + This Sunday (complete)
- `homePage.heroKeyword` (green-highlight word), `seasonalHero` (dated override for Holy Week/Christmas/Easter — eyebrow/headline/keyword/subhead/image + optional CTA), `thisSunday` block.
- `index.astro` renders the hero from Sanity with current copy as fallback; the seasonal hero takes over within its date window; This Sunday replaces the static line when enabled. Watch pill prefers `siteSettings.watchUrl`.

### Phase 4 — Page builder (capability complete; full per-page conversion deferred)
- Block library: `sectionRichText`, `sectionImageText`, `sectionCardGrid`, `sectionQuote`, `sectionCtaBand`, `sectionForm` + shared `embed`. Each renders on-brand (tokens, arch motif, chapel bands) via `src/components/blocks/*` + `Sections.astro`.
- Generic `page` type at `/[slug]` (reserved-slug guard; 0 pages → no routes). Secretary builds unlimited new pages (campaigns, new ministries) with no developer. Verified end-to-end with a temporary sample page, then removed.

### Phase 4b — Existing pages extensible (complete for the 11 church singletons)
- `definePageSingleton` factory gained a `flexibleSections[]` field, so **all 11 per-page church singletons** (worship, what-we-believe, music, pastors & staff, grow, serve, kids, food, give, weddings, use-our-space) can now have on-brand blocks added below their built-in content — no developer. Each template renders `<Sections>`; empty by default so pages are visually unchanged until used.

## Key decisions (autonomous)
1. **Keyless-form resilience:** added a `mailto:` fallback beyond the spec, so seeded forms work before a Web3Forms key is pasted (preserves the inline-fallback principle).
2. **Embed without innerHTML:** used DOMParser + node import + script re-creation (cleaner, satisfies the security hook, still runs Subsplash scripts).
3. **Deferred the sermon-series string→reference migration (spec 2.3):** the church publishes sermons as weekly YouTube livestreams, not a structured archive — high-risk destructive migration for low current value. `sermon.series` stays a string.
4. **Deferred a standalone `/ministries` index:** the audience pages (/grow, /serve, /kids, /food) already cover ministries; `parentMinistry` enables nesting when needed.
5. **Page builder over a 13-page rewrite:** delivered the generic `page` type + block library (new pages fully editable) rather than rushing the conversion of every existing page's bespoke copy. New-content editability is complete; converting existing page bodies is the documented next step.

### Phase 4b (cont.) — Page builder on every content page (complete)
- `flexibleSections[]` + `<Sections>` are now wired on **all 18 page singletons**: the 11 church pages plus home, about, faq, contact, events index, sermons index, and privacy. Every content page can take on-brand blocks below its built-in content, no developer. Empty by default, so nothing changes visually until used. The generic `page` type covers brand-new pages at `/[slug]`.

### Phase 4c — Body-copy conversion (main body of every content page: complete)
- Every content page's built-in body copy is now editable Sanity fields using the
  fallback pattern `page?.field ?? "<verbatim>"`, so the design is byte-identical until
  an editor overrides it, and fresh clones still render. Converted: **home** (welcome,
  inclusive welcome, get involved, The Record), **about** (mural caption, the building,
  who we are), **worship**, **what-we-believe** (verbatim, leadership's statement of
  faith preserved exactly), **music**, **grow**, **serve**, **kids**, **food**, **give**,
  **weddings**, **use-our-space**, **events index**, **sermons index**, **contact**.
  Privacy already had an editable Portable Text body.
- Mechanism: per-page "Page copy" field group (factory `extra` fields for the church
  singletons; standalone fields for events/sermons/contact). The page getters spread
  (`...`) so new body fields flow through without per-field getter edits.

### Phase 5 — Page-builder expansion + background system (complete, visually verified)
- **Background / media system** (`SectionShell.astro` + a shared `background` control on every block): token color tone (default / warm / chapel / chapel deep, text auto-adapts), OR a background image/video with an adjustable darkening overlay so text stays readable. Vertical spacing control.
- **13 page-builder blocks**, all add/remove/reorder in Sanity, all tone-adaptive:
  richText, imageText, cardGrid, quote, ctaBand, formRef, embed (original; now background-capable),
  plus **featureCards, stats, FAQ accordion, photo gallery, steps, logos, media feature (video/image), dynamic list** (latest sermons/events/ministries/staff/worship resources).
- Portable Text bodies made tone-adaptive on dark backgrounds via descendant overrides (no change to the shared renderer).
- Verified live with a sample page: every section tone resolved correctly, chapel-green Portable Text rendered cream, dynamic list pulled live events. Spec: `docs/superpowers/specs/2026-06-01-page-builder-expansion-design.md`.

### Phase 6 — Closing CTA copy + FAQ collection (complete)
- **Closing CTA (`<FinalCta>`) is now editable on every page.** Added
  `finalCtaEyebrow`/`finalCtaHeadline`/`finalCtaSubhead` to the remaining singletons
  (worship, music, kids, food, give, weddings, use-our-space, pastor-staff via the factory;
  events, sermons, contact standalone; home via its getter projection) and wired each
  template's `<FinalCta>` to `page?.finalCta* ?? "<verbatim>"`. grow/serve/what-we-believe
  already had theirs. Byte-identical until an editor overrides it.
- **FAQ page is now collection-driven.** `faq.astro` reads the `faqItem` collection via
  `getFaqPage()`, grouped by the FAQ Page singleton's `categoryOrder`, so editors add, edit,
  and reorder questions in Sanity with no developer. Answers render as Portable Text (or a
  plain string from the built-in fallback), and either form is flattened to plain text for
  the FAQPage JSON-LD. Added a **Food Ministry** category; seeded the 10 starter questions
  via `scripts/seed-faq-items.mjs`. The built-in starter set stays as an inline fallback, so
  the page is never empty. **pastor-staff** body was already content-driven (the
  `staffMember` collection); only its closing CTA was inline, now covered above.

### Phase 7 — Studio experience + branding (complete)
- **In-Studio "How This Works" help center.** A pinned "How This Works" section at the top of
  the desk with 12 plain-English guides for non-technical staff (events, special/seasonal
  service times, announcements, FAQs, sermons, editing a page, building a page, sections +
  backgrounds, photos, the brand system, editing the top menu & footer, and a do-it-yourself
  vs. call-Nathan boundary). Repo-based and locked (staff cannot edit or delete it; it travels
  with the template): `studio/guides/content.tsx` (copy as plain data) + `studio/components/GuideView.tsx`
  (renderer) + desk wiring in `studio/structure.ts`. No schema change. Spec:
  `docs/superpowers/specs/2026-06-01-studio-how-this-works-design.md`.
- **Studio themed to the brand.** `sanity.config.ts` re-pointed from the starter Slate theme to
  the site's own tokens (Bronze accent + focus, warm Paper surfaces, Espresso Ink text, warm
  neutrals) and the brand serif fonts (Instrument Serif display, Newsreader body), loaded via a
  new `StudioLayout` component that injects the web fonts. Wordmark set to "Second Presbyterian."
- **Header + footer navigation editable.** `siteSettings.navItems` (a Link or a Dropdown menu)
  drives the header; `siteSettings.footerColumns` (titled columns) drives the footer link columns.
  `Header.astro` / `Footer.astro` map them to the existing render shape and fall back to the
  built-in menus when empty, so the live site is unchanged until edited. The mobile menu inherits
  the header automatically. The footer "Get in touch" column stays derived from contact fields.
- **Every document opens on "All fields."** Removed `default: true` from the church-page factory,
  the generic `page`, and `form` group definitions, so Sanity selects the implicit "All fields"
  tab and editors see the whole form instead of a single group.
- **Favicon.** Pulled the church's brand mark off the live site to `public/favicon.png` +
  `public/apple-touch-icon.png` (fixing a `/favicon.svg` 404), and added a `siteSettings.favicon`
  image field. `BaseLayout` prefers the uploaded favicon (via the Sanity image pipeline) and
  falls back to the bundled mark.

### Phase 8 — Content audit + remediation (complete)
Audited what the live site actually pulls from Sanity vs. hardcoded, and what the dataset
had loaded. Confirmed the site + Studio share one project (`kz01wb83`). Findings + fixes:
- **Empty collections loaded.** `staffMember` (4 pastors/staff with bios + favorites; the
  4 headshots uploaded as Sanity assets) and `ministry` (the 4 pillars, featured for the
  home Get-Involved row) were both empty — the pages had been rendering hardcoded fallbacks.
  Seeded via `scripts/seed-staff.mjs` + `scripts/seed-ministries.mjs`.
- **siteSettings gaps filled** (service time, mission, give/watch/YouTube URLs, and the
  street address) via `scripts/seed-settings.mjs` (`setIfMissing`).
- **Hardcoded page lists made editable** (inline-fallback pattern): wedding FAQs + pricing,
  grow groups, serve ways, use-our-space uses, contact "who to reach" rows, what-we-believe
  resources, and the home service band + weekly rhythms. New schema fields + dedicated
  getters; pre-filled in Sanity via `scripts/seed-page-lists.mjs`.
- **Address editable.** `siteSettings.addressLine` + `cityStateZip` now drive the header
  bar, footer (display + directions link), home service band, worship, contact (display +
  embedded map), give, and the LocalBusiness JSON-LD — each with a `site.ts` fallback.
- **`give.astro`** now reads `siteSettings.giveUrl` (it was ignoring it).
- Added a re-runnable **`scripts/audit-content.mjs`** (published-vs-draft counts per type).

### Phase 9 — Removed the misleading Studio "Preview" (complete)
The site is `output: 'static'` with no draft-preview environment, so the iframe "Preview"
tab showed the last PUBLISHED build (not the editor's draft) and only changed after a
rebuild. Removed it (documents show the form only) and corrected the "How This Works" guide
to teach the real model: edit → Publish → the site rebuilds in a few minutes → the change
appears. `urlForDoc` / `SITE_URL_FOR_PREVIEW` kept in `sanity.config.ts` as hooks if a real
preview environment is ever added (see Remaining work).

### Phase 10 — Security headers (complete)
Expanded `public/_headers` (it had only `frame-ancestors` + HSTS without preload) into a
full policy: a **Content-Security-Policy** (`object-src 'none'`, `base-uri 'self'`, a tight
`script-src` of `'self' 'unsafe-inline'` + Cloudflare analytics, and the site's real
`img`/`media`/`frame`/`connect` sources for Sanity, YouTube, Vimeo, Google Maps, and
Web3Forms), **HSTS** with `preload` (max-age 2y + includeSubDomains), and `frame-ancestors
'self'` (the Studio preview was removed). **Trusted Types intentionally skipped** (would break
the embeds). These are the unscored Lighthouse security recommendations (Best Practices was
already 100) — defense-in-depth. Verified locally via `wrangler dev`: headers emit and the
home + contact (cross-origin map + form) pages load with no CSP errors. Note: HSTS `preload`
is advertised in the header, but actual preload-list inclusion needs a one-time submission at
hstspreload.org.

## Remaining work (all optional)
1. `sermonSeries` collection + reference migration (only if the church starts a structured
   sermon archive); `/sermons/series/[slug]` landing.
2. **A real draft-preview environment** (true "see it before you publish"). Needs an
   SSR/hybrid preview deployment + a draft-mode `sanityFetch` path + Sanity's
   `presentationTool` (+ optional stega click-to-edit). Roughly 1-2 days plus a second
   environment to maintain; not worth it for occasional editing. Revisit if editing gets
   frequent.
3. `worshipResource` is empty (bulletins / The Record / annual reports) — load PDFs when
   available; the `/worship` resources section stays hidden until then.

## Operational notes
- After ANY schema change the loop was: `npm run typegen` → wire/seed → `npm run build` → `npm run studio:deploy` → commit. Never used the Studio "Remove field" button (used the cleanup script).
- Seed scripts: `seed-forms.mjs`, `seed-operational.mjs` (sample announcement), `seed-faq-items.mjs`, `seed-staff.mjs` (uploads headshots), `seed-ministries.mjs`, `seed-settings.mjs` (siteSettings via setIfMissing), `seed-page-lists.mjs` (the editable page lists), `seed-sample-page.mjs` (page-builder QA; `--delete`). Audit: `audit-content.mjs`.
- The Studio is deployed (schema shipped per phase). The **site** deploys to Cloudflare on merge to `master`.
- The core CMS build shipped via **PR #2** (merged to `master`); the content audit remediation, the preview removal, and the editable address then landed directly on `master`.
