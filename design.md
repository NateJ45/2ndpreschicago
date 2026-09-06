# Design Brief — Second Presbyterian Church of Chicago

The one-file design system reference. Attach this (plus screenshots) when asking
any AI agent or designer for visual work on this site. Deeper rationale lives in
`docs/remodel/design-direction.md` (the decision record) and `docs/agent/`
(theme-and-color, design-tokens, polish-layer, animation). Tokens are declared
in `src/styles/globals.css` and that file is the source of truth; if this brief
and the CSS ever disagree, the CSS wins. Last synced: 2026-06-11.

## Essence

A 1901 Arts and Crafts National Historic Landmark ("The Church of the Angels,"
nine Tiffany windows) with a warm, plain-spoken congregation. The design language
is **warm editorial paper + liturgical color**: cream paper surfaces, espresso
ink, bronze interactions, and a deep Tiffany-glass green ("chapel") as the
structural counterpoint. It should feel like a beautifully printed parish
booklet, not a SaaS template. Polish and elevate this direction; never swap it.

**The signature moves** (use them, don't dilute them):
1. **Arch-top images** (`.arch-top`, `.arch-top-sm`) — the Romanesque crown on
   hero/feature/staff photos. One shared radius token (`--arch-radius`).
2. **Chapel-green structural bands** — utility bar, footer, closing CTA, quote
   band. Always `bg-chapel`/`bg-chapel-deep` with cream `text-chapel-foreground`,
   in BOTH themes (static, intentionally not theme-flipped).
3. **Keyword emphasis** — one word/phrase of a display headline in a second
   color. On cream: `text-chapel-ink` (home hero). On photo-scrim heroes:
   lifted gold `#C7A875` via the `heroKeyword` Sanity field + Hero.astro's
   `keyword` prop. One flourish per headline, never stacked with the script
   accent or rotator.
4. **Serif everything** — Instrument Serif display, Newsreader body. No sans.
5. **Arch ornament** (`ArchOrnament.astro`) — a triple Romanesque arch in gold
   stroke; the page-close mark in FinalCta and at most one reflective moment
   per page. Keep it scarce so it stays a signature.

## Palette

| Token (utility) | Light | Dark | Role |
|---|---|---|---|
| `bg-background` | `#ECE4DA` Paper | `#1C1813` | page surface |
| `text-foreground` | `#36302A` Espresso | `#ECE4DA` | body text |
| `bg-card` / `bg-popover` | `#FBF8F2` | `#262019` | raised surfaces |
| `bg-muted` | `#F1EBE0` | `#262019` | quiet alt bands |
| `bg-primary` (static) | `#8A6A43` Bronze | same | CTA pills (white text) |
| `text-link` | `#6B4F2E` | `#D8BD8C` | inline links, bronze text |
| `bg-chapel` (static) | `#1E423B` Tiffany green | same | structural bands |
| `bg-chapel-deep` (static) | `#16322C` | same | footer/CTA deepest base |
| `text-chapel-foreground` | `#F1EAD9` cream | same | text on chapel |
| `text-chapel-ink` | `#1E423B` | `#6FA99A` | keyword emphasis on page bg |
| `text-gold` / `bg-gold` (static) | `#A07D45` | (dark ref `#C7A875` via `--primary`) | hairline rules, small accents |
| `border-border-soft` | `#DED6C8` | — | faint warm dividers |

Contrast guardrails that already bit once: eyebrows on light surfaces need
`text-foreground/80`+ (`/65` fails AA); white-on-`bg-primary` is for
semibold-small or large text; cream-on-chapel is ~9:1, always safe.

## Type

- Display: **Instrument Serif 400** (+ italic) via `font-display`. Headings are
  weight 400, `letter-spacing: -0.01em`, `line-height: 1.1` (heroes:
  `leading-headline-tight` = 1.05).
- Body: **Newsreader Variable** via the default `font-body` on `html`.
- Fluid scale tokens: `text-h1` clamp(2.5–5rem) … `text-h6` 1rem. Hero h1 uses
  `text-h1`; section headlines `text-h2`; card titles `text-h4`/`h5`.
- Eyebrows: uppercase, `tracking-eyebrow` (0.18em), small size, muted color
  (`text-foreground/80` on light; on chapel use `text-chapel-foreground/80`).
- Italic display is the approved "moment" device (epigraphs, blockquotes,
  hero accent words). The calligraphic `font-script` accent is OFF by default.

## Space + layout

- Fluid spacing tokens: `xs s m l` + `section-md` clamp(3–5rem) +
  `section-lg` clamp(4–7rem). Sections use `py-section-lg` (or `-md` for
  compact bands). Content max width: `max-w-content` (82.5rem).
- Rhythm rule from the design direction: alternate cream / soft-paper / chapel
  bands and alternate image side so pages read as composed sections, not a
  uniform stack. Asymmetry is on-brand; chaos is not.
- Mobile first reality: most visitors are at ~375px. Anything new must be
  checked there before desktop.

## Motion (restrained, CSS-only)

Defaults: 440ms `cubic-bezier(0.16,1,0.3,1)` on all interactive elements.
Idioms (all in globals.css, all honor `prefers-reduced-motion`):
`[data-reveal]` scroll reveal (+`is-visible`), `[data-stagger-grid]` card
stagger, `.card-lift` hover, `.press-tactile` CTA press, `.img-zoom`/`.img-tint`
photo hover, `.hero-entry-stagger` load-in, hero Ken Burns, `.nav-underline` /
`.link-underline`, View Transitions cross-fade. Do not add JS-driven animation;
do not exceed these durations; performance (Lighthouse 100s) is defended.

## Component idioms

- Buttons: pill (`rounded-full`), uppercase tracked label. Primary = bronze fill
  + white text; secondary = outline. Always `.press-tactile`.
- Cards: `bg-card`, soft border, `.card-lift`, optional arch-top image, generous
  padding. Title serif, meta as eyebrow.
- Photos: through `SanityImage.astro` (Sanity) or Astro `<Image>` (local). Hero
  and feature photos take `.arch-top`; headshots/cards `.arch-top-sm`.
- Section heading pattern: eyebrow + serif headline (optional keyword span) +
  optional lede. Use `SectionHeading.astro`.
- Paper grain (`body::before`) sits over everything at 4%; large flat fills are
  fine, they won't look dead.

## Hard rules for any visual change

1. Verify in BOTH themes and BOTH viewports (375 / 1280) before calling it done
   (`/visual-verify`; remember the `[data-reveal]` blank-screenshot gotcha).
2. No new fonts, no new dependencies, no client-side JS for decoration.
3. Desktop nav stays server-rendered; Lenis + reveal observers stay.
4. No em-dashes in visitor-facing copy. Voice rules: `docs/brand/voice.md`.
5. Defend Lighthouse 100/100/100/100 and zero CLS (animate transform/opacity
   only; never height/top).
6. Content comes from Sanity. Don't bake copy into components; wire a field
   with an inline fallback (see CLAUDE.md content model).
