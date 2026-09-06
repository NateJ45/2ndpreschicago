# Highland Park Presbyterian (hppres.org) — Emulation Study, 2026-06-11

Follow-up to `church-website-audit.md` (2026-05-31), which named HPP the gold
standard. That audit's priority gaps have since been closed (sermons module,
worship/visit page, This Sunday module, inclusive band, newsletter). This pass
re-studied the live site page by page (home, /sundays, /sermons) and recorded
what we adopted, what we deliberately did not, and what is parked pending
client content.

## What their site does (fresh observations)

**Home.** Utility row (Live · Events · Give · search) over a five-item nav
(I'm New · Ministries · Who We Are · Sermons · Sundays). Serif hero ("Helping
You Find & Follow Jesus") with two pills. Worship-times band lists every
gathering by style/time/location. Then: photo carousel of ministry moments,
a testimonial/stories grid, a 3-card next-step module, latest-message card,
twelve event cards with category tags, and a four-column footer (institutional /
member resources / family of churches / extended ministries).

**/sundays (visit page).** Concrete first-visit logistics: address, underground
garage + shuttle ("Wave at the driver"), four campus maps, nursery-to-high-school
programming, Mother's Rooms, wheelchair seating by service, hearing-assist packs
with T-coil, usher help. Newcomer follow-up: "Let's Connect" form, Coffee With a
Pastor, Alpha, Becoming HP Pres. Notably absent even on the gold standard: what
to wear and service length (we cover both).

**/sermons.** Featured latest message as a hero card (series artwork +
play overlay + title/speaker/date). Archive organized by SERIES as grid cards
("Discovering Joy", 6 sermons), then chronological cards. Apple Podcasts +
Spotify buttons. "Watch Live on Sundays" CTA. Load-more pagination.

**Polish details.** A stained-glass candle illustration used as an ornamental
divider; texture overlays between sections; category tag chips on event cards;
1920x1080 series artwork at a consistent ratio.

## Adopted (this session)

1. **Keyword color emphasis on interior heroes** — their "Find & Follow"
   second-color device, already on our home hero, extended to every interior
   page: `heroKeyword` field on all page singletons (factory + about/faq/
   contact/events/sermons), rendered by Hero.astro in lifted gold (#C7A875)
   on the photo scrim. Seeded on 12 pages (verified against live headlines;
   `scripts/seed-hero-keywords.mjs`).
2. **Ornamental divider** — their stained-glass candle, translated into our
   architectural vocabulary: `ArchOrnament.astro`, a triple Romanesque arch in
   gold stroke (the same curve as `.arch-top`). Placed in the FinalCta closing
   band (every page) and above the worship reflection quote. Deliberately
   sparing so it stays a signature.
3. **Sermons hub pattern** — featured-message card now renders a designed
   chapel-green typographic panel (arch mark + scripture/series in italic
   display) when a sermon has no artwork, instead of a blank gray slab;
   Apple Podcasts / Spotify pills render beside Watch Live when the new
   `sermonsPage.podcastAppleUrl` / `podcastSpotifyUrl` fields are set
   (hidden until the church has feeds).
4. **Never-lonely grids** — their events grid is always full; ours now adapts:
   a single upcoming event (or single special service) renders as a centered
   feature at readable width instead of one card in a half-empty 2-column grid.

## Considered and deliberately NOT adopted

- **Site search** (their utility row): needs a search dependency (e.g.
  pagefind); new dependencies require a confirmation pause per CLAUDE.md.
  Recommend: revisit if the content volume grows past ~50 pages.
- **Multi-gathering worship-times table**: we are a single-service congregation;
  our service band already states the one gathering. Copying the table would
  add structure without information.
- **Series-grid sermon archive**: correct at their volume (hundreds of
  sermons), premature at ours (2 placeholder sermons). The `series` field
  already exists; revisit when the archive has ~12+ sermons.
- **Sticky/condensed nav on scroll**: we already have hide-on-scroll-down /
  reveal-on-scroll-up, which serves the same goal more politely.

## Parked: needs client content (do not fabricate)

- Stories/testimonial grid (needs real congregant quotes + photos).
- People-forward photo carousel (needs the photography set).
- Visit-page specifics we cannot claim without confirmation: shuttle, hearing
  assistance, Mother's Room, campus maps. The plan-cards have editable Sanity
  fields ready whenever the office confirms details.
- "Coffee with a pastor" style newcomer program (a program decision, not a
  website feature).
- Podcast feeds for the new Apple/Spotify buttons (fields exist, hidden until
  URLs are provided).
