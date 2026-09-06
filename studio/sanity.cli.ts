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
    autoUpdates: true,
  },
  // Typegen reads the extracted schema and writes types into the Astro project's src/lib/.
  // Schema is extracted via `sanity schema extract`; types generated via `sanity typegen generate`.
  typegen: {
    path: './schema.json',
    generates: '../src/lib/sanity.types.ts',
  },
});
