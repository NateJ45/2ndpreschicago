# Church Remodel — Summary

Branch: `redesign/church-remodel` (off `master`; master untouched).
Date: 2026-05-31. Source of truth for design: `docs/research/church-website-audit.md`
(10 Presbyterian peer sites, Highland Park Presbyterian as the gold standard). Full audit and
design rationale: `docs/remodel/audit.md`, `docs/remodel/design-direction.md`.

Goal: make the site look like a distinctive, purpose-built church rather than the warm
interior-designer template it was forked from, and rebuild the Sanity schema to fit a church
non-profit (removing everything left over from the business build).

---

## What changed in the front end

**New identity tokens (`src/styles/globals.css`, mirrored in `src/data/site.ts`)**
- Added a **Chapel green** accent (`--color-chapel` #1E423B, `--color-chapel-deep` #16322C,
  `--color-chapel-foreground` cream) drawn from the church's Tiffany glass: the cool liturgical
  counterpoint to the warm bronze. This is the single biggest break from the warm-mono template.
- Added **liturgical gold** (`--color-gold`) for hairline rules and small accents.
- Added a theme-aware **keyword-emphasis** color (`text-chapel-ink`) for setting one key word of a
  headline in green (the Highland Park device).
- Added the **arch motif**: `arch-top` / `arch-top-sm` utilities (a Romanesque rounded crown via
  `--arch-radius`), the building's architectural signature, repeated across hero, welcome, staff,
  and 404 images.

**Header (`Header.astro`)** — replaced the muted designer eyebrow strip with a **Chapel-green
utility bar** (service time + address on the left; Watch Live, Give, social, theme on the right).
Removed the interior-designer availability pill and the section-visibility dependency. Primary nav
+ accessible `<details>` dropdowns + the gold Plan a Visit pill are kept (still server-rendered).

**Footer (`Footer.astro`)** — rebuilt from a light strip into a **deep Chapel-green footer**: brand
+ mission + Plan a Visit, a Sunday Worship card (times, address, Get directions), the four link
columns, and a thin bottom bar. Cream-on-green throughout.

**Home page (`index.astro`)** — rebuilt as the showcase:
- A **split hero** on cream: oversized serif headline with "Jesus" set in Chapel green, two pills,
  a "This Sunday" line, and an **arched photo** of the sanctuary (replaces the full-bleed dark scrim).
- A **service-times band** (Chapel green) stating when/how/where with Plan a Visit + Watch.
- Welcome with an **arched** interior photo; a solid Chapel-green **inclusive-welcome** band;
  next-step ministry cards with gold arch caps; events rhythms; The Record; a Chapel-green close.
- Varied section rhythm (cream + green bands) instead of a uniform stack.

**FinalCta** restyled from espresso to **Chapel green** so every page ends on the cool brand anchor.

**Interior pages** inherit the new chrome + tokens + Chapel FinalCta automatically. `/pastor-staff`
additionally got **arched headshots** and is now wired to Sanity (below). `/404` was de-templated
(church CTAs, bundled arched fallback photo, no dead `/portfolio` link or "Studio dogs" image ref).

**Deletions** — removed ~30 leftover template components (FeaturedWork, ProjectCard, Testimonial*,
Process*, Stats*, ServiceArea*, Journal*, PressStrip, CalendlyInline, BeforeAfterSlider, the
decorative `ui/` beam/bento/marquee/spotlight, etc.), the entire `/journal` route, and the
now-dead GROQ exports (services, projects, journal, press). `src/lib/sectionVisibility.ts` is now
unused (left in place, returns all-visible).

## What changed in Sanity

**Removed types** (interior-designer / small-business): `service`, `servicesPage`, `testimonial`,
`philosophyPoint`, `journalEntry`, `journalCategory`, `journalPage`, `studioGuide`, `studioNotes`,
`studioPlaybook`. Plus the orphaned "Start Here" desk components.

**Field surgery on kept types**:
- `siteSettings`: cut availability/serviceAreas/travelFees/Google-reviews/satisfaction-guarantee and
  the module visibility toggles. Added church fields: `serviceTimes`, `watchUrl`, `giveUrl`,
  `mission`, `socialYoutube`, and an `announcement` banner object.
- `homePage`: cut the meetFounder / featuredWork / featuredJournal / process / testimonials /
  services groups and `serviceAreaCue`. Kept hero + SEO + final.
- `aboutPage`: cut philosophy / personal / stats groups and the founder/credentials/service-area
  fields. Church default copy.
- `contactPage`: cut the lead-form option arrays, post-inquiry roadmap, and Calendly scheduling.
- `faqItem` / `faqPage`: business categories replaced with church categories (Visiting, Worship,
  Kids & Family, Getting Involved, Giving, Weddings & Space). `ctaBlock` lost its journal refs.

**Added types**: `staffMember` (name, role, photo, email, bio, favorites) and `ministry` (title,
audience, summary, image, link, featured). Both render on the front end with inline fallbacks.

**Desk + config**: `structure.ts` rebuilt (no Start Here, no Journal section; Pastors & Staff +
Ministries added under Content). `sanity.config.ts` pruned to church `urlForDoc` routes + singletons.

**Dataset**: exported to a backup first (below), then deleted the 2 orphaned business documents
(`studioGuide`, `studioNotes`). Schema validates (typegen: 45 types) and the Studio builds.

---

## Backup location
`backups/pre-remodel-2026-05-31.tar.gz` (32 documents + 12 assets, exported from the `production`
dataset before any deletion). This path is git-ignored; keep the file safe locally. Restore with
`cd studio && npx sanity dataset import ../backups/pre-remodel-2026-05-31.tar.gz production`.

---

## Manual follow-ups for you
1. **Deploy the Studio after merge.** This branch did NOT deploy to the hosted Studio (to avoid
   getting ahead of `master`). After merging, run `npm run studio:deploy` so the hosted Studio
   matches the new schema. (Until then the live Studio still shows the old fields.)
2. **Migrate staff + ministries to Sanity (optional).** `/pastor-staff` and the home next-step row
   render from the existing hardcoded content as a fallback. Add `staffMember` / `ministry`
   documents in the Studio to take over. Note the fallback behavior: adding even one `staffMember`
   replaces the whole hardcoded staff list, so add all of them (or none) at once. Same for featured
   ministries on the home page. Headshots/photos upload through the normal image fields.
3. **Set the giving + livestream links** in Site Settings (`giveUrl`, `watchUrl`). Until set, the
   header/footer Give and Watch links fall back to `/give` and `/sermons`.
4. **Orphaned field data.** The kept singletons (homePage, aboutPage, contactPage) still hold the
   old business field values in the dataset. They are not read or shown. They clear themselves the
   next time you open and save each document in the deployed Studio; no migration is required.
5. **Recommended final pass:** run Lighthouse on the home page in both themes after deploy to
   re-confirm the 100s (the new Chapel/cream contrasts were chosen for AA, but verify on device).
6. **Dev-only leftovers (non-blocking):** `scripts/seed-core.mjs` / `import-content.mjs` and the
   dormant `modules/` (portfolio, shop, press, etc.) still reference old types. None are wired into
   the live site or active Studio; delete them in a separate cleanup if you want a leaner repo.

## Decisions made under "full liberty" to review
- **Kept the warm cream/bronze brand** (it is genuine to this landmark church) and *added* Chapel
  green + gold rather than recoloring, so the church's identity is deepened, not replaced.
- **Arch motif** chosen as the signature shape (the building is Gothic Revival; Highland Park uses
  an arch as a quiet nod). Applied to hero, welcome, staff, and 404 imagery.
- **Split hero on cream** replacing the full-bleed dark scrim — the clearest "purpose-built church"
  signal and the biggest single departure from the template.
- **Worked from the existing research doc** rather than re-screenshotting all 10 peer sites, to keep
  the effort on execution. The research already screen-studied the peer set.
- **Announcement banner** added (schema + BaseLayout) as a genuine church feature, off by default.
