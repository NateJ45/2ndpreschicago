# Second Presbyterian Church of Chicago

The website for [Second Presbyterian Church of Chicago](https://www.secondpreschicago.org) (the "Church of the Angels"), a historic, inclusive Reformed congregation (PCUSA) in the South Loop. Built on Astro + Sanity + Cloudflare Workers, migrated from Squarespace.

Provenance: built on our reusable NCS Astro + Sanity starter. The migration inventory is in `docs/migration/content-inventory.md` and the build plan in `docs/superpowers/plans/2026-05-31-secondpres-church-build.md`.

---

## Stack

- **Astro 6** (static output) + TypeScript strict mode
- **Sanity v5** headless CMS (schemas in `studio/schemaTypes/`)
- **Tailwind 4** via `@tailwindcss/vite` (brand tokens in `src/styles/globals.css`, no `tailwind.config`)
- **React 19** islands for interactivity; Astro components for everything static
- **Cloudflare Workers** for hosting via `wrangler deploy`
- **Fonts:** Instrument Serif (display) + Newsreader (body). **Brand:** warm cream `#ECE4DA`, espresso `#36302A`, bronze `#8A6A43`.

---

## Routes

| Route | Description |
|---|---|
| `/` | Home (sanctuary hero, welcome, worship times, get-involved, events teaser) |
| `/worship` | Service time, what to expect, communion, kids, watch online |
| `/about` | The church's story + the landmark building |
| `/what-we-believe` | Beliefs, PCUSA identity, core values |
| `/music` | The quartette choir and the 1917 Austin organ |
| `/pastor-staff` | Pastors & staff bios |
| `/grow`, `/serve`, `/kids` | Get Involved: community groups, outreach, families |
| `/food` | Food ministry: Lunch Bag + South Loop Community Table |
| `/use-our-space` | Venue rental and space sharing |
| `/weddings` | Weddings in the historic sanctuary (FAQ + pricing) |
| `/give` | Online giving (Vanco), by mail, designated gifts |
| `/events`, `/events/[slug]` | Events calendar (recurring + one-time) |
| `/contact` | Contact details + map |
| `/faq` | Common visitor questions |
| `/privacy`, `/404` | Privacy policy, custom 404 |

Nav groups: **About Us** (Worship / What We Believe / Music / Pastors & Staff), **Get Involved** (Grow / Serve / Kids), **Events**, **Food**, **Space** (Use Our Space / Weddings / Friends of Historic Second Church), **Give**.

---

## How content works

Every page renders from inline content in `src/pages/*.astro` today, so the site is fully functional **with no Sanity project connected**. Sanity is an optional, turnkey upgrade:

- **Events** is a live Sanity collection (`event` + `eventsPage`), with a static fallback list of weekly rhythms so `/events` is never empty.
- `siteSettings`, `homePage`, `aboutPage`, `privacyPage`, and `notFoundPage` are read from Sanity when present, with inline fallbacks otherwise.

See `CLAUDE.md` for the Foundation-vs-Safe-to-edit taxonomy before changing anything structural.

---

## Local dev

```bash
npm install
npm --prefix studio install
npm run dev          # Astro dev server at localhost:4321
npm run studio:dev   # Sanity Studio at localhost:3333 (once a project is configured)
```

---

## Connect Sanity (optional, for editor-managed content)

1. Create a project at [sanity.io/manage](https://sanity.io/manage) and copy `.env.example` to `.env`, filling in `PUBLIC_SANITY_PROJECT_ID` + tokens.
2. Seed content:
   ```bash
   node scripts/seed-core.mjs        # siteSettings + about/privacy/404 + home SEO
   node modules/events/seed.mjs      # eventsPage + weekly rhythms + an example event
   ```
3. `npm run typegen` then `npm run studio:deploy`.

---

## Deploy

```bash
npm run build        # = typegen-free astro build; use build:full to also run typegen
npm run deploy       # = npm run build + wrangler deploy
```

After any Sanity schema change, run `npm run typegen` then `npm run studio:deploy`. See `CLAUDE.md` for the conventions and the gotchas that bite.

---

## Docs

| Path | What it covers |
|---|---|
| `CLAUDE.md` | Architecture, conventions, the rules that bite, Foundation taxonomy |
| `OPERATIONS.md` | Tactical playbook (deploy, patch content, audits) |
| `docs/migration/content-inventory.md` | Everything pulled from the old Squarespace site |
| `docs/brand/voice.md` | The church's voice and tone |
| `docs/modules/events.md` | The Events module enable guide |
| `docs/superpowers/plans/2026-05-31-secondpres-church-build.md` | The build plan |
