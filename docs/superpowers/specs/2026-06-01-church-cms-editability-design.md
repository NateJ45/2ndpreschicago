# Church CMS: Configurable Forms + Full Editability — Design Spec

Date: 2026-06-01. Builds on the church remodel (`docs/remodel/`).

> **Status (resumption note):** Spec APPROVED by the user on 2026-06-01. Build on a feature branch
> `feature/church-cms`, shipping phase by phase (Phase 1 forms first). Next step is the
> writing-plans skill to produce the implementation plan, then build. master is at the merged
> remodel; this spec + the cleanup script are already on master. Goal: let a non-technical
pastor and church secretary run the entire site from Sanity for a year, and keep the project a
reusable church template. Source of needs: pastor/secretary role analysis (annual rhythms +
weekly operations) plus the live Squarespace site (e.g. the wedding inquiry form).

## Principles
1. **Nothing hardcoded.** Every visible string and image is a Sanity field. Current copy is seeded
   so the site looks identical but becomes editable.
2. **Configurable, not vendor-locked.** External services (giving, livestream, registrations,
   directory, church app, email) are reached through generic "URL or embed + toggle" fields, so any
   church points them at Vanco / Subsplash / Planning Center / Mailchimp without code.
3. **Inline-fallback preserved.** `sanityFetch(query, params, fallback)` keeps returning bundled
   fallbacks, so a fresh clone (or empty dataset) still builds and renders.
4. **Editor self-service.** Forms, announcements, sections, events, ministries, sermons, worship
   docs are all add/edit/reorder in the Studio, no developer.
5. **Don't reimplement external tools.** Giving checkout, registration/RSVP backends, member
   directories, and a prayer-request database stay external (link or embed). We model church
   *content*, not church *operations software*.

## Constraints (carried from CLAUDE.md + client)
- After ANY schema change: `npm run typegen` -> `npm run studio:deploy` -> commit. Never click
  "Remove field" (use the orphaned-field cleanup script `scripts/cleanup-orphaned-fields.mjs`).
- No em-dashes in public-facing copy. Build in light AND dark, mobile + desktop. Desktop nav stays
  server-rendered. `/what-we-believe` text is leadership's, seed verbatim, do not reword.
- `src/components/ui/accordion.tsx` is customized; reuse it for FAQ/accordion blocks.
- Backup the dataset before destructive migrations (the `sermon.series` string->reference change).

---

## Phase 1 — Configurable contact forms

### Schema: `form` (new collection)
- `title` (string, internal name, e.g. "Wedding Inquiry")
- `slug` (slug)
- `heading` (string, optional, shown above the form)
- `intro` (text, optional)
- `mode` (string list: `native` | `embed`; default `native`)
- Native mode:
  - `fields[]` (array of `formField` objects):
    - `label` (string, required)
    - `name` (string, required; the field key sent on submit)
    - `type` (list: text | email | tel | textarea | select | checkbox | date)
    - `required` (boolean)
    - `placeholder` (string, optional)
    - `helpText` (string, optional)
    - `options[]` (string array; only for `select`)
    - `width` (list: full | half; for two-column layout)
  - `submitLabel` (string, default "Send")
  - `successMessage` (text, default "Thank you. We will be in touch soon.")
  - `consentNote` (text, optional; small print, /privacy link appended)
  - `provider` (object): `service` (list: web3forms | formspree | email), `accessKey` (string;
    Web3Forms access key OR Formspree form id), `notifyEmail` (string, informational/label)
- Embed mode (covers Subsplash forms/sign-ups, Google Forms, Planning Center, Jotform):
  - `embedHtml` (text; pasted embed snippet/iframe) or `embedUrl` (url for a plain iframe)
  - The renderer must support BOTH iframe embeds AND script-based embeds (Subsplash "Smart
    Embeds", Planning Center sign-ups). A `<script>` injected via innerHTML does NOT execute, so
    the embed component parses the pasted markup and re-creates each `<script>` element (copying
    src + attributes + inline content) so it actually loads. iframes pass through unchanged.
- `preview`: title + mode.

### Component: `FormRenderer.tsx` (new React island)
- Props: the resolved `form` document.
- Native: renders fields (label, control by type, required, two-col via `width`), a hidden honeypot
  (`botcheck`), client-side required validation, submit -> POST to provider endpoint
  (Web3Forms `https://api.web3forms.com/submit` with `access_key`), shows `successMessage` on success
  and an inline error on failure. Uses shadcn `input`/`textarea`/`label`/`select`-equivalent + brand
  styling (pill submit button, chapel/cream aware).
- Embed: renders `embedHtml` via a sanitized container, or an `<iframe>` for `embedUrl`.
- Astro wrapper `FormBlock.astro` resolves a form reference and mounts `FormRenderer` with
  `client:visible`.

### Wiring + seed
- `contactPage`: add `contactForm` (reference to `form`). Render under the contact details.
- `weddingsPage`: add `inquiryForm` (reference). Render in place of / below pricing.
- `useOurSpacePage`: add `inquiryForm` (reference). Render in the inquiry block.
- Seed three `form` docs: **General Contact** (name, email, message), **Wedding Inquiry** (couple
  names, email, phone, event date, guest count, ceremony/reception, hearing source, message —
  mirroring the Squarespace form), **Space Use Inquiry** (name, org, email, phone, event type, date,
  attendance, message). Web3Forms access key left blank with a note for the editor to paste one.
- `form` is also available as a page-builder block in Phase 4 (`formRef`).
- Studio: add `form` to `structure.ts` Content list; `sanity.config.ts` `urlForDoc` -> `/contact`
  (or none). It is a collection, not a singleton.

---

## Phase 2 — Operational content + integrations

### `announcement` (new collection; replaces the single `siteSettings.announcement` object)
- `title` (internal), `message` (string), `link` ({label, url} optional), `style` (list:
  info | special | urgent), `startDate` (datetime), `endDate` (datetime), `enabled` (boolean).
- BaseLayout query: the active announcement = `enabled && now within [startDate, endDate]`, most
  urgent / soonest-ending first; render the existing banner. Secretary queues seasonal notices ahead.
- Migration: drop `siteSettings.announcement` (object) in favor of the collection; cleanup script
  extended.

### `worshipResource` (new collection)
- `title`, `date` (date), `type` (list: Bulletin | Order of Worship | Liturgy | Hymn list |
  Newsletter (The Record) | Annual report | Other), `file` (file, PDF) OR `externalUrl` (url),
  `description` (text optional). Ordered by date desc.
- Surface: a "Worship resources" / "Latest bulletins" section on `/worship` (recent N), and an
  optional dynamic block (Phase 4).

### `sermonSeries` (new collection) + `sermon.series` -> reference
- `sermonSeries`: `title`, `slug`, `description` (text), `image`, `startDate`, `endDate`.
- Change `sermon.series` from string to `reference(sermonSeries)`. Backup + migrate existing string
  values (script: for each distinct series string, create a series doc, set the reference). Sermons
  page groups by series; series get a simple landing (list of sermons) — optional route
  `/sermons/series/[slug]` (Phase 2 or deferred).

### Enrich `event`
- Add: `audience` (list: Everyone/Families/Kids/Youth/Adults/Seniors), `specialService` (boolean),
  `liturgicalSeason` (list: Advent/Christmas/Epiphany/Lent/Holy Week/Easter/Pentecost/Ordinary),
  `cost` (string), `registrationLabel` (string; pairs with existing `registrationUrl`),
  `contactName` + `contactEmail`, `allDay` (boolean), `featuredOnHome` (boolean).
- Surfaces: a **Special Services** band (home + `/events`) listing `specialService == true` upcoming
  events; `featuredOnHome` feeds the home events teaser. Categories list expanded for church use.

### Enrich `ministry`
- Add: `ageRange` (string, e.g. "Grades 6-12"), `schedule` (string, when it meets), `season`
  (list: Year-round / School year / Summer / Seasonal), `contactName` + `contactEmail`,
  `registrationUrl`, `parentMinistry` (reference to `ministry`).
- Surfaces: a `/ministries` index grouped by audience; a parent ministry page lists its
  sub-programs (Youth -> Middle School, High School, Confirmation, VBS).

### `siteSettings` — "Connect & integrations" group
- Keep the existing `watchUrl` (livestream) and `giveUrl` (giving) fields as-is (no rename, no
  migration). Move them into a new "Connect & integrations" group and ADD: `appUrl` (church app),
  `directoryUrl`, `registrationBaseUrl`, `prayerUrl` (prayer/connection card). Each optional;
  surfaced (header/footer/CTAs) only when set.

### `embed` (new object block)
- `{ title?, mode: url|html, url?, html?, aspect? }`. Used in Portable Text and as a page-builder
  block to drop in a Subsplash player, a PCO signup, a Google calendar, or a map.
- Shares one `Embed` renderer with the Phase 1 form embed mode: iframes pass through; pasted markup
  containing `<script>` (Subsplash Smart Embeds, etc.) is parsed and each script element is
  re-created so it executes. Build the renderer once and reuse it in both places.

---

## Phase 3 — Home editability + seasonal hero + "This Sunday"

### Make the home hero fully editable
- `homePage` hero group already has `heroEyebrow/heroHeadline/heroSubhead/heroImage(s)/heroPrimaryCta/
  heroSecondaryCta/heroScriptAccent`. Add `heroKeyword` (the word set in chapel green). Wire
  `index.astro` to render these (today the split hero is hardcoded with only the image overridable).

### Seasonal hero override (dated)
- `homePage.seasonalHero` (object): `enabled`, `startDate`, `endDate`, `eyebrow`, `headline`,
  `keyword`, `subhead`, `image`, `primaryCta`, `secondaryCta`. When enabled and now in window, the
  home hero renders the seasonal version (Holy Week, Christmas), else the default. Build-time `now`
  with the publish webhook / scheduled rebuild refreshing it.

### "This Sunday" block
- `homePage.thisSunday` (object): `enabled`, `dateLabel`, `sermonTitle`, `scripture`, `preacher`,
  `note`, plus a Watch CTA using `siteSettings.livestreamUrl`. Rendered on home + `/worship`.

### Home sections editable
- Convert the remaining home section copy (welcome, inclusive-welcome, service band text, The Record)
  to `homePage` fields, seeded with current values.

---

## Phase 4 — Full page editability (structured fields + flexible sections)

### Block library (shared object types) + `<Sections>` renderer
Block object types (each renders on-brand with the design tokens + arch motif + chapel bands):
- `richText` (Portable Text)
- `imageText` (image + heading + body + optional CTA; image side toggle; arched option)
- `cardGrid` (array of cards: title, body, icon/image, link)
- `quote` (scripture/quote + attribution; chapel-band styling)
- `ctaBand` (eyebrow, headline, subhead, CTA; chapel background)
- `accordion` (FAQ-style; reuses customized `ui/accordion`)
- `embed` (Phase 2 object)
- `formRef` (reference a `form`)
- `gallery` (image array; lightbox optional) — minimal
- `dynamicList` (mode: latestSermons | upcomingEvents | ministries | staff | worshipResources; count)

`src/components/Sections.astro` maps `block._type` to its component. Each page renders its
structured hero + structured sections, then `flexibleSections[]` via `<Sections>`.

### Per-page structured fields + `flexibleSections[]`
For each page singleton, add structured fields mirroring its current designed sections so all text +
images are editable (design preserved), plus an optional `flexibleSections[]` page-builder array for
add/remove/reorder. Pages: worship, about, what-we-believe (seed verbatim), music, grow, serve, kids,
food, give, use-our-space, faq, contact, privacy, plus the events/sermons index intros.
Seed every field from the current inline copy/images. Convert each `.astro` template to render from
Sanity with the existing inline content kept as the `sanityFetch` fallback.

### Generic `page` type (optional one-offs)
- A `page` singleton-free type (title, slug, hero, `flexibleSections[]`, SEO) for brand-new pages the
  secretary creates (e.g. a stewardship campaign landing), routed at `/[slug]`.

---

## Cross-cutting
- **Studio**: register new types in `schemaTypes/index.ts`; place them in `structure.ts` (Content:
  Forms, Worship Resources, Sermon Series, Announcements; Pages unchanged); extend
  `sanity.config.ts` `urlForDoc` + `SINGLETON_TYPES` as needed; `npm run studio:deploy` per phase.
- **Types**: `npm run typegen` after each schema change; `src/lib/sanity.types.ts` committed.
- **Queries**: extend `src/lib/queries.ts` per type with `IMAGE_PROJECTION`/`CTA_PROJECTION` and a
  fallback. Add `getForm`, `getActiveAnnouncement`, `getWorshipResources`, `getSermonSeries`,
  enriched event/ministry projections, `getPageBySlug`.
- **Migrations**: `sermon.series` string->reference (backup first, script maps distinct strings ->
  series docs); `siteSettings.announcement` object -> `announcement` collection.
- **Verification per phase**: production build green; `sanity build`; Playwright screenshot the
  touched pages light + dark, mobile + desktop; Lighthouse on a representative page; create one
  sample doc per new type to confirm Studio + render.

## Out of scope (link or embed instead)
Online giving checkout, registration/RSVP processing, member directory, prayer-request database,
event ticketing, full media hosting. Job postings and richer photo galleries are possible later
additions, not in this spec.

## Build order
Phase 1 (forms) -> Phase 2 (operational content + integrations) -> Phase 3 (home + seasonal hero) ->
Phase 4 (full page editability). Each phase: schema -> typegen -> wire + seed -> build -> studio
deploy -> commit. Site stays green and shippable after every phase.
