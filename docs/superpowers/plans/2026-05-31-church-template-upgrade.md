# Church Template Upgrade — Implementation Plan

> Execute task-by-task; commit each phase to `master`. Rationale + evidence live in `docs/research/church-website-audit.md`. Verbatim church content is in `docs/migration/content-inventory.md`.

**Goal:** Close the content/experience gaps found in the audit so Second Pres matches best-in-class Presbyterian sites, and build every addition as configurable/content-driven so the result is a reusable general church template.

**Architecture:** Keep the established pattern (Sanity-backed singletons/collections + inline fallbacks; design-seam tokens; modules under `modules/`). New media features follow the events-module recipe. Nothing hard-codes church-specific values where a future church would differ — those route through `site.ts`, page fallbacks, or Sanity.

**Design verdict from the audit:** our type/color/motion already beat the peer set. Do **not** restyle the design system. Spend effort on photography, sermons/media, a real "Plan a Visit" experience, a "this Sunday" moment, inclusivity, and newsletter.

---

## Phase A — Photography (the #1 gap)

The church owns professional photography (Eric Allix Rogers) on its Squarespace CDN. Lead with people + show the landmark interior (Tiffany windows, sanctuary).

- [ ] Pull a curated set off the live site (navigate the live pages with the browser, collect `<img>` srcs, download the best 4-6: exterior, sanctuary interior, Tiffany windows, congregation/people, music/organ). Save to `src/assets/` as optimized webp.
- [ ] Add a reusable `PhotoStrip`/`ImageFeature` treatment (Astro component) so pages can drop in a bundled-or-Sanity image with a caption + credit, with graceful absence.
- [ ] Weave imagery into Home (welcome + worship sections), About (the building), Music (organ/choir), and the new Visit page.
- [ ] Add a photo credit line (Eric Allix Rogers) in the footer or an image-credits note (rights/attribution hygiene).

## Phase B — Sermons / Media module (template-grade)

Model on `modules/events`. A reusable `sermons` module.

- [ ] `modules/sermons/studio/sermon.ts` (title, slug, date, speaker, series, scripture, videoUrl/audioUrl, description PortableText, image) + `sermonsPage.ts` singleton.
- [ ] `/sermons` index (latest + searchable-by-series/speaker grid, livestream link, empty/fallback state) and `/sermons/[slug]` detail (embedded video, scripture, notes). Mirror events pages.
- [ ] Queries: `getSermonsPage`, `getRecentSermons`, `getSermonBySlug`, `getAllSermonSlugs`, plus series/speaker helpers.
- [ ] Register schemas (index.ts + structure.ts), copy pages to `src/pages/sermons/`, add nav "Watch" (or "Sermons"), enable doc + seed, stage under `modules/sermons/`.
- [ ] Livestream CTA points to the church YouTube (`site.social.youtube`).
- [ ] typegen + build green.

## Phase C — "Plan a Visit" / I'm New page

- [ ] New `src/pages/visit.astro`: concrete first-visit content — service time, address + map, parking, "come as you are," childcare/kids, accessibility, what to expect step-by-step, and a warm welcome. People-forward hero image.
- [ ] Repoint the header + hero "Plan a Visit" CTAs from `/worship` to `/visit` (worship stays as the deeper worship-detail page). Add "I'm New" to nav.

## Phase D — "This Sunday" moment

- [ ] A `thisSunday` content block (Sanity singleton or `homePage`/`siteSettings` fields) with inline fallback: upcoming date, sermon/series title, preacher, online link. Render on Home (near the top) and the Visit/Worship pages.
- [ ] Keep it editable so the church updates one place weekly; fall back to evergreen "Join us Sundays at 11am" when unset.

## Phase E — Inclusivity, foregrounded

- [ ] A reusable affirming-statement section (short, dignified, not slogan-y) on Home + About, e.g. a centered statement block. Make it config/toggle-driven so a non-affirming church can omit it (template reuse).

## Phase F — Newsletter / The Record

- [ ] A provider-ready newsletter signup block (reuse `NewsletterSignup` island) on Home + footer; wire copy ("Subscribe to The Record"). Works with a Sanity-configured provider; degrades to an email CTA when no provider is set.

## Phase G — Accessibility + IA polish

- [ ] Accessibility/nursery/parking note on the Visit + Worship pages (mirrors National Pres / Memphis).
- [ ] Nav: surface "I'm New" (`/visit`) and "Watch" (`/sermons`) prominently; keep About Us / Get Involved / Events / Food / Space / Give but ensure Visit + Watch + Give read first. Update Footer columns to match.

## Phase H — Template hygiene + docs

- [ ] Confirm every new piece is content/config-driven with fallbacks (no hard-coded church specifics where a future church differs).
- [ ] Update README / CLAUDE.md routes + modules (add sermons, /visit), `docs/modules/README.md`, and a short "general church template" note.

## Phase I — Verify

- [ ] `npm run build:full` clean; Playwright screenshots of new/changed pages light+dark at mobile + desktop; fix regressions; no em-dashes; commit per phase.

---

## Self-review
- Every audit gap maps to a phase (photography A, sermons B, visit C, this-Sunday D, inclusivity E, newsletter F, accessibility/IA G). ✓
- Template reuse is a first-class constraint in A-H (modules, fallbacks, toggles, tokens). ✓
- No design-system restyle (audit says we're ahead). ✓
- Risk: photography sourcing depends on what's on the live CDN; if a category is missing, ship with the building photo + flag for client-provided photos.
