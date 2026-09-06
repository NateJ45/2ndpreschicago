# NCS Astro + Sanity Starter — CLAUDE.md

This is the always-loaded reference for the `secondpreschicago` codebase (built on the `ncs-astro-sanity-starter` template): the conventions and landmines an agent needs on every task. Deep detail for specific areas (theme, components, SEO, performance, Sanity, deployment) lives under `docs/agent/` and is read on demand. The topic index at the bottom is the map.

> **This repository is the live site for Second Presbyterian Church of Chicago**, built on the NCS starter and migrated from Squarespace. The architecture and conventions below still apply. Project specifics: the Services page is removed, an **Events** module is enabled, and **Sanity is the single source of truth for all site content** (see the callout below). See `README.md`, `docs/migration/content-inventory.md`, and the build plan under `docs/superpowers/plans/`.
>
> **Content model — Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, the nav menus, SEO titles/descriptions, the worship service time, contact details) is a Sanity field, and every field is populated, so Sanity Studio mirrors the live site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** that render only if a field is ever cleared; they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files** — a populated Sanity field overrides the inline string. Values that repeat are single-sourced: the worship time is `siteSettings.worshipService` (derived everywhere via `src/lib/serviceTime.ts`); identity / contact / social (church name, email, pastoral email, phone, address, office hours, socials, give/watch links) resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`), read by the header, footer, nav, JSON-LD, and every page. There is no hardcoded contact/social fallback in `src/data/site.ts` (those blocks were deleted), so an empty Sanity field renders blank or hides rather than showing a stand-in. Full map: `docs/agent/editor-vs-hardcoded.md`.

Companion tactical runbook: `OPERATIONS.md`. New-project setup entry point: `docs/bootstrap/NEW-PROJECT.md` (authored in a later phase — that runbook is the intended start for any team adapting this starter for a new client).

Project slash commands (in `.claude/commands/`): `/sanity-audit` (ground truth on the dataset: counts, gaps, drafts — run it before debugging any "content looks wrong" report), `/rebuild` (trigger the production rebuild that makes published Sanity content live), `/visual-verify` (the both-themes-both-viewports screenshot loop). The design system summary for visual work is `design.md` at the repo root.

---

## About this starter

`ncs-astro-sanity-starter` is a production-ready Astro + Sanity + Cloudflare Workers site template forked from a finished client build. The infrastructure — build pipeline, CMS integration, deploy hooks, polish layer, section-visibility system, component library, Lighthouse 100/100/100/100 baseline — is already standing. A new project pours in its own business identity and design: colors, fonts, logo, site copy, and Sanity content.

This starter is not a minimal scaffold. It ships with real patterns and real gotchas documented from production. The point is to skip the month of discovering them.

_Provenance: forked from the Reid Design build; adapted for Second Presbyterian Church of Chicago._

---

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro 6.3.x**, TypeScript strict, `output: 'static'`. Node 22.12+.
- **Sanity v6** is the CMS (schemas in `src/sanity/schemaTypes/`), embedded at `/studio` in THIS package. All editable content lives in Sanity. `npm run typegen` regenerates types from the schemas. Version topology and the pinning rules are gotchas #9 and #10 below.
- **Live preview** (PORTS.md cards 10, 11, 17, 28, 29): `presentationTool` in `sanity.config.ts` points at the SSR routes under `/preview/**`, which read DRAFT content with the runtime `SANITY_TOKEN`. Draft mode is handshaken through `/api/draft-mode/enable`.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `wrangler deploy`.
- **Web3Forms** contact form, **Calendly** discovery call, **Cloudflare Web Analytics** (cookieless, no banner).
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured — pages render empty-state content.

### The rules that bite if you forget them

1. **The Studio deploys with the site.** Since 2026-09-06 the canonical Studio is the embedded one at `/studio`: `astro build` bundles it, so a schema change reaches editors on the next deploy and cannot drift stale. Correct sequence after a schema edit: `npm run typegen`, commit the regenerated `src/lib/sanity.types.ts`, push.
   The hosted twin at `secondpreschicago.sanity.studio` is DEPRECATED and should be retired in sanity.io/manage. There is no `studio:deploy` script any more. If anyone does redeploy it while it still exists, it will show "unknown fields" next to a "Remove field" prompt whenever its schema is behind. **Never click "Remove field":** it deletes that field's data across every document and cannot be undone without a dataset restore.
2. **No em-dashes in public-facing site copy** (the text visitors read: page copy, component text, Sanity content). Use commas, colons, or restructure. Code comments, commit messages, plans, specs, and internal docs are exempt.
3. **Build in both light AND dark mode** on every UI change. Detail in `docs/agent/theme-and-color.md`.
4. **Desktop nav is server-rendered** in `Header.astro`. Do not regress it to a client-only island. Detail in `docs/agent/page-architecture.md`.
5. **The Lenis scroll reset on navigation** (forward goes to top, back/forward restores) lives in the BaseLayout Lenis init. Do not remove it. Detail in `docs/agent/polish-layer.md`.
6. **Content is statically built.** A Sanity edit only goes live after a rebuild (push to `main`, or the publish webhook). Detail in `docs/agent/deployment.md`.
7. **`npm run typegen` runs before `astro build`** as part of the build chain. `src/lib/sanity.types.ts` is committed so collaborators don't need to run typegen to see the schema types in code. Run it locally after any schema change.
8. **`@astrojs/cloudflare` is pinned to exactly `13.5.5`.** Version `13.6.0` regressed Astro's image optimizer: optimized images write to `dist/client/_astro/` while the optimizer reads from `dist/_astro/`. Do not bump the adapter version without doing a verifying build.
9. **The Studio lives in THIS package, and the one-instance invariant is now live** (folded 2026-09-06, PORTS.md card 10). There is one `package.json`, one lockfile and one `node_modules`. That is what keeps the styled-components / `@sanity/ui` theme context intact: two module instances means two React contexts, the ThemeProvider mounted by one is invisible to `useTheme` in the other, and the desk dies on its first custom-component render (styled-components error #18, then `Cannot read properties of undefined (reading 'v2')`) while the login screen, which is core code only, renders fine. That was presacademy's 2026-08-26 production outage. `astro.config.mjs` also carries `resolve.dedupe` as belt and braces.
   Verify after ANY Sanity dependency change, on disk rather than from the lockfile:
   `find node_modules -path "*@sanity/ui/package.json"` must print exactly ONE line, and the same for `styled-components` and `@sanity/client`.
   `@sanity/icons` is deliberately NOT deduped: sanity core and `@sanity/ui` want different majors, and icons are stateless SVG with no React context.
   A second, weaker check exists and its expected answer is TWO, not one: `grep -l "errors.md#" dist/client/_astro/*.js` lists the Studio chunk and the preview-overlay chunk. Those are two different documents (the Studio page, and the preview page inside its iframe), never one, so two copies is correct. mas-monograms shows the same two.
10. **This repo is the family's PHASE-2 PIONEER, and phase 2 has three teeth.** Everyone else is on phase 1 (`sanity` 6.9.1 / `@sanity/ui` 3.5.4). Here the set is `sanity` 6.12.0, `@sanity/ui` 4.0.7, `@sanity/astro` 3.5.1, `@sanity/visual-editing` 6.1.2, `@sanity/client` **8.5.0**, `@sanity/preview-url-secret` 4.1.5, `styled-components` 6.5.3, react 19.2.8, astro 7.3.1. Two `overrides` entries hold it together: `@sanity/visual-editing` (because `@sanity/astro` 3.5.1 asks for `^5.5.0` and would otherwise nest a second copy plus a second `@sanity/ui`) and `@sanity/client`.
    - **`sanity` 6.12 requires `@sanity/client` v8, and a v7 pin breaks the build in a way that reads like a bundler bug.** `sanity/lib/index.js` imports `isTimeoutError` from `@sanity/client`; v7 does not export it. With `@sanity/client` pinned at 7.27.0 the client build died with `[MISSING_EXPORT] "Vt" is not exported by node_modules/sanity/lib/datastores-*.js` and nothing in that message names `@sanity/client`. `npm ls @sanity/client` is what found it: 7.27.0 hoisted at the root, 8.5.0 nested under sanity, and Vite's `resolve.dedupe` forcing everything onto the wrong one. The fix is to pin v8 at the root AND add the override. Every repo that follows onto phase 2 will hit this the same way.
    - **`@sanity/ui` v4 renamed `space` to `gap`** on `Stack`, `Flex`, `Grid`, `Hotkeys` and `Select`, and typed the old prop as `never` rather than deleting it, so it surfaces as `Type 'number' is not assignable to type 'undefined'`. `Badge`'s `mode` prop is gone (`BadgeMode = never`). Both were invisible here until the fold, because `tsconfig.json` used to exclude `studio/` and the Studio was never type-checked.
    - **Components that moved to subpaths in v4** (`Menu`, `Toast`, `Tooltip`, `Popover`, `Autocomplete`, `Breadcrumbs`, `Code`) are not used here. `buildLegacyTheme` still works and is still what this Studio uses; it is deprecated but not removed, and it is light-only (the Studio's Dark appearance setting leaves panels white). Migrating to `@sanity/ui`'s `buildTheme` would buy a real dark Studio at the cost of the Bronze/Paper/Ink brand tinting. Not taken: the theme is the editors' familiar one.

---

## Build pipeline

`npm run build` is a chain:

1. `npm run typegen` runs `sanity typegen generate` against the schemas in `src/sanity/schemaTypes/`. Writes `src/lib/sanity.types.ts` so Astro queries get full type safety on Sanity responses. Runs before `astro build` so the types exist when the prerender worker imports them.
2. `astro build` runs as normal. Pages fetch content from Sanity at build time via the `sanityFetch` wrapper in `src/lib/sanity.ts`. When no Sanity project is configured, `sanityFetch` returns the provided fallback for every query, and the build still completes successfully with empty-state pages.

Standalone scripts:

- `npm run typegen` to regenerate Sanity TypeScript types after editing schemas (run this after any schema change before testing locally).
- `npm run og` to re-run `scripts/generate-og-default.mjs` and regenerate `public/og-default.png` (after changing brand colors, tagline, or the wordmark in the script's inputs block).
- `npm run studio:dev` (`sanity dev`) to run the Studio standalone on port 3333. The embedded one at `/studio` comes up with `npm run dev` like any other route.
- There is deliberately no `studio:build` script. `sanity build` writes to `./dist` and would clobber the Astro build; the Studio is built by `astro build`. A standalone bundle needs an explicit dir: `npx sanity build .studio-dist`.

`public/og-default.png` is committed to the repo because it is a real asset shipped to visitors. `src/lib/sanity.types.ts` is also committed so collaborators don't need to run typegen to see what the schemas look like in code.

### The build is HYBRID, and the deploy command changed (2026-09-06)

`output` is still `'static'` and every public page is still prerendered. What changed is that four route groups opt out with `export const prerender = false`: `/studio`'s shell is served as a static page but `/preview/**`, `/api/draft-mode/*` and `/preview/live` are SSR. So `astro build` emits **two** directories:

- `dist/client` — the prerendered site plus every asset. This is what Cloudflare serves from the asset store, what Playwright serves, what linkinator walks, and what Lighthouse audits.
- `dist/server` — the Worker bundle, plus `dist/server/wrangler.json`: the root `wrangler.jsonc` merged with the adapter's SSR routing.

**Deploy `dist/server/wrangler.json`, not `wrangler.jsonc`:**

```
npx wrangler deploy -c dist/server/wrangler.json
```

`npm run deploy` and `.github/workflows/deploy-staging.yml` already do. Deploying the root config directly ships a Worker with no SSR routes, so the static pages look fine and `/studio`, `/preview/**` and `/api/*` all 404. Note a fresh STATIC build emitted `dist/client/wrangler.json`; the hybrid build emits `dist/server/wrangler.json`. Check which one exists before wiring a new deploy command rather than assuming.

`wrangler.jsonc` also lost `assets.not_found_handling: "404-page"`. With it set, Cloudflare answers navigation requests (`Sec-Fetch-Mode: navigate`) that miss the asset store straight from the static 404 page **without invoking the Worker**, which silently 404s every SSR route for real browsers while `curl` (which sends no `Sec-Fetch` headers) sees them working. That broke presacademy's preview in production and hid from every command-line probe.

## Quality gates (family test standard, 2026-09-06)

The same gates every Astro site in the family runs; `docs/TESTING.md` maps which gate covers what. Before pushing:

- `npm run check` = `astro check && npm run lint`. The fast pre-push gate. `tsconfig.json` now excludes only `modules/`, so `astro check` covers the Studio config, schemas and custom components too (they are `src/sanity/**`).
- `npm run format:check` (prettier with the astro + tailwind plugins; `npm run format` fixes). `.prettierignore` lists what stays hand-formatted.
- `npm run test:unit` = the `node --test` suites in `src/lib/*.test.ts`.
- `npm test` = Playwright: smoke, axe in light and dark, a dark-mode focus-indicator check on the form routes, and reflow at 320/768/1024/1440. It builds the site and serves `dist/client` itself; `npx playwright test --project=chromium --workers=2` is the quick local loop, `npm run test:ui` the interactive one.
- `npm run check:links` after a build: linkinator over `dist/client`.
- `npm run check:full` is the older full sweep (typegen, build, unit tests).
- `npm run sync-check` diffs every file marked `PORTABLE: canonical copy` against `ncs-astro-sanity-starter`, the library of record. CI runs it as a hard gate against the starter's `main` (or its `staging`, for a staging build), so a canonical file must match the STARTER'S BRANCH, not a sibling site's working tree.

CI (`.github/workflows/ci.yml`) runs all of the above on every push to `main` and `staging` and on PRs; `lighthouse.yml` runs lhci against `lighthouserc.json` with accessibility as a hard gate. Push to `staging` first to see them green on the real runners.

**Gotcha: never put a `<script>` inside a template expression** (`{cond && (<script>...</script>)}`). prettier-plugin-astro hands the script body to the JSX parser and `format:check` fails. Render the script from its own component under the same condition instead: `HeroFillScript.astro`, `HeroRotatingWordScript.astro`, `HeroSlideshowScript.astro` and `ArchMediaScript.astro` are the pattern.

---

## Code conventions

- TypeScript strict mode. No `any`.
- Comment generously, especially in components that a future maintainer might edit by hand.
- At the top of each component file, add a header comment marking it `// Safe to edit by hand` or `// Foundation, edit with care`.
- Astro components for static content. React islands only where interactivity is required (lightbox, mobile nav, form handler, before/after slider, accordions).
- Prefer Astro's built-in `<Image />` and `<Picture />` components over plain `<img>` tags for any locally-bundled assets. For Sanity-hosted images, use the project's `<SanityImage />` wrapper (see image handling section).
- Tailwind utility classes inline. Pull into `@apply` only when a pattern repeats four or more times.
- Use `clsx` or `class-variance-authority` for conditional classes once components get state-dependent styling.

---

## Routes summary

Core routes that ship with the starter (always on, not toggleable):

| Path                 | Source                           | Notes                                                                  |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `/`                  | `src/pages/index.astro`          | Home page singleton from Sanity                                        |
| `/about`             | `src/pages/about.astro`          | About page singleton                                                   |
| `/faq`               | `src/pages/faq.astro`            | FAQ page + faqItem collection grouped by category                      |
| `/contact`           | `src/pages/contact.astro`        | Contact details + map (church build removed the Web3Forms form)        |
| `/events`            | `src/pages/events/index.astro`   | Events module: upcoming + recurring rhythms                            |
| `/events/[slug]`     | `src/pages/events/[slug].astro`  | Event detail                                                           |
| `/sermons`           | `src/pages/sermons/index.astro`  | Sermons module: featured + archive + livestream                        |
| `/sermons/[slug]`    | `src/pages/sermons/[slug].astro` | Sermon detail (embedded video)                                         |
| `/worship`           | `src/pages/worship.astro`        | The "I'm New / Plan a Visit" page (first-visit info)                   |
| `/journal`           | `src/pages/journal/index.astro`  | Post grid with category chips                                          |
| `/journal/[slug]`    | `src/pages/journal/[slug].astro` | Post detail: reading progress + header + cover + body + related        |
| `/privacy`           | `src/pages/privacy.astro`        | Privacy policy from singleton, with static fallback when doc is absent |
| `/studio`            | `@sanity/astro` (embedded)       | The Sanity Studio. Config is the repo-root `sanity.config.ts`          |
| `/preview/**`        | `src/pages/preview/`             | SSR draft preview for the Presentation tool. noindex, never in sitemap |
| `/api/draft-mode/*`  | `src/pages/api/draft-mode/`      | Draft-mode handshake (`enable` validates Sanity's one-time secret)     |
| `/sitemap-index.xml` | `@astrojs/sitemap` (auto)        | Production sitemap                                                     |
| `/404`               | `src/pages/404.astro`            | Custom 404                                                             |

Additional routes come from opt-in modules staged under `modules/`. Each module is documented under `docs/modules/`. Modules: `events` and `sermons` (both ENABLED on this site, see their docs in `docs/modules/`), `portfolio`, `process`, `newsletter`, `lead-magnets`, `style-quiz`, `budget-calculator`, `shop`, `e-design`, `gift-certificates`, `press`, `resources`.

---

## Safe to edit by hand

These are the files where a project maintainer can make changes without risk of breaking the underlying architecture:

- Inline **fallback** copy inside `src/pages/*.astro` — but note this is the safety-net default, NOT the live content. The live content is the (populated) Sanity field, which overrides it. Edit live copy in Studio; editing a fallback here only changes what shows if that field is ever cleared.
- `src/data/site.ts` — static identity constants (site name, domain, brand color mirrors for scripts, asset paths). Replace all placeholder values before launch.
- The design seam — files that define the visual identity of the project:
  - `src/styles/globals.css` `@theme` block: palette tokens (`--color-primary`, `--color-ink`, `--color-paper`, etc.), the `--tint-rgb` token (controls polish-layer tint color across card-lift, surface-warm, and branded overlays), and font-family tokens
  - Font imports at the top of `src/styles/globals.css` (swap `@fontsource/libre-baskerville` and `@fontsource-variable/inter` for a project's chosen fonts; update `--font-display` and `--font-body` tokens accordingly)
  - `src/data/site.ts` brand color mirrors and identity values
  - `public/favicon.png` + `public/apple-touch-icon.png` (the church mark; also overridable per-site via `siteSettings.favicon`), `public/og-default.png` (regenerate OG via `npm run og` after changing brand inputs in `scripts/generate-og-default.mjs`)
  - Logo files in `src/assets/` (imported by `Header.astro` / `Footer.astro` via `getImage()`)
- Images in `src/assets/` (logo variants, OG image)
- Copy strings and `href` values in static page components
- Tailwind utility classes on existing components when content needs different visual weight
- Brand colors, tagline, and wordmark inputs in `scripts/generate-og-default.mjs` (re-run `npm run og` after editing)

**Enabling the script accent (opt-in):** The calligraphic script accent is OFF by default. No script font loads unless you opt in. To enable it for a project: (1) add a `@fontsource` import for your chosen calligraphic face (e.g. `@fontsource/great-vibes/400.css`), and (2) update `--font-script` in the `@theme` block to name that face first. Components using the `font-script` utility class will then render the calligraphic accent.

## Foundation, edit with care (route through a planned session)

- `src/styles/globals.css` — the full file beyond the design seam tokens: shadcn `:root` / `.dark` overrides, **polish-layer utilities** (`.card-lift`, `.press-tactile`, `.nav-underline`, `.site-header`, `.reading-progress`, `.surface-warm`, `[data-reveal]`), base resets, paper-grain `body::before`, print stylesheet
- `src/sanity/schemaTypes/*.ts` — Sanity schemas. Changing fields can break existing content. See gotcha #1 above.
- `src/lib/sanity.ts` — Sanity client, `sanityFetch` wrapper, `urlFor`, `parseSanityAssetDimensions`. The `isSanityUnconfigured` guard and graceful-fallback behavior are load-bearing for fresh-clone builds.
- `src/lib/queries.ts`, `src/lib/sanity.types.ts` — GROQ queries and generated types
- `src/lib/scriptAccent.ts` — shared helper `splitScriptAccent(headline, accent)` used by `Hero.astro`, `SectionHeading.astro`, and `FinalCta.astro`
- `src/lib/sectionVisibility.ts` — `getSectionVisibility(raw)` converts the raw `siteSettings.sectionVisibility` Sanity object into a flat boolean map. Rule: `value !== false` (unset/null/true = visible; only explicit false = hidden). Every toggleable page imports this. See [Section visibility](docs/agent/page-architecture.md#section-visibility).
- `src/layouts/BaseLayout.astro` — anti-FOUC theme bootstrap, skip link, header/main/footer wiring, View Transitions ClientRouter, Lenis init, **scroll-reveal observer**, **sticky-header scroll listener**, Cloudflare Analytics, OG meta, JSON-LD, title-suffix-doubling guard
- `src/components/ui/` shadcn primitives — **note: `accordion.tsx` is customized** (removed `h-(--radix-accordion-content-height)` lock + dropped `text-sm font-medium` from trigger). If you reinstall via `npx shadcn add` it will revert; reapply the changes.
- React islands: `MobileNav.tsx`, `ThemeToggle.tsx`, `BackToTop.tsx`, `ContactForm.tsx`, `BeforeAfterSlider.tsx`, `FaqAccordion.tsx`, `CalendlyInline.tsx`, `StickyCTAChip.tsx`, `CopyEmailButton.tsx`, `PortableText.tsx`, `JournalPortableText.tsx`, `StatsCounter.tsx`, `NewsletterSignup.tsx`
- Astro wrappers: `SanityImage.astro`, `StructuredData.astro` (if present), `SectionHeading.astro`, `SectionDivider.astro`, `ServiceAreaCue.astro`, `ReadingProgress.astro`, `ProcessStepIllustration.astro`, `Hero.astro`, `HeroBackground.astro`, `FinalCta.astro`, `CtaLink.astro`, `StatsRow.astro`, `FeaturedWork.astro`, `FeaturedJournal.astro`, `PressStrip.astro`
- `scripts/generate-og-default.mjs`, `scripts/generate-og-pages.mjs`, `scripts/generate-llms-full.mjs`, `scripts/generate-logo-variants.mjs`, `scripts/optimize-logo-files.mjs`, `scripts/import-content.mjs` — reusable generator and import scripts
- `astro.config.mjs`, `wrangler.jsonc`, `package.json`, `tsconfig.json`, `components.json`
- `public/_headers` (security response headers shipped with the deploy)
- `public/robots.txt` (allow-all + sitemap reference)
- `public/llms.txt` (AI/LLM crawler index — update if major pages change)

**Modules:** files under `modules/` each contain the page, islands, and schema additions for an opt-in feature. Activate a module by following its own `README.md` (authored per module in `docs/modules/`). Do not edit module internals without reading its doc first.

If a change requires editing the foundation set, do it in a planned session, write the change deliberately, and update this doc when the architecture shifts.

---

## Visual verification workflow

Every UI change is verified visually before being reported done. The build that ships first-time-right is the one where the person who wrote the code saw it rendering correctly in every state that matters. This is a rule, not a habit.

### What to verify

For any change touching components, layouts, styles, or copy that affects layout:

1. **Both themes.** Light AND dark. Toggle in the running site via the header `ThemeToggle`, or use Chrome DevTools' "Emulate CSS prefers-color-scheme" while testing system mode. Light is primary, but dark must read as the brand, not as broken.
2. **Both viewports.** Mobile (~375px wide) and desktop (~1280px wide). Most visitors arrive on mobile. Never ship desktop-only.
3. **Interactive states.** Hover, focus (keyboard Tab), active. Test with mouse AND keyboard.
4. **Adjacent regressions.** Look at the sections immediately before and after the change. Cascading styles wreck neighbors more often than expected.

### How to verify

Use the Playwright MCP for screenshot-and-compare loops:

1. `npm run dev` (or hit the deployed URL for deployed changes)
2. Open the page via Playwright MCP at both viewports
3. Take screenshots, light and dark
4. Compare against the intent (spec, mockup, or prior screenshot)
5. If something's off, fix and re-screenshot. Don't ship a change you haven't seen rendered.

For accessibility-affecting changes, run Lighthouse on the changed page before opening a PR. Targets: 100/100/100/100 desktop. Defend them — when a score drops, find out why before merging.

For Sanity Studio testing (schema or structure changes), run `npm run studio:dev` and check the editor experience as a content editor would see it. The Studio is the editor's UI; broken Studio = broken editor workflow.

### When NOT to skip this

Even "tiny" changes — a color tweak, a spacing nudge, a copy edit — go through the same loop. The smallest changes are where regressions hide because no one looks at them.

---

## Working with Claude

- Use Claude Code from the desktop app, not the terminal. Show diffs clearly so they read well in that UI.
- Prefer Plan Mode for any multi-file change, especially when touching Sanity schemas (schema changes propagate to live content).
- Pause for confirmation before installing new dependencies.
- When proposing design changes, describe the visual outcome in plain language, not just the code.
- For browser-based verification, prefer the Playwright MCP. See the [Visual verification workflow](#visual-verification-workflow) section above for what to verify and when.
- For Sanity Studio testing, run `npm run studio:dev` and check the editor experience as a content editor would see it.
- Don't report a UI change as done without screenshots in both themes and both viewports.

---

## Communication style

These apply to everything written: code comments, PR descriptions, commit messages, and copy on the site itself.

- Warm, conversational tone. Not stiff or corporate.
- Step-by-step structure for any process or how-to.
- No em-dashes in public-facing site copy. Use commas, periods, colons, or restructure the sentence. This rule is scoped to site copy only: code comments, commit messages, plans, specs, and internal docs may use em-dashes.
- No AI-tell phrases: delve, navigate (as a verb), leverage, robust, seamless, meticulous, tapestry, realm, landscape, testament to, ever-evolving, crucial, pivotal.
- No AI-tell sentence patterns: "It's not just X, it's Y," "Not only... but also," "It's important to note that," "When it comes to," "In the realm of," "That said" or "With that being said" as transitions.
- Don't open replies with filler like "Certainly!", "Absolutely!", "Great question!", or "I'd be happy to help."
- Don't close replies with "I hope this helps!" or "Let me know if you have any questions." End on the actual content.
- Avoid three-item lists where the third item is filler. Two items is fine if two is the truth.
- Use bold for genuine emphasis or list labels only, never random nouns mid-sentence.
- Default to prose, not headers and bullets, unless content is genuinely a list or step-by-step.
- Comment code generously so future maintainers can follow without reverse-engineering.

### Site copy voice (for copy that appears on the live site)

The church's specific voice, tone, and banned words live in `docs/brand/voice.md` (read it before writing site copy). The general patterns below still apply.

1. **Say it plainly. Especially about money.** Don't apologize, don't pad, don't soften prices with hedging language.
2. **Sound like a smart friend, not a brochure.** No "transformative experiences" or "elevated living."
3. **Show the thinking, not the credentials.** Specific reasoning beats generic claims of expertise.
4. **Stop talking when you're done.** End the paragraph. Don't tack on a closing line that restates the point.
5. **Be specific.** Concrete details beat generic descriptors.

Banned vocabulary: "transformative," "curated experience," "investment in your space," "elevated living," "tailored solutions."

---

## Topic index

Read these on demand. They are NOT auto-loaded, and they are referenced as plain paths so they stay lazy. Open with the Read tool when a task touches the area.

**Note:** the `docs/agent/` deep-dives are being genericized in a later pass. Some may still contain client-specific examples until that pass completes. Trust the patterns; ignore client-specific nouns.

`docs/bootstrap/` and `docs/modules/` are forthcoming (authored in a later phase). `docs/bootstrap/NEW-PROJECT.md` will be the setup entry point for adapting this starter to a new project.

| Area                                                                          | Doc                                                                  |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Open patches + waiting-on-a-human queue (read early)**                      | `docs/PENDING.md`                                                    |
| **Which gate covers what**                                                    | `docs/TESTING.md`                                                    |
| **Design brief (one-file system: palette, type, motion, idioms, hard rules)** | `design.md` — attach it (plus screenshots) for any visual work       |
| Stack detail + astro.config landmines                                         | `docs/agent/stack-and-config.md`                                     |
| Page + section architecture, nav, visibility toggles                          | `docs/agent/page-architecture.md`                                    |
| Brand colors + theme system (light/dark discipline)                           | `docs/agent/theme-and-color.md`                                      |
| Polish layer (brand stripe, card-lift, scroll, Lenis, script accents)         | `docs/agent/polish-layer.md`                                         |
| Animation layer (Lenis, motion, scroll-reveal, script accent)                 | `docs/agent/animation.md`                                            |
| Typography + spacing tokens                                                   | `docs/agent/design-tokens.md`                                        |
| Component catalog + long-read layout                                          | `docs/agent/components.md`                                           |
| Error + empty states                                                          | `docs/agent/error-states.md`                                         |
| Image handling                                                                | `docs/agent/images.md`                                               |
| Accessibility                                                                 | `docs/agent/accessibility.md`                                        |
| SEO + JSON-LD                                                                 | `docs/agent/seo.md`                                                  |
| Performance budgets + Lighthouse                                              | `docs/agent/performance.md`                                          |
| Content data + Sanity integration                                             | `docs/agent/sanity.md`                                               |
| Deployment + env vars + rebuild model                                         | `docs/agent/deployment.md`                                           |
| Editor-driven vs hardcoded                                                    | `docs/agent/editor-vs-hardcoded.md`                                  |
| Change history                                                                | `docs/agent/changelog.md`                                            |
| New-project setup runbook + pre-launch checklist (forthcoming)                | `docs/bootstrap/NEW-PROJECT.md`, `docs/bootstrap/setup-checklist.md` |
| Per-module enable guides (forthcoming)                                        | `docs/modules/<module-name>.md`                                      |

---

_Structure: this file is the always-loaded constitution. Deep reference lives under `docs/agent/` (see the topic index above). Change history is in `docs/agent/changelog.md`._

See `OPERATIONS.md` for the tactical playbook (deploy, patch content, run audits, common gotchas).
