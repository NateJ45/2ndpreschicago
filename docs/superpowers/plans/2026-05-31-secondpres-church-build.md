# Second Presbyterian Church of Chicago — Site Build Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox (`- [ ]`) syntax. Verbatim copy lives in `docs/migration/content-inventory.md`; this plan references it rather than duplicating every paragraph.

**Goal:** Reskin and rebuild the NCS starter into a complete, best-practice church website for Second Presbyterian Church of Chicago, migrating all content + branding off Squarespace, adding a dedicated Events module, and disabling the Services abstraction.

**Architecture:** Keep the starter's Sanity-backed-page-with-inline-fallback pattern. Since no Sanity project is wired yet, each page renders its inline `?? 'fallback'` defaults; authoring church copy there makes the live build correct immediately. A new opt-in **events** module (collection `event` + `eventsPage` singleton + `/events` index + `/events/[slug]`) handles the church's heavy event needs. Services are removed from nav, Studio, and routing. Brand reskin happens entirely through the design seam (`globals.css` `@theme`, fonts, `site.ts`). The seed script is rewritten so connecting Sanity later is turnkey.

**Tech Stack:** Astro 6 (static), Sanity v5, Tailwind 4 `@theme`, React 19 islands, Cloudflare Workers. Fonts: Instrument Serif (display) + Newsreader (body), both serifs, via `@fontsource`.

**Decisions locked (from client):** (1) build a dedicated Events module; (2) disable Services; (3) keep serif body + pick a darker primary that passes AA; (4) photography rights are owned. Latitude granted to fix gaps, copy, fonts, colors, nav, slugs.

---

## Brand reskin spec (exact token values)

`src/styles/globals.css` `@theme` palette:
- `--color-primary: #8A6A43` (bronze) / `--color-primary-dark: #6B4F2E`
- `--color-accent: #36302A` (espresso ink, headings/body) / `--color-accent-dark: #241F1A`
- `--color-secondary: #B9A590` (clay) / `--color-tertiary: #A89A86` (warm stone, used sparingly)
- `--color-bg: #ECE4DA` (paper) / `--color-bg-soft: #F6F3EC` / `--color-border-soft: #DED6C8`
- `--font-display: "Instrument Serif", Georgia, serif;`
- `--font-body: "Newsreader Variable", Georgia, serif;`

Font imports (replace the three libre-baskerville/inter lines):
```css
@import "@fontsource/instrument-serif/400.css";
@import "@fontsource/instrument-serif/400-italic.css";
@import "@fontsource-variable/newsreader";
@import "@fontsource-variable/newsreader/standard-italic.css";
```

`:root` (light) shadcn map:
- `--background:#ECE4DA; --foreground:#36302A; --card:#FBF8F2; --card-foreground:#36302A; --popover:#FBF8F2; --popover-foreground:#36302A`
- `--primary:#8A6A43; --primary-foreground:#FFFFFF; --secondary:#B9A590; --secondary-foreground:#36302A`
- `--muted:#F1EBE0; --muted-foreground:#635849; --accent:#E3D9CB; --accent-foreground:#36302A`
- `--border:#DED6C8; --input:#DED6C8; --ring:#8A6A43; --link:#6B4F2E`
- `--tint-rgb: 138, 106, 67`

`.dark`:
- `--background:#1C1813; --foreground:#ECE4DA; --card:#262019; --card-foreground:#ECE4DA; --popover:#262019; --popover-foreground:#ECE4DA`
- `--primary:#C7A875; --primary-foreground:#1C1813; --secondary:#8A7A64; --secondary-foreground:#ECE4DA`
- `--muted:#262019; --muted-foreground:#B7AC9A; --accent:#2E2820; --accent-foreground:#ECE4DA`
- `--border:oklch(1 0 0 / 12%); --input:oklch(1 0 0 / 15%); --ring:#C7A875; --link:#D8BD8C`
- `--tint-rgb: 199, 168, 117`

Heading weight: change `h1..h6 font-weight: 500` to `400` (Instrument Serif ships 400 only). Print footer string "Studio Starter · example.com" → church name + domain.

Contrast note: verify `--primary` on cream and `--primary-foreground` on `--primary` with Lighthouse; darken `--primary` toward `#7C5E37` if AA fails.

---

## Information architecture (nav)

Top nav (`Header.astro` `NAV_ITEMS`), church groups:
- **About Us** (group): Worship `/worship`, What We Believe `/what-we-believe`, Music `/music`, Pastors & Staff `/pastor-staff`
- **Get Involved** (group): Grow `/grow`, Serve `/serve`, Kids `/kids`
- **Events** `/events`
- **Food** `/food`
- **Space** (group): Use Our Space `/use-our-space`, Weddings `/weddings`, Friends of Historic Second Church (external)
- **Give** `/give`

Header CTA: "Plan a Visit" → `/worship`. Footer columns rewritten to: Visit (Worship, What We Believe, Music, Events), Get Involved (Grow, Serve, Kids, Food), Connect (Use Our Space, Weddings, Give, Contact), Get in touch (address, phone, email, socials). Remove Services/Portfolio/tools links.

---

## File map

**Design seam / identity**
- Modify `src/data/site.ts` — identity + brandColors
- Modify `src/styles/globals.css` — palette, fonts, heading weight, print string
- Modify `scripts/generate-og-default.mjs` — OG inputs (colors, wordmark, tagline)
- Replace `public/favicon.svg`; logo handling in Header/Footer (text-wordmark church has no image logo — keep existing logo assets or set a simple wordmark; decide in Task)

**Nav / chrome**
- Modify `src/components/Header.astro` — church `NAV_ITEMS`, CTA
- Modify `src/components/Footer.astro` — church columns
- Modify `src/layouts/BaseLayout.astro` — church JSON-LD (PlaceOfWorship) [read first]

**Disable services**
- Delete or redirect `src/pages/services.astro`
- Remove `service` + `servicesPage` from `studio/schemaTypes/index.ts` + `studio/structure.ts`
- Remove services references from `index.astro` + `Footer.astro`

**Events module (new) — `modules/events/`**
- Create `modules/events/studio/event.ts` (collection)
- Create `modules/events/studio/eventsPage.ts` (singleton)
- Create `modules/events/src/pages/events/index.astro`
- Create `modules/events/src/pages/events/[slug].astro`
- Create `modules/events/seed.mjs`
- Create `docs/modules/events.md` (enable doc)
- Then ENABLE: copy schemas to `studio/schemaTypes/`, register in index.ts + structure.ts, copy pages to `src/pages/events/`, add queries to `src/lib/queries.ts`, nav already added.

**Core pages (rewrite fallbacks → church copy)**
- `src/pages/index.astro` (home), `about.astro` (story/history/beliefs), `contact.astro`, `faq.astro` (wedding FAQ), `privacy.astro`

**New church pages (Astro, composed from section components, strong inline content)**
- `src/pages/worship.astro`, `what-we-believe.astro`, `music.astro`, `pastor-staff.astro`, `grow.astro`, `serve.astro`, `kids.astro`, `food.astro`, `use-our-space.astro`, `weddings.astro`, `give.astro`

**Seed + voice**
- Rewrite `scripts/seed-core.mjs` for church singletons (turnkey Sanity)
- Fill `docs/brand/voice.md`

---

## Phases & tasks

### Phase 1 — Identity + design seam
- [ ] Install fonts: `npm install @fontsource/instrument-serif @fontsource-variable/newsreader`
- [ ] Edit `src/data/site.ts`: name/studio "Second Presbyterian Church of Chicago", domain secondpreschicago.org, url, storageKeyPrefix "secondpres", themeStorageKey, brandColors mirror (primary #8A6A43, accent #36302A, bg #ECE4DA, etc.)
- [ ] Edit `globals.css`: swap font @imports, `@theme` palette + font tokens, `:root` + `.dark` shadcn values + `--tint-rgb`, heading weight 400, print string.
- [ ] `npm run build` → expect PASS. Screenshot home light+dark to confirm reskin.

### Phase 2 — Nav, footer, JSON-LD, disable services
- [ ] Rewrite `Header.astro` `NAV_ITEMS` to church groups + CTA "Plan a Visit".
- [ ] Rewrite `Footer.astro` columns for church; drop Services/Portfolio/tools.
- [ ] Read `BaseLayout.astro` + `src/lib/schemas.ts`; add PlaceOfWorship/Church JSON-LD with address, phone, service time, denomination.
- [ ] Disable services: redirect `services.astro` to `/` (or delete + remove links); unregister `service`/`servicesPage` in `index.ts` + `structure.ts`.
- [ ] `npm run build` → PASS.

### Phase 3 — Home page
- [ ] Rewrite `index.astro`: Hero (church exterior photo placeholder, "Serving and celebrating Jesus for the good of the world.", CTAs "Plan a Visit" `/worship` + "Watch Live" external/`/worship`); Welcome ("The Church of the Angels in Chicago's South Loop"); Worship-times card (Sundays 11am); Get Involved preview; Events preview (latest from events collection); Food ministry highlight; Give CTA; Final CTA. Remove services grid + process preview + testimonials (or repurpose). Verify dual-theme/dual-viewport screenshots.

### Phase 4 — Core church identity pages
- [ ] `worship.astro` — times, what to expect, communion (1st Sunday), kids welcome, livestream, bulletin.
- [ ] `about.astro` — church story + National Historic Landmark history (1901 Arts & Crafts sanctuary, nine Tiffany windows, murals), values, link to beliefs + staff.
- [ ] `what-we-believe.astro` — beliefs (humanity/God/gospel), PCUSA Reformed, core values (inclusive, neighborhood, worship, welcome).
- [ ] `music.astro` — quartette choir history, 1917 Austin organ opus 767, musical life.
- [ ] `pastor-staff.astro` — 4 staff with full bios (Chesna Hinkley, Judy Landt, Michael Shawgo, Ashley McLean) from inventory.
- [ ] `contact.astro` — address, phone, email, office hours, Web3Forms, map/directions, Cullerton food door note.

### Phase 5 — Get Involved + practical pages
- [ ] `grow.astro` — Community Groups (Mid-Morning Bible Study, Theology on Tap, Alpha to Omega, Book Group).
- [ ] `serve.astro` — best-practice serve/outreach content (replace "Coming Soon"; tie to Food ministry + Care for Friends + Block Fest).
- [ ] `kids.astro` — best-practice children/families content (replace "Coming Soon"; reference kids welcome in worship, cry room).
- [ ] `food.astro` — Lunch Bag + South Loop Community Table, Cullerton door, Care for Friends, give-to-support CTAs.
- [ ] `use-our-space.astro` — venue rental, uses, location, inquiry form/contact.
- [ ] `weddings.astro` — overview, FAQ, pricing ($1,500 / $500 / $250 / $250), capacity 600, contact.
- [ ] `give.astro` — tithes/offerings, Vanco link, ways to give, designated funds (Lunch Bag, SLCT).

### Phase 6 — Events module
- [ ] Author `modules/events/studio/event.ts` (title, slug, start/end datetime, allDay?, recurrence label, location, description PortableText, category, featured, registrationUrl, image, orderRank) modeled on `project.ts`.
- [ ] Author `modules/events/studio/eventsPage.ts` (singleton: seo + hero).
- [ ] Author `modules/events/src/pages/events/index.astro` (upcoming list grouped recurring vs one-time; empty state) modeled on portfolio index + content-inventory event list.
- [ ] Author `modules/events/src/pages/events/[slug].astro` (detail) modeled on journal/[slug].
- [ ] Author `modules/events/seed.mjs` + `docs/modules/events.md`.
- [ ] ENABLE: copy schemas → studio/schemaTypes/, register index.ts + structure.ts (+ CalendarIcon), copy pages → src/pages/events/, add `getEventsPage`/`getAllEvents`/`getEventBySlug`/`getAllEventSlugs` to queries.ts.
- [ ] `npm run typegen` + `npm run build` → PASS; `/events` + `/events/[slug]` render.

### Phase 7 — FAQ, privacy, voice
- [ ] `faq.astro` — seed church FAQs (visiting, weddings, giving, kids, parking) via fallback + categoryOrder.
- [ ] `privacy.astro` — church-appropriate privacy copy.
- [ ] Fill `docs/brand/voice.md` — warm, welcoming, plain, scripture-literate; no em-dashes; banned AI-tells.

### Phase 8 — Seed (turnkey Sanity)
- [ ] Rewrite `scripts/seed-core.mjs` church content for siteSettings, homePage, aboutPage, faqPage+faqItems, contactPage, privacyPage, notFoundPage, studioGuide/Notes/Playbook (church-flavored). Drop services/testimonials/philosophy or repurpose. Add events seed.

### Phase 9 — Verify
- [ ] `npm run build` clean. Dev server + Playwright: every route, light+dark, ~375px + ~1280px. Lighthouse on Home, Worship, Give. Fix regressions. Confirm no em-dashes in site copy.

---

## Self-review checklist
- Spec coverage: every inventory page maps to a task (home, worship, staff+4 bios, beliefs, music, grow, serve, kids, events, food, use-our-space, weddings, give, about, contact, faq). ✓
- Events module mirrors portfolio's 7-step enable. ✓
- Services removed from nav + Studio + routing + home + footer. ✓
- Reskin token values specified exactly; AA verification step included. ✓
- Fonts: both serifs, exact @fontsource imports + family names. ✓
- No em-dashes in any authored site copy (internal docs/plans exempt). 
- Open risk: new church pages are static (not Sanity-backed singletons) except where they map to existing singletons; events + core singletons are CMS-editable. Documented as a tradeoff for scope.
