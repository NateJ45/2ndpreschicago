# Page architecture

> Core page and section architecture, the page builder, the nav, and how empty content behaves.

## Page architecture

### Routes

Second Presbyterian ships these routes. Each is backed by a Sanity page singleton (content editable, structure in code), except the dated detail pages (collection-driven) and the generic `page` type.

| Path                                | Source                           | Notes                                                                                                            |
| ----------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/`                                 | `src/pages/index.astro`          | Home singleton; hero + optional dated `seasonalHero` + "This Sunday"                                             |
| `/about`                            | `src/pages/about.astro`          | About singleton                                                                                                  |
| `/worship`                          | worship singleton                | "I'm New" / plan-a-visit page                                                                                    |
| `/what-we-believe`                  | beliefs singleton                | Statement of faith is reproduced verbatim (leadership-owned)                                                     |
| `/music`                            | music singleton                  |                                                                                                                  |
| `/pastor-staff`                     | staff singleton + `staffMember`  |                                                                                                                  |
| `/grow`, `/serve`, `/kids`, `/food` | per-page singletons              | Get-involved / ministry pages                                                                                    |
| `/events`                           | `src/pages/events/index.astro`   | Events index + `event` collection (incl. the Special Services band)                                              |
| `/events/[slug]`                    | `src/pages/events/[slug].astro`  | Event detail                                                                                                     |
| `/sermons`                          | `src/pages/sermons/index.astro`  | Sermons index + `sermon` collection + persistent Watch Live link                                                 |
| `/sermons/[slug]`                   | `src/pages/sermons/[slug].astro` | Sermon detail                                                                                                    |
| `/use-our-space`, `/weddings`       | per-page singletons              | + inquiry `form`                                                                                                 |
| `/give`                             | giving singleton                 |                                                                                                                  |
| `/faq`                              | `src/pages/faq.astro`            | FAQ singleton + `faqItem` collection                                                                             |
| `/contact`                          | `src/pages/contact.astro`        | Contact singleton + `form`                                                                                       |
| `/privacy`, `/404`                  | privacy singleton; custom 404    |                                                                                                                  |
| `/<slug>`                           | `src/pages/[slug].astro`         | Generic `page` type -- editor-built pages from the block library (reserved-slug guard; zero pages = zero routes) |

The interior-designer starter's opt-in modules (portfolio, journal, shop, e-design, etc.) are NOT active in this build; their docs under `docs/modules/` remain for template reuse only.

### Page structure

Each page is a Sanity singleton whose built-in copy and images are editable fields (with verbatim fallbacks, so the page reads correctly before anything is entered), plus auto-populated content from collections (events, sermons, staff, ministries, FAQ items, worship resources). The layout of each page is fixed in code; the words, images, page-builder section order, and backgrounds are editable.

**The page builder.** Every page singleton -- plus the generic `page` type -- has a `flexibleSections[]` array rendered by `Sections.astro`. Editors add / reorder / remove on-brand blocks (rich text, image+text, cards, quote, CTA band, form, feature cards, stats, FAQ, gallery, arched showcase (slideshow/video), steps, logos, media feature, dynamic list), each with a background control (brand tone, or image/video + readability overlay) via `SectionShell.astro`. They render below a page's built-in content and are empty by default, so nothing changes until used. Spec: `docs/superpowers/specs/2026-06-01-page-builder-expansion-design.md`.

**Built-in content + closing CTA.** A page renders its bespoke built-in sections (hero, then the page's content fields), then any `flexibleSections`, then a `<FinalCta>` whose eyebrow / headline / subhead are editable per page. The home page additionally supports the dated `seasonalHero` override and a "This Sunday" block.

**Background cadence.** Built-in sections alternate `bg-background` / `bg-muted`, with deep chapel-green bands for the utility/CTA surfaces, so adjacent sections don't share a surface. Page-builder sections set their own background via the block's background control.

### Empty-content behavior (no module toggles)

**Sanity is the single source of truth for all content** (see `editor-vs-hardcoded.md`): every content field is populated, so the Studio mirrors the live site, and the inline strings in the templates are only a safety net. This build also does not use the starter's `sectionVisibility` module-toggle system -- there are no opt-in module sections to gate. Content degrades gracefully on its own:

- **Empty fields fall back** to the built-in verbatim copy (the inline-fallback safety net), so a section can never go blank if a field is cleared. Fields are populated by default, so the Studio shows the live copy rather than a blank input.
- **Empty collections degrade** (e.g. `/sermons` shows a "watch online" state with the live link when no sermons are posted; an empty FAQ category simply doesn't render; an announcement only shows when enabled and within its date window).
- **Page-builder sections** are opt-in by nature: a page with no `flexibleSections` just shows its built-in content.

(If you later enable a starter module, its `docs/modules/` doc documents the visibility toggle that gates it.)

### Header + footer nav

The header menu and the footer link columns are **editor-driven** (`siteSettings.navItems` and `siteSettings.footerColumns`), with the built-in `FALLBACK_NAV_ITEMS` in `Header.astro` and the default columns in `Footer.astro` rendering only when those fields are empty. See `editor-vs-hardcoded.md`.

The desktop nav is **server-rendered** in `Header.astro`: flat items are real `<a>` tags, dropdown groups are native `<details>`/`<summary>` disclosures with child links as real `<a>` tags inside. Everything is in the server HTML at build time, so crawlers see every internal link and there is no flash-of-missing-nav (or CLS) before JS runs. A small progressive-enhancement `<script>` layers on open-on-hover, close-on-outside-click, close-on-Escape, and close-on-navigation (re-bound on `astro:page-load`; document-level listeners guarded by `window.__headerNavBound` so they don't stack across View Transitions). The nav works with JS disabled.

**Do NOT regress the desktop nav to a client-only island.** An earlier pattern hydrated a `NavDropdowns.tsx` React island with `client:only="react"`, which left the ENTIRE desktop nav out of the server HTML -- bad for SEO and CLS. Keep the flat links and the group structure SSR'd; use an island only for the open/close interaction if it is ever needed.

**The nav shape.** `Header.astro` maps each Sanity `navItems` entry (a Link or a Dropdown menu) into `{ kind: 'flat' }` / `{ kind: 'dropdown', items: [...] }` and shares that with `MobileNav.tsx`, so desktop and mobile stay in sync (the mobile drawer inherits the same menu). `<summary>` triggers carry `.nav-underline` and get `aria-current="page"` (which locks the underline wide) when one of their children is the active route.

**Header breakpoint is `lg:` (1024 px), not `md:` (768 px).** Between md and lg the nav + CTA cram against the wordmark and visibly squish it; bumping the breakpoint means tablet/narrow-laptop widths use the centered-logo + hamburger layout, and the desktop layout appears only once there is room for it.
