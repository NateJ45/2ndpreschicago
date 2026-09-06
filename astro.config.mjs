// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';

// The Sanity project id is PUBLIC by design: it ships in every client bundle.
// A build with no .env still succeeds; the Studio then shows a project-not-found
// screen until PUBLIC_SANITY_PROJECT_ID is set.
const SANITY_PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder-project-id';
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.secondpreschicago.org',
  // STILL 'static' (2026-09-06). Every public page is prerendered exactly as
  // before; the build became HYBRID because the Studio and the preview stack opt
  // out per route with `export const prerender = false`. So `astro build` now
  // emits dist/client (the static site, what Cloudflare serves as assets) AND
  // dist/server (the Worker that answers /studio, /preview/** and /api/*).
  // Deploys must therefore pass `-c dist/server/wrangler.json`; see
  // wrangler.jsonc and .github/workflows/deploy-staging.yml.
  output: 'static',
  // No login, no gated area: this site does not use Astro sessions. Left on,
  // @astrojs/cloudflare v14 auto-declares a SESSION KV binding, and an
  // unpinned one fails the deploy with error 10014. The binding IS pinned in
  // wrangler.jsonc anyway (a namespace already exists on the account and a real
  // deploy confirmed it works), so this flag and that pin are belt and braces.
  session: false,
  // `imageService: 'compile'` tells @astrojs/cloudflare to process images
  // with Sharp at build time and ship plain static files — no Cloudflare
  // Images runtime, no per-transform fees, no Workers binding required.
  // The adapter's default would otherwise wire up the IMAGES binding which
  // is meant for SSR sites that want on-demand transforms (we don't).
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [
    mdx(),
    // Embedded Sanity Studio at /studio (added 2026-09-06, PORTS.md card 10).
    // This is now the canonical Studio: it rebuilds with every deploy, so it can
    // never drift stale the way the hosted secondpreschicago.sanity.studio does.
    // The config it loads is the repo-root sanity.config.ts.
    sanity({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      useCdn: false,
      studioBasePath: '/studio',
    }),
    // /studio and /preview are Studio plumbing (SSR, noindex). The sitemap only
    // walks prerendered routes so they are excluded already, but the filter
    // makes it explicit and future-proof.
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !page.includes('/studio') && !page.includes('/preview'),
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // @sanity/ui ships an ESM build that Vite's dependency pre-bundler
    // mis-scans on this stack (MISSING_EXPORT errors for styled-components).
    // Excluding it from pre-bundling matches the family's working config; it is
    // still bundled correctly by `astro build`.
    //
    // Deliberately NO custom chunking here. An `advancedChunks` group forcing
    // styled-components + @sanity/ui into one chunk was tried in presacademy on
    // 2026-08-26 (chasing a theming crash) and made things worse: merging those
    // modules changes evaluation order and broke @sanity/ui's theme init,
    // surfacing as "TypeError: Cannot read properties of undefined (reading
    // 'v2')" from inside styled-components' generateAndInjectStyles. Leave the
    // bundler's default chunking alone.
    optimizeDeps: {
      exclude: ['sanity', '@sanity/ui', 'styled-components'],
    },
    // -----------------------------------------------------------------------
    // ONE module instance per package
    // -----------------------------------------------------------------------
    // The studio now lives in this package (the nested studio/ package was
    // folded in 2026-09-06), so there is only one node_modules tree and this is
    // belt-and-braces rather than the load-bearing fix it was in presacademy.
    // Keep it anyway: it is cheap, and it protects against anything adding a
    // second resolution root. Two instances of styled-components means two React
    // contexts, and the ThemeProvider mounted by one is invisible to useTheme in
    // the other, which kills the signed-in Studio while leaving the login screen
    // (core code only) working.
    //
    // @sanity/icons is deliberately NOT here: sanity core and @sanity/ui want
    // different majors, and icons are stateless SVG components with no React
    // context, so two instances are harmless. Deduping them broke the build
    // elsewhere in the family (CogIcon is gone in v5).
    //
    // Verify after any Sanity dependency work:
    //   grep -l "errors.md#" dist/client/_astro/*.js   # must list ONE file
    resolve: {
      dedupe: [
        'react',
        'react-dom',
        'react-is',
        'styled-components',
        '@sanity/ui',
        '@sanity/client',
        'rxjs',
      ],
    },
  },
  // NOTE: A previous attempt at `security.csp` shipped a hash-based CSP
  // meta tag. It got past Lighthouse's csp-xss check on paper, but Astro
  // missed at least one runtime-generated inline script (probably from
  // ClientRouter view-transitions) and one inline style, which the browser
  // then blocked — breaking theme bootstrap and various islands. The
  // current `public/_headers` carries a `frame-ancestors` CSP for the
  // Sanity iframe-pane preview, which is enough for the actual security
  // surface. Re-enabling a full CSP needs an audit of every inline script
  // (incl. ClientRouter's runtime scripts), or a switch to a nonce-based
  // SSR strategy. Not worth chasing for the cookie/csp-xss informational
  // warnings — our Lighthouse runs already score Best Practices 100.
});
