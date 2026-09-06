# Content audit: Sanity-editable vs hardcoded (2026-06-01)

> **STATUS: remediated (phases A–D), 2026-06-01.** Everything below was the
> finding; it has since been fixed. The closing-CTA button, SEO titles, home
> hero buttons, in-body section images, events-teaser copy, and contact details
> are now editable; ~185 body-copy fields + the list fields were seeded so the
> Studio mirrors the live site; orphaned fields were removed and the 404 defaults
> fixed. See the `docs/agent/changelog.md` entries dated 2026-06-01 for detail.
> Re-run `node scripts/audit-field-population.mjs` to check current population.

> Comprehensive, per-page audit of what the live site shows versus what an editor
> can actually change in Sanity Studio. Triggered by: "the home page in Sanity has
> numerous empty fields while the live site shows content." Method: read every
> `src/pages/*.astro` template + `src/lib/queries.ts` + the schemas, and queried the
> live dataset field-by-field (`scripts/audit-field-population.mjs`).

## Root cause (the thing you're seeing)

The site uses an **inline-fallback pattern**: almost every template renders
`{page?.field ?? "hardcoded default"}`. So most copy IS wired to a Sanity field,
but the field is **empty**, and the site shows the baked-in default. In Studio that
field looks blank. The editor has no way to know (a) that the blank field controls
the live text, or (b) what the live text currently is.

So "empty in Studio + text on the live site" almost always means **editable but
unpopulated**, not "hardcoded with no field." But the audit also found real
hardcoding and a pile of **orphaned** fields. Three distinct problems:

1. **Empty-but-editable** (the bulk of what you see): field exists, is empty, site shows the fallback. Fix = seed the current copy into Sanity.
2. **Orphaned fields**: a field exists in Studio (and is even fetched) but the template never renders it, so editing it does nothing. Fix = wire it or remove it.
3. **Truly hardcoded**: content is a literal in the template with no field at all. Fix = add a field + wire + seed.

## The data: field population per singleton

From `node scripts/audit-field-population.mjs` against `kz01wb83/production`:

| Singleton       | Fields set / total |
| --------------- | ------------------ |
| homePage        | 8 / 40             |
| aboutPage       | 9 / 27             |
| worshipPage     | 4 / 32             |
| beliefsPage     | 4 / 39             |
| musicPage       | 4 / 22             |
| staffPage       | 4 / 11             |
| growPage        | 4 / 12             |
| servePage       | 4 / 12             |
| kidsPage        | 4 / 16             |
| foodPage        | 4 / 17             |
| eventsPage      | 6 / 18             |
| sermonsPage     | 6 / 15             |
| useOurSpacePage | 4 / 19             |
| weddingsPage    | 4 / 22             |
| givePage        | 4 / 19             |
| faqPage         | 1 / 18             |
| contactPage     | 3 / 23             |
| privacyPage     | 7 / 11             |
| notFoundPage    | 11 / 12            |
| siteSettings    | 14 / 24            |

The ~4-set pages have only their hero (eyebrow/headline/subhead/image, from the
earlier hero-image seed) populated; every body-copy field is empty. **This is why
the Studio looks empty.** The schemas are rich and correct; they were just never
filled, so the pages run on code fallbacks.

## Category 1: Empty but editable (seed the current copy in)

Every body-copy field listed as EMPTY by the population script is in this bucket.
The live text exists only as a code fallback. Examples on the home page:
`heroEyebrow`, `heroHeadline`, `heroSubhead`, `welcomeEyebrow/Headline/BodyP1/BodyP2`,
`inclusiveStatement/Body`, `involvedEyebrow/Headline/Subhead`,
`recordEyebrow/Headline/Body/CtaLabel`, `serviceBand.*`, `weeklyRhythms`,
`finalCtaEyebrow/Headline/Subhead`. The same holds for every interior page
(worship `gather*`/`plan*`/`kids*`/`quote*`, beliefs `beliefsQ*`/`fit*`/`going*`,
music `intro*`/`choir*`/`organ*`, food `lunchBag*`/`table*`, etc.).

**Fix:** pull each page's inline fallback string out of the `.astro` and write it
into Sanity (extend the existing `seed-*.mjs` scripts). After that, every Studio
field shows the live copy and editing it changes the site. No code or visual change.

## Category 2: Orphaned fields (in Studio, but do nothing)

These fields exist in the schema (an editor sees them) and several are even fetched
by the query, but the template never renders them. Editing them has no effect.

- **homePage**: `heroPrimaryCta`, `heroSecondaryCta` (the hero buttons are hardcoded "Plan a Visit" / "Watch Online" in `index.astro`), `finalCta`, `finalCtaBackgroundImage`.
- **aboutPage**: `storyEyebrow`, `storyHeadline`, `storyContent` (fetched, never rendered), `finalCta`, `finalCtaBackgroundImage`, `heroScriptAccent`, `finalCtaScriptAccent`, `seoImage`.
- **contactPage**: `whatToExpectHeadline`, `whatToExpectContent` (fetched via `...`, never rendered — leftover from the designer template), `heroScriptAccent`.
- **faqPage**: `finalCta`, `secondaryCta`, `finalCtaBackgroundImage`, `heroScriptAccent`, `finalCtaScriptAccent` (all fetched; FAQ hardcodes its closing CTA and never passes secondary/background/accent).
- **SEO on most interior pages**: `seoTitle` / `seoDescription` exist and are fetched, but `worship`, `music`, `what-we-believe`, `use-our-space`, `weddings`, `give`, and `contact` hardcode `title`/`description` literals and ignore the fields. (about, faq, privacy, sermons, events, and the generic `[slug]` page DO wire them.)
- **contact details**: `siteSettings.phone` and `siteSettings.email` exist, but `contact.astro` renders `site.contact.phone` / `site.contact.email` / `site.contact.officeHours` from `src/data/site.ts` instead, so the Studio fields are dead on that page.

**Fix:** for each, either wire it into the template or delete it from the schema so
the Studio stops showing a control that does nothing.

## Category 3: Truly hardcoded (no Sanity field at all)

### 3a. Closing CTA button, every page (highest-impact)

`<FinalCta cta={{ label, externalUrl }} />` is a **literal object on all 19 page
templates** (verified). The eyebrow/headline/subhead above the button are editable
on most pages, but the **button label and destination can never be edited** in
Sanity. The shared church page factory (`churchPages.ts`) provides `finalCta*` text
fields but no CTA-link field.

### 3b. Section body images (bundled, not editable)

Only the **hero** image is a Sanity field on each page (`page?.heroImage`, with a
bundled `@/assets` fallback). Every other in-body photo is a hardcoded bundled asset
with no field:

- home: Welcome section image (`sanctuary-interior.webp`)
- about: the angel-mural feature image and the building/nave image
- worship: the Tiffany-windows image
- music: the mural-angels image

### 3c. In-body links and labels

Hardcoded label + href, no field: home "Watch Online", "What We Believe", "Meet Our
Pastors", "See the Full Calendar", "Learn more"; worship "Get Directions" / "Watch
Online" / "More for kids"; music "Michael Shawgo..." link; about "Visit or Use the
Space" / "What We Believe" / "Meet Our Pastors"; food "Support Lunch Bag" / "Support
the Table"; serve "Learn more"; sermons/events empty-state "Plan a Visit" / "Sunday
worship" links. (Many of these are structural nav and may be fine hardcoded.)

### 3d. Home "events teaser" section (section 6)

The eyebrow "What's On", headline "There is always something happening at Second",
and the intro paragraph are literals with no field (the `weeklyRhythms` list below
them IS an editable field). Also the "This Sunday: 11am, in person and online."
fallback line and the Record-newsletter `mailto:` address are hardcoded.

### 3e. Collection-detail fields that are dropped

Editors can fill these on a sermon/event and they never appear on the page:

- **event detail** (`events/[slug].astro`): `registrationLabel` (hardcoded "Register"), `cost`, `contactName`, `contactEmail`, `audience`, and `allDay` is ignored in the time logic. All fetched, none rendered (verified).
- **sermon detail** (`sermons/[slug].astro`): `sermon.image` is fetched but never rendered; the closing CTA eyebrow/headline/subhead are also hardcoded literals (not just the button).

## Category 4: Stale defaults / bugs

- **404 page schema** (`notFoundPage.ts`) still has interior-designer defaults: `secondaryCtaLabel: 'Browse the portfolio'`, `secondaryCtaHref: '/portfolio'`, `heroImage.caption: 'From the studio'`. The live page is masked by correct inline fallbacks, but an editor opening the doc in Studio gets these wrong initial values.

## Remediation plan (proposed order)

1. **Seed all empty fields** with the current fallback copy (Category 1). Biggest visible win, zero risk, makes the Studio reflect the live site. Mechanical.
2. **Add an editable closing-CTA link** (label + URL) to the page factory and wire every `FinalCta` (Category 3a). Removes the single most consistent hardcoded element.
3. **Wire SEO `seoTitle`/`seoDescription`** on the 7 pages that ignore them (Category 2).
4. **Resolve orphaned fields** (Category 2): wire `about` story + the `finalCta`/background/scriptAccent fields where wanted; remove the dead `contactPage.whatToExpect*` and any others we don't want.
5. **Fix the 404 stale defaults** (Category 4). Trivial.
6. **Surface dropped event/sermon detail fields** (Category 3e): render `registrationLabel`, `cost`, `contact*`, `audience`, and `sermon.image`.
7. **Make in-body section images editable** (Category 3b): add image fields + wire. Optional, more work.
8. **Move contact phone/email/office hours to siteSettings** (Category 2). Small.
9. **Decide per-case on the remaining hardcoded labels/links** (Category 3c/3d): add fields where the church would realistically change them; leave structural nav alone.

Items 1, 2, 3, 5 are the high-value core and cover the visible "everything is empty /
the buttons and titles aren't editable" complaint.
