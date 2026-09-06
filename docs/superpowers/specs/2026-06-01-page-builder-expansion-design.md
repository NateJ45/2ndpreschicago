# Page Builder Expansion — Design Spec

Date: 2026-06-01. Builds on the church CMS (`docs/church-cms-summary.md`). Branch: `feature/church-cms`.

**Goal:** a complete, self-service page builder so a non-technical admin (Chesna or anyone) can build or restyle any page entirely in Sanity, no designer required for ordinary changes. Add / remove / reorder fully-styled, on-brand sections (galleries, stats, FAQs, rich cards, media, etc.), and control each section's background (a design-token color, or an image/video with a readable overlay).

## Research: section types church sites use (and we still lack)

From peer Presbyterian/church sites (prior audit in `docs/research/church-website-audit.md`) plus current church web-builder patterns (Tithely, Subsplash, Squarespace church templates, Nucleus, REACHRIGHT). Modern church aesthetic: muted palette, generous whitespace, large imagery, optional video hero, clear repeated CTAs (Plan a Visit / Watch / Give).

Common blocks, mapped to what we have:
- Hero image/video — have (page heroes)
- Rich text, image+text, basic cards, quote, CTA band, form, embed — have (Phase 4)
- **Stats / animated numbers** — MISSING (StatsCounter island exists, unused in builder)
- **Photo gallery (grid + lightbox)** — MISSING (react-photo-album + yet-another-react-lightbox are deps)
- **FAQ accordion** — MISSING as a block (FaqAccordion / ui/accordion exist)
- **Detailed feature cards** (image/icon + eyebrow + title + body + link + badge) — basic cardGrid only
- **Logos / partners strip** (PCUSA, Care for Friends, food partners) — MISSING
- **Media feature** (YouTube/Vimeo/file video or large image + text) — MISSING
- **Steps** ("Plan a visit" 1-2-3) — MISSING
- **Testimonial / quote slider** — single quote only
- **Dynamic list** (latest sermons / upcoming events / ministries / staff / worship resources) — MISSING (was in the original CMS spec)

## Cross-cutting: background & media system

A shared `sectionBackground` object available on every block, rendered by a new `SectionShell.astro` wrapper that `Sections.astro` wraps around each block:

- `tone` (token color, stays in the design system): `default` (paper, bg-background), `warm` (bg-muted + surface-warm), `chapel` (bg-chapel, cream text), `chapelDeep` (bg-chapel-deep, cream text). Text color auto-adapts (cream on chapel tones).
- `media` (optional): an `image` OR a `video` (mp4/webm file or URL) behind the section. With `overlayOpacity` (0-90, default ~55) a dark scrim sits over it so text stays readable; over media, text is forced to a readable light color. Reuses the Hero/FinalCta darken pattern (no new color outside tokens; the scrim is black/chapel-deep at opacity).
- `padding` (optional): `normal` | `compact` | `spacious`.

Accessibility: when media is set, the overlay guarantees contrast; alt text required on images; videos are muted, loop, playsinline, with `poster` and reduced-motion fallback to the poster image.

`SectionShell` is the single place that renders background tone/media/overlay and sets the readable text color, so every block (existing + new) gets backgrounds for free.

## Expanded block library

Each block: a schema object in `studio/schemaTypes/blocks.ts` (added to `FLEXIBLE_SECTION_MEMBERS`), a component in `src/components/blocks/`, mapped in `Sections.astro`, wrapped in `SectionShell`. All carry the shared `sectionBackground`.

1. **gallery** — images[] (image + alt + caption), `columns` (2/3/4), `lightbox` (bool). Grid via react-photo-album; lightbox via yet-another-react-lightbox island. Solves "change a single photo to a photo gallery."
2. **stats** — items[] {value, label, note?}, `columns` (2/3/4). Animated count-up via StatsCounter when numeric; static otherwise.
3. **accordion** — heading?, intro?, items[] {question, answer (Portable Text)}. Reuses the customized `ui/accordion` (FaqAccordion). Solves "detailed FAQs."
4. **featureCards** — heading?, intro?, columns, cards[] {image?/icon?, eyebrow?, title, body, badge?, ctaLabel?, ctaUrl?}, `arched` image option. Solves "detailed cards."
5. **logos** — heading?, items[] {image, alt, url?}, `grayscale` (bool). Partner/affiliation strip.
6. **mediaFeature** — eyebrow?, heading?, body (PT), `media` (videoUrl OR image), side (left/right), ctaLabel/ctaUrl. For a welcome video or sermon highlight.
7. **steps** — heading?, intro?, steps[] {title, body}, numbered. "Plan a visit" pattern.
8. **dynamicList** — `source` (latestSermons | upcomingEvents | ministries | staff | worshipResources), `count`, heading?. Pulls live content into any page.

(quote, ctaBand, richText, imageText, cardGrid, formRef, embed stay; cardGrid remains for simple use, featureCards for rich.)

## Finish the body-copy conversion
The remaining hardcoded prose is the per-page `<FinalCta>` closing copy (grow/serve/what-we-believe already converted). Make each page's FinalCta eyebrow/headline/subhead editable. (FAQ items should also move from the hardcoded array in `faq.astro` into the `faqItem` collection; pastor-staff is already collection-driven.)

## Build order
1. **SectionShell + `sectionBackground` object**; retrofit `Sections.astro` so existing blocks gain backgrounds.
2. **New blocks** in priority order: gallery, stats, accordion, featureCards, logos, mediaFeature, steps, dynamicList.
3. **Finish FinalCta conversion.**
Each step: schema -> `npm run typegen` -> render -> `npm run build` -> `npm run studio:deploy` -> commit. Verify the new blocks end-to-end with a temporary sample page (build + Playwright screenshot), then remove it.

## Out of scope
Bespoke one-off page templates beyond the generic `page` type; e-commerce; heavy custom animation beyond the existing motion/Lenis layer; a visual drag-and-drop canvas (Sanity array reorder is the reorder UI).

## Sources
- prior audit: `docs/research/church-website-audit.md`
- Tithely "Best Church Websites 2026"; Colorlib church templates; Nucleus "Church Website Homepage Formula"; REACHRIGHT best church websites; sitebuilderreport church/Squarespace church examples.
