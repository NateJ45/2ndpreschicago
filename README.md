# Second Presbyterian Church of Chicago

The website for **Second Presbyterian Church of Chicago**, the "Church of the Angels," a historic and inclusive Reformed congregation (PCUSA) in the South Loop. Built on Astro + Sanity + Cloudflare Workers, migrated from Squarespace.

**Live:** [secondpreschicago.org](https://www.secondpreschicago.org)

---

## The brief

Second Presbyterian is a National Historic Landmark: a sanctuary of Tiffany glass and painted angels, and a congregation that feeds its neighborhood and welcomes everyone. The site had to carry that weight (history, beauty, a serious worship life) while doing the plain work a church website has to do: help a newcomer plan a first visit, get sermons in front of people, and let the office keep everything current without a developer.

## The work

**A visitor-first front door.** The "I'm New / Plan a Visit" page answers the questions a first-timer actually has: service time, what to expect, parking, kids, accessibility. The one canonical service time is set once and flows to the header, footer, home page, and Google's structured data together, so it can never disagree with itself.

**The building gets its due.** The story of the congregation and the landmark sanctuary, the quartette choir and the 1917 Austin organ, all get real pages instead of a buried paragraph, with a warm editorial design (Instrument Serif over Newsreader; cream, espresso, and bronze) that matches the room.

**The work of the church, online.** Sermons with a livestream call to action and an archive; an events calendar for recurring rhythms and one-time gatherings; the food ministry (the Lunch Bag program and the South Loop Community Table); online giving through Vanco; weddings and venue rental for the historic sanctuary, presented as a real offering with FAQ and pricing.

**Run by the office.** Every page, image, and detail lives in Sanity, so staff update the site themselves and it rebuilds.

## The result

A fast, accessible, editor-run site that looks like the place it represents, and that turns "I might visit that church" into a plan.

---

## Stack

- **Astro 6** (static output) + TypeScript strict mode
- **Sanity v5** headless CMS (schemas in `studio/schemaTypes/`)
- **Tailwind 4** via `@tailwindcss/vite` (brand tokens in `src/styles/globals.css`)
- **React 19** islands for interactivity; Astro components for everything static
- **Cloudflare Workers** hosting via `wrangler deploy`

Provenance: built on the reusable NCS Astro + Sanity church starter, which was archived on 2026-09-06. The live library of record for shared code is now [ncs-astro-sanity-starter](https://github.com/NateJ45/ncs-astro-sanity-starter); CI checks this repo's canonical files against it on every run. Migration inventory in `docs/migration/content-inventory.md`.

## Running it locally

```sh
npm install
npm run dev
```

---

Built by [Nixon Creative Studio](https://nixoncreativestudio.com).
