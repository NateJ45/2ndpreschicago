// Foundation, edit with care
// CLI configuration for `sanity` commands (deploy, dataset import, typegen).

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder-project-id',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // The studio will be published at <studioHost>.sanity.studio after `npm run studio:deploy`.
  // studioHost must be globally unique across *.sanity.studio; change it if deploy reports a clash.
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
    // THE TRADEOFF, so nobody is surprised: the deployed Studio no longer
    // picks up Sanity's fixes on its own. It changes only when someone runs
    // `npm run studio:deploy`. For a site in maintenance that is the point,
    // reproducibility over drift, but it does mean this Studio will age until
    // someone redeploys it.
    autoUpdates: false,
  },
  // Typegen reads the extracted schema and writes types into the Astro project's src/lib/.
  // Schema is extracted via `sanity schema extract`; types generated via `sanity typegen generate`.
  typegen: {
    path: './schema.json',
    generates: '../src/lib/sanity.types.ts',
  },
});
