# TESTING.md - what covers what

Created 2026-08-27 (PORTS.md card 15). A map of the gates, so nobody writes a
fourth suite that duplicates the second. Keep it current in the same commit that
adds or removes a gate.

## The gates

| Gate | Command | Covers | Does not cover |
|---|---|---|---|
| Unit tests | `npm test` | Pure logic in `src/lib/*.test.ts`: section visibility, reading time, `telHref`, slugify, and the theme-token contrast pairs. | Anything that needs a DOM or a network. |
| Type + schema check | `npm run typegen` | Regenerates `studio/schema.json` and `src/lib/sanity.types.ts` from `studio/schemaTypes/`. | Whether the hosted Studio was redeployed (`npm run studio:deploy`). |
| Build | `npm run build` | That every route renders with the real content, and that Astro, Sharp and the adapter agree. Runs `prebuild` (`free-dist`) first. | Runtime behavior in a browser. |
| Studio build | `npm --prefix studio run build` | That the Studio compiles. | Studio **runtime** errors - schema mistakes pass the build and crash in the browser. Check `npm run studio:dev` after schema changes. |
| Everything above | `npm run check` | The whole chain: typegen, build, studio build, unit tests. This is the pre-push gate. | Parity and drift (below) - run those deliberately. |
| Rendered-HTML parity | `npm run build` then `npm run parity compare` | That a change which is supposed to be render-neutral changed no rendered markup on any of the 30 routes. | Intended markup changes: those need a fresh `npm run parity capture`, said out loud in the commit message. |
| Canonical-file drift | `npm run sync-check` | That this repo's copies of the shared family files still match `ncs-astro-sanity-starter`. | Files without the PORTABLE header, which includes `scripts/page-parity.mjs` (ported as a pattern on purpose). |
| CI | `.github/workflows/ci.yml` | The `npm run check` chain on every push and PR, plus the stale-types guard (fails if CI's own typegen produces a diff against the committed types). | Deployment. The live site auto-deploys from `main` through the Cloudflare dashboard, wired separately. |
| Uptime | `.github/workflows/uptime.yml` | Hourly, that five key live routes return 200. Inert until the `SITE_URL` repo variable is set - see `docs/PENDING.md`. | Anything below HTTP 200: content, layout, or a page that renders empty. |
| Backup | `.github/workflows/sanity-backup.yml` | Nightly export of the production dataset. Inert until `SANITY_AUTH_TOKEN` is set - see `docs/PENDING.md`. | Not a test. Listed here because it is the recovery path when a gate misses something. |

## The theme-token contrast gate

`src/lib/theme-tokens.test.ts` parses the real hex tokens out of
`src/styles/globals.css` and asserts the pairs the design system actually
renders. It exists because this bug class is invisible to everything else: axe
has no rule for focus-indicator or custom-border contrast and audits only the
resting DOM, and Lighthouse can sit at 100 with unreadable text. Scope is the
light `@theme` block; the shadcn `:root` / `.dark` overrides are oklch with
alpha and are deliberately not converted. Any token that starts being used for a
focus ring or a control edge must be added to that file.

## What is deliberately absent

There is no Playwright / axe / reflow suite in this repo (PORTS.md card 8; WCP
and presacademy have one). Until there is, browser behavior, keyboard
accessibility and the 320-1440 reflow band are covered only by the manual
visual-verification loop in `CLAUDE.md`. That is a real gap, not an oversight -
it is the obvious next port.

## Parity baselines

`scripts/.parity/*.html` are committed. They are the baseline; git history is
the record of when one legitimately changed. Neither parity mode runs a build:
you build, then capture or compare. Baselines were captured 2026-08-27 from a
plain `npm run build`, and a second build compared 30/30 PASS.
