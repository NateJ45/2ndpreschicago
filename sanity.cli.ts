// Foundation, edit with care
// =============================================================================
// Sanity CLI config - used by `sanity schema extract`, `sanity typegen`,
// `sanity dataset`, `sanity cors`.
// =============================================================================
// Moved here from studio/sanity.cli.ts on 2026-09-06, when the nested studio/
// package was folded into this one (PORTS.md card 10). The Studio now lives at
// /studio on the built site, mounted by @sanity/astro (see astro.config.mjs),
// so it rebuilds with every deploy and cannot drift stale.
//
// `sanity build` writes to ./dist by default, which would clobber the Astro
// build output. There is deliberately no `studio:build` script for that reason:
// the Studio is built by `astro build` as part of the site. If a standalone
// bundle is ever needed, pass an explicit output dir:
//   npx sanity build .studio-dist

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId:
      process.env.SANITY_STUDIO_PROJECT_ID ||
      process.env.PUBLIC_SANITY_PROJECT_ID ||
      'placeholder-project-id',
    dataset:
      process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
  },
  // The embedded Studio is served at /studio (@sanity/astro's studioBasePath in
  // astro.config.mjs). Mirror it here so standalone CLI tooling agrees.
  project: { basePath: '/studio' },
  // ---------------------------------------------------------------------------
  // The hosted twin at secondpreschicago.sanity.studio
  // ---------------------------------------------------------------------------
  // DEPRECATED as of 2026-09-06. The embedded /studio is now the canonical one:
  // it ships with the site, so its schema is always the schema the site was
  // built from. The hosted Studio only changes when somebody re-runs
  // `npx sanity deploy` by hand, which is exactly the silent-drift shape the
  // rest of the family removed. It is kept configured, not deleted, so that the
  // pins below still apply if it is ever redeployed before Nathan retires it in
  // sanity.io/manage. There is no npm script for it any more, on purpose.
  studioHost: 'secondpreschicago',
  deployment: {
    // The deployed studio application (secondpreschicago.sanity.studio).
    // Pinning the appId keeps `sanity deploy` non-interactive on future runs.
    appId: 'qnl9wc1nqjzru774j53329yd',
    // FALSE since 2026-09-06 (Nathan's call). With autoUpdates on, the hosted
    // Studio loaded its core from sanity-cdn.com at the RANGE the installed
    // sanity major allows, ignoring this repo's lockfile entirely. That is how
    // this Studio silently crossed from sanity 6.4 to 6.12 and from
    // @sanity/ui 3 to 4 without anyone testing it: Dependabot moved the
    // package, and the CDN served the new core to editors. It happened to
    // survive (verified by signing in 2026-09-06), but the family rule is that
    // the Sanity stack moves as a deliberately verified set, and an exact pin
    // that the deployed Studio ignores is not a pin at all.
    //
    // The embedded Studio has never had this problem: it is bundled from this
    // repo's node_modules by `astro build`, so the lockfile IS the pin.
    autoUpdates: false,
  },
  // Typegen reads the extracted schema and writes types into src/lib/.
  // Both halves are wrapped by `npm run typegen`.
  typegen: {
    path: './schema.json',
    generates: './src/lib/sanity.types.ts',
  },
});
