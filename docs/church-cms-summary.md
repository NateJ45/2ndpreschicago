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

## Remaining work (next increment toward "nothing hardcoded")
1. **Extend `flexibleSections[]` to the standalone singletons** (home, about, faq, contact, events index, sermons index, privacy) and render `<Sections>` there. The 11 church singletons are already done (Phase 4b); these 7 follow the same pattern (schema field + getter projection with `SECTION_MEMBERS` + `<Sections>` in the template).
2. **Convert each existing page's bespoke body copy to fields**, seeded verbatim so the design is unchanged but every string/image is editable. Pages: worship, about, what-we-believe (seed **verbatim** — leadership's text, do not reword), music, grow, serve, kids, food, give, weddings, use-our-space, faq, privacy, plus events/sermons index intros and the remaining home sections (welcome, inclusive-welcome, service band, The Record). This is the larger, per-page effort and is best done with care page by page.
3. Optional: `sermonSeries` collection + reference migration (only if the church starts using a structured sermon archive); `gallery` + `dynamicList` + `accordion` blocks; `/sermons/series/[slug]` landing.

## Operational notes
- After ANY schema change the loop was: `npm run typegen` → wire/seed → `npm run build` → `npm run studio:deploy` → commit. Never used the Studio "Remove field" button (used the cleanup script).
- Seed scripts: `scripts/seed-forms.mjs`, `scripts/seed-operational.mjs` (sample announcement), `scripts/seed-sample-page.mjs` (QA helper for the page builder; `--delete` to remove).
- Branch `feature/church-cms` is green and ready to review/merge. Site deploy happens on merge to master (Cloudflare); the Studio is already deployed.
