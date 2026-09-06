# PENDING.md - open patches and waiting-on-a-human items

Created 2026-08-27 (PORTS.md card 15, practice ported from the WCP repo).

This file is a **registry, not a changelog**. It is authoritative: an item is
edited or deleted in the same commit as the thing it tracks, and it never
accumulates narrative. Prose history belongs in `docs/agent/changelog.md`.

Read this early in any session. It exists so the next session inherits the queue
instead of rediscovering it.

---

## Waiting on a human

Nothing here can be done from the repo. Each item names the exact command.

### 1. Set the `SANITY_AUTH_TOKEN` secret so nightly backups start running

**Blocker:** the secret does not exist. `gh secret list -R NateJ45/2ndpreschicago`
returned nothing on 2026-08-27.

`.github/workflows/sanity-backup.yml` is committed and scheduled daily at 07:00
UTC, but its gate job skips with a warning until the secret is set, so nothing is
being backed up. Sanity is the single source of truth for every word on this
site; an accidental "Remove field" in Studio is currently unrecoverable.

A **read** token is enough. Create one at manage.sanity.io -> project `kz01wb83`
-> API -> Tokens, then:

```
gh secret set SANITY_AUTH_TOKEN -R NateJ45/2ndpreschicago
```

### 2. Set the `SITE_URL` repo variable at DNS cutover (not before)

**Blocker:** DNS has not cut over. Curl-verified 2026-08-27:
`https://www.secondpreschicago.org` answers `Server: Squarespace` and 404s
`/about`, `/faq` and `/privacy`. It is still the old site.

`.github/workflows/uptime.yml` is committed and scheduled hourly, and skips
cleanly while the variable is unset. Setting it now would fail every hour
against routes the Squarespace site does not have. After cutover:

```
gh variable set SITE_URL -R NateJ45/2ndpreschicago -b https://www.secondpreschicago.org
```

Then re-verify the route list in that workflow against the live site, and
remember the trailing slashes are load-bearing (see item 4 below).

---

## Open decisions

### 3. `--color-primary` is 3.95:1 on `--color-bg` - accent only, never body text

Not a bug today, recorded so it does not become one. This palette splits the
bronze: `--color-primary` (#8A6A43) is the interactive accent (button fills,
icons, borders, focus rings) and `--color-primary-dark` (#6B4F2E, 5.99:1) is the
anchor/link text colour. `src/lib/theme-tokens.test.ts` therefore asserts
primary at the 3:1 non-text threshold and primary-dark at 4.5:1.

If anyone ever sets body copy in `--color-primary`, that is a real WCAG 1.4.3
failure and the token has to darken. The test's header comment carries the same
warning at the point of change.

### 4. Sub-routes 307 to their trailing-slash form

Verified 2026-08-27 against the built worker (`wrangler dev -c
dist/server/wrangler.json`): `/worship` returns 307 to `/worship/`. Anything that
checks a URL without following redirects (the uptime workflow, a smoke test, an
external monitor) must write the trailing slash. Only `/` and real files such as
`/sitemap-index.xml` are slash-free.

### 5. `wrangler` is pinned by range, and the adapter still emits `legacy_env`

`dist/server/wrangler.json` contains `"legacy_env": true`. Wrangler 4.126+
rejects that field outright, which breaks every `wrangler dev` / `wrangler
deploy` against the generated config (PORTS.md card 14). This repo currently
resolves wrangler **4.95.0**, so it works - but `package.json` asks for
`^4.95.0`, so a fresh `npm install` can float past 4.126 and break local preview
and deploy without a single line of this repo changing.

Options when that happens: pin `wrangler` to `~4.95.0`, or take an
`@astrojs/cloudflare` version that stops emitting the field. Do not chase it
before it bites; do recognise it instantly when it does.

### 6. Root `wrangler.jsonc` points `assets.directory` at `./dist`

The build writes HTML to `dist/client/`, and the adapter-generated
`dist/server/wrangler.json` correctly says `../client`. The hand-written root
config says `./dist`, which is the wrong level. It does not affect the live site
(Cloudflare's dashboard build deploys from the generated config) and it does not
affect CI, so nothing is broken today. It will mislead the first person who runs
a plain `wrangler dev`. Compare with the WCP gotcha: a plain `wrangler deploy`
404s every sub-route for exactly this reason.

---

## Recently closed

- **2026-08-27** - sync session against `ncs-astro-sanity-starter`. Installed the
  free-dist prebuild unlock, the workerd wrapper (unwired), the Sanity seed
  library, the contrast module and its theme-token gate, the drift checker, the
  parity harness with 30 committed baselines, the stale-types CI guard, and the
  nightly backup and uptime workflows. Fixed the package identity: the root
  package was still named `ncs-astro-sanity-starter`.
