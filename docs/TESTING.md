# TESTING.md - what covers what

Created 2026-08-27 (PORTS.md card 15); brought up to the family test standard
2026-09-06 (WCP is the reference). A map of the gates, so nobody writes a
fourth suite that duplicates the second. Keep it current in the same commit that
adds or removes a gate.

## The gates

| Gate                 | Command                                       | Covers                                                                                                                                                                                                                                        | Does not cover                                                                                                                        |
| -------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Type check           | `npx astro check`                             | Every `.astro`, `.ts` and `.tsx` under the site. `tsconfig.json` excludes `studio/`, `modules/` and `dist`, so the Studio's own dependency tree is not type-checked with the root tooling (that was 900+ false errors).                       | The Studio, which type-checks in its own build below.                                                                                 |
| Lint                 | `npm run lint`                                | eslint over `src`, `scripts`, `tests` and `playwright.config.ts`.                                                                                                                                                                             | Formatting (below).                                                                                                                   |
| Format               | `npm run format:check`                        | prettier with the astro and tailwind plugins, family `.prettierrc`. `.prettierignore` lists what stays hand-formatted (generated files, the Studio, staged modules, the PORTABLE starter files, prose archives).                              | Files in `.prettierignore`.                                                                                                           |
| Fast pre-push        | `npm run check`                               | `astro check && npm run lint`.                                                                                                                                                                                                                | Everything below.                                                                                                                     |
| Unit tests           | `npm run test:unit`                           | Pure logic in `src/lib/*.test.ts` on Node's built-in runner: section visibility, slugify, utils, and the theme-token contrast pairs.                                                                                                          | Anything that needs a DOM or a network.                                                                                               |
| Type + schema check  | `npm run typegen`                             | Regenerates `studio/schema.json` and `src/lib/sanity.types.ts` from `studio/schemaTypes/`.                                                                                                                                                    | Whether the hosted Studio was redeployed (`npm run studio:deploy`).                                                                   |
| Build                | `npm run build`                               | That every route renders with the real content, and that Astro, Sharp and the adapter agree. Runs `prebuild` (`free-dist`) first.                                                                                                             | Runtime behavior in a browser.                                                                                                        |
| Studio build         | `npm --prefix studio run build`               | That the Studio compiles.                                                                                                                                                                                                                     | Studio **runtime** errors - schema mistakes pass the build and crash in the browser. Check `npm run studio:dev` after schema changes. |
| Internal links       | `npm run check:links` (after a build)         | linkinator over `dist/client`: every internal href and asset resolves. External URLs are skipped. The log must say "scanned N links" with N well above zero.                                                                                  | External link rot.                                                                                                                    |
| Browser suites       | `npm test`                                    | Playwright against a fresh build of `dist/client`: smoke (200 + title on every route), axe in light and in dark, a dark-mode focus-indicator check on the routes that carry a form, reflow at 320/768/1024/1440. Chromium + WebKit iPhone.    | Visual regression (no fixture-driven styleguide route here), CMS content correctness, anything behind a form submit.                  |
| Lighthouse           | `npx lhci autorun` (after a build)            | `lighthouserc.json`: one URL per template incl. 404. Accessibility is a hard gate (minScore 1); performance, best practices, SEO, LCP, CLS and byte weight are warnings or generous ceilings.                                                 | Field data; a real device.                                                                                                            |
| Older full sweep     | `npm run check:full`                          | typegen, build, studio build, unit tests in one go (the pre-standard `check`).                                                                                                                                                                | Browser suites, links, Lighthouse.                                                                                                    |
| Rendered-HTML parity | `npm run build` then `npm run parity compare` | That a change which is supposed to be render-neutral changed no rendered markup on any of the 30 routes.                                                                                                                                      | Intended markup changes: those need a fresh `npm run parity capture`, said out loud in the commit message.                            |
| Canonical-file drift | `npm run sync-check`                          | That this repo's copies of the shared family files still match `ncs-astro-sanity-starter`.                                                                                                                                                    | Files without the PORTABLE header, which includes `scripts/page-parity.mjs` (ported as a pattern on purpose).                         |
| CI                   | `.github/workflows/ci.yml`                    | On every push to `main`/`staging` and every PR: install, typegen + the stale-types guard, astro check, lint, format check, unit tests, build, Studio build, link check; and in a parallel job the Playwright suites with the report uploaded. | Deployment. `main` auto-deploys through Cloudflare Workers Builds; `staging` deploys via `deploy-staging.yml`.                        |
| Lighthouse CI        | `.github/workflows/lighthouse.yml`            | The Lighthouse gate above on every push to `main`/`staging` and every PR.                                                                                                                                                                     | Same as Lighthouse.                                                                                                                   |
| Uptime               | `.github/workflows/uptime.yml`                | Hourly, that five key live routes return 200. Inert until the `SITE_URL` repo variable is set - see `docs/PENDING.md`.                                                                                                                        | Anything below HTTP 200: content, layout, or a page that renders empty.                                                               |
| Backup               | `.github/workflows/sanity-backup.yml`         | Nightly export of the production dataset. Inert until `SANITY_AUTH_TOKEN` is set - see `docs/PENDING.md`.                                                                                                                                     | Not a test. Listed here because it is the recovery path when a gate misses something.                                                 |

## The browser suites

`playwright.config.ts` builds the site and serves `dist/client` on port 4321
(`npm run serve:dist`) before the suites run. The site is `output: 'static'`,
so `dist/client` is the whole site; there are no SSR routes to exclude.

- `tests/routes.ts` is the single route list. The 18 fixed pages are listed by
  hand; the CMS-driven pages (`/events/[slug]`, `/sermons/[slug]`, custom
  `/[slug]` pages such as `/prayer`) are discovered from `dist/client`, because
  the production dataset is public and even the token-less CI build emits them,
  but which slugs exist is editorial. `formRoutes` is read from the built HTML
  (the pages whose markup carries a `<form>`).
- `tests/helpers.ts` `settle()` waits for fonts, kills transitions, and forces
  every `[data-reveal]` element visible so axe and reflow see the real DOM.
- `smoke.spec.ts`: every route returns 200 and its title carries
  "Second Presbyterian".
- `a11y.spec.ts` / `a11y-dark.spec.ts`: axe-core's default rule set, zero
  violations. Dark mode is forced by seeding `localStorage.secondpres-theme =
'dark'` before the page's inline bootstrap runs, which toggles the `dark`
  class on `<html>`. The dark suite also focuses every field on the form routes
  and asserts a visible indicator (axe has no rule for that).
- `reflow.spec.ts`: no horizontal overflow at 320, 768, 1024 and 1440.

Locally the quick loop is `npx playwright test --project=chromium --workers=2`.
Playwright reuses an existing server on 4321 outside CI, so a stale
`http-server` from an earlier run makes the suites test the OLD build; kill it
first (`npm run free-dist` on Windows).

There is no visual-regression layer on purpose: it needs a fixture-driven
`/styleguide` route (WCP has one), and screenshotting CMS-driven pages flakes
with every content edit.

## The theme-token contrast gate

`src/lib/theme-tokens.test.ts` parses the real hex tokens out of
`src/styles/globals.css` and asserts the pairs the design system actually
renders. It exists because this bug class is invisible to everything else: axe
has no rule for focus-indicator or custom-border contrast and audits only the
resting DOM, and Lighthouse can sit at 100 with unreadable text. Scope is the
light `@theme` block; the shadcn `:root` / `.dark` overrides are oklch with
alpha and are deliberately not converted. Any token that starts being used for a
focus ring or a control edge must be added to that file.

## Parity baselines

`scripts/.parity/*.html` are committed. They are the baseline; git history is
the record of when one legitimately changed. Neither parity mode runs a build:
you build, then capture or compare. Baselines were re-captured 2026-09-06 after
the prettier pass and the inline-script extraction (the 2026-08-27 set had
already drifted 0/30 against a fresh build before this port started).
