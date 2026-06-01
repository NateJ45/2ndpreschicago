# What's editor-driven vs hardcoded

> Reference for what an editor can change in Studio versus what needs a code edit. Mark component files accordingly.

## What's editor-driven vs hardcoded

> Church build note: this project (Second Presbyterian) pushed almost everything to
> editor-driven via the inline-fallback pattern. The interior-designer template's
> modules (portfolio, journal, services, testimonials, philosophy, shop, etc.) are
> not used here; their docs under `docs/modules/` remain for template reuse only.

### Editor-driven (Sanity)

- **All page copy** -- every page singleton's eyebrows, headlines, subheads, body, and closing CTA are editable fields. Empty fields fall back to the built-in verbatim copy (the inline-fallback pattern), so the site reads correctly before anything is entered. Exception: the *What We Believe* statement of faith is reproduced verbatim and owned by leadership -- edit with care.
- **All hero images** -- every `*Page` singleton has a `heroImage` (with alt). The home page also has `heroImages` (one = static, two+ = cross-fading slideshow) and a dated `seasonalHero` override.
- **Navigation** -- the header menu (`siteSettings.navItems`: Links + Dropdown menus) and the footer link columns (`siteSettings.footerColumns`). Both fall back to the built-in menus when empty; the mobile menu inherits the header. The footer "Get in touch" column is derived from contact fields.
- **Favicon** -- `siteSettings.favicon` (browser-tab icon); falls back to the bundled church mark in `/public/favicon.png`.
- **Collections** -- Events, Sermons, Pastors & Staff (`staffMember`), Ministries (`ministry`), FAQ Items (`faqItem`, which drive the FAQ page), Forms (`form`), Announcements (scheduled site banner), Worship Resources (`worshipResource`).
- **Page sections (the page builder)** -- every page singleton plus the generic `page` type has a `flexibleSections[]` array: add / reorder / remove on-brand blocks (rich text, image+text, cards, quote, CTA band, form, feature cards, stats, FAQ, gallery, steps, logos, media feature, dynamic list), each with a background control (brand tone, or image/video + overlay). See `page-architecture.md`.
- **Custom pages** -- the `page` type publishes a brand-new page at `/<slug>` with the block library, no developer.
- **Site-wide identity & integrations** -- `siteSettings`: church name, tagline, mission, email, phone, socials, service time, and a "Connect & integrations" group (watch / give / app / directory / registration / prayer URLs). Phone feeds the LocalBusiness JSON-LD and tap-to-call; clearing it hides every instance.
- **SEO / social** -- per-page `seoTitle` / `seoDescription` / `seoImage`; a site-default `siteSettings.seoImage`.
- **Section heading script accents** -- `scriptAccent`-style fields render one word of a heading in the handwritten display font. The word must match the heading text exactly; leave empty for no accent. See `polish-layer.md`.
- **404 page** (`notFoundPage`) and **Privacy page** (`privacyPage`) -- editable, each with a hardcoded fallback so it works before the doc exists.

### Hardcoded in code (intentional)

These are stable design and system decisions that don't belong in editorial:

- **Brand colors / typography tokens** -- declared in `src/styles/globals.css` `@theme` block; the Studio theme mirrors them in `studio/sanity.config.ts`. System-level, not editorial.
- **Page layout & section markup** -- the structure of each page and each block component. Editors change words, images, section order, and backgrounds; the layout is code.
- **Auto-year copyright** -- computed from `new Date()` at render time. No field needed.
- **The "How This Works" help guides** -- repo-based and locked on purpose (`studio/guides/content.tsx` + `studio/components/GuideView.tsx`), so staff can't edit or delete the instructions. This replaces the old `studioGuide` / `studioNotes` / `studioPlaybook` singletons.
- **Built-in menu fallbacks** -- `FALLBACK_NAV_ITEMS` in `Header.astro` and the default columns in `Footer.astro`. These render only when the editor's `navItems` / `footerColumns` are empty.

> Note: the **navigation is no longer hardcoded** -- the header (`navItems`) and footer columns (`footerColumns`) are editor-driven, with the built-in arrays above as the fallback.

### The `// Safe to edit by hand` convention

At the top of each component file, a header comment marks it as either:
- `// Safe to edit by hand` -- a project maintainer can make changes here without risk of breaking the underlying architecture.
- `// Foundation, edit with care` -- changes propagate widely; route through a planned session.

If you ever want to flip something from hardcoded to editor-driven, the pattern is: add a field to the appropriate Sanity schema, run `npm run typegen`, update the component to consume the new field with a fallback to the current hardcoded value, run `npm run studio:deploy`, commit.
