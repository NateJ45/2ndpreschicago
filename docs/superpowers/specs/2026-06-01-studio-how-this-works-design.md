# Studio "How This Works" — in-Studio help guides (design)

Date: 2026-06-01. Branch: `feature/church-cms`.

## Goal
A built-in, always-available help center inside Sanity Studio that teaches non-technical
church staff, in plain English, how to run the site: post events, set special and seasonal
service times, put up announcement banners, manage FAQs and sermons, edit a page's words and
photos, build new pages, add and arrange sections, work with photos, understand the brand
system, and know when to do something themselves vs. ask Nathan.

## Audience
The church secretary / pastor. Assume no web or tech background. Task-first, every term
defined inline, warm and encouraging, no fear.

## Key decisions
- **Repo-based, not dataset documents.** Guides live in `studio/` code: version-controlled,
  locked (staff cannot edit or delete them), and they travel automatically with the reusable
  template to every future client site. Updates ship via `npm run studio:deploy`.
- **Placement:** a pinned "How This Works" section at the **top** of the desk structure
  (above Site Settings). Each guide is a navigable item that opens a custom read-only pane.
- **No schema change** — no `typegen`, no effect on the Astro site or the dataset. Studio only,
  so it is low-risk.
- **Church-specific content** (Nathan's email, worship time, any church URLs) is isolated in a
  single `CHURCH` constant for trivial per-client swapping.

## Architecture (3 files in `studio/`)
- `studio/guides/content.tsx` — guide data: an ordered array of
  `{ slug, title, icon, lead, diy, body[] }`. `body` uses a small declarative block vocabulary
  (`h`, `p`, `steps`, `bullets`, `path`, `callout`, `seealso`) with inline `**bold**`. Plus the
  `CHURCH` constant. No JSX authoring required to edit copy.
- `studio/components/GuideView.tsx` — renders one guide (looked up by `props.options.guideSlug`)
  with `@sanity/ui` (Card / Stack / Heading / Text / Badge / Flex). Read-only, scrollable, themed
  to the Paper-and-Ink Studio.
- `studio/structure.ts` — a pinned "How This Works" list (BookIcon) at the desk top; one
  `S.listItem(...).child(S.component(GuideView).options({ guideSlug }))` per guide.

## Guides (12)
Getting oriented
1. Start here: how it all works (Studio vs. site, edit → preview → publish, "nothing is live
   until you publish", a short "words you'll see" mini-glossary)

The everyday jobs
2. Post or edit an event
3. Special & seasonal service times (Christmas Eve, Holy Week, Easter)
4. Announcement banners
5. Add or edit an FAQ
6. Sermons & the livestream link
7. Edit a page's words & photos (incl. the "empty box = built-in wording" fallback rule)

Building & layout
8. Build a brand-new page (Custom Pages)
9. Add & arrange sections (the block library + the background control)
10. Photos & images (focal point / hotspot, alt text, sizes, the Media library)

Brand & boundaries
11. The brand: colors & fonts (tones not hex, the script-accent word, what you can/can't change)
12. Do it yourself vs. call Nathan (the safety guide)

## Content / voice rules
- Plain English; define any term inline; warm, encouraging, no fear.
- No em-dashes (house style).
- Each guide: lead line → a green "You can do this yourself" or amber "Check with Nathan"
  badge → a "Where in Studio" path → short numbered steps → tip / caution callouts.
- Accurate to THIS Studio's real fields and flows (events, announcements, faqItem, the page
  singletons' empty-field fallback, the `flexibleSections` block list, the background control,
  Custom Pages, Media / hotspot / alt text).

## Do-it-yourself vs. call-Nathan boundary
- **Do yourself (safe):** text edits, swapping photos, events, sermons, FAQs, announcements,
  worship resources, adding / reordering / removing sections, building Custom Pages, section
  background tones and images, service times and seasonal heroes, form success messages.
- **Call Nathan:** changing the top nav or footer links, needing a new kind of field or section,
  redirects / domain / email / DNS, embedding a new outside tool, the *What We Believe* wording
  (leadership-owned), anything showing an error or that looks like code — and the one hard rule:
  **never click "Remove field"** (it erases that field on every document).
- **Reach Nathan:** nathan@nixoncreativestudio.com.

## Verification
Deploy the Studio; screenshot each guide pane; confirm the nav placement, rendering, and
readability; iterate. No Astro build needed (Studio only); the deploy build doubles as a
typecheck.

## Out of scope
Live-editable guide documents; a website-facing `/help` page; printable export; per-field
contextual help (already handled by schema `description`s).
