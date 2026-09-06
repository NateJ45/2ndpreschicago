// Cloudflare Workers environment bindings for the SSR half of this site.
//
// Added 2026-09-06 with the embedded Studio and the preview stack. Before that
// every route was prerendered, nothing imported `cloudflare:workers`, and
// tsconfig.json referenced this file without it existing (a no-op). It exists
// now because src/lib/cms-preview.ts, src/lib/preview-auth.ts and
// src/pages/preview/live.ts all read the runtime env, and `astro check` cannot
// resolve the `cloudflare:workers` module without the reference below.
//
// Kept by hand rather than generated: `wrangler types` overwrites the whole
// file including these notes, and the binding list here is short and stable.

/// <reference types="@cloudflare/workers-types" />

interface Env {
  // Session KV. Astro sessions are OFF (astro.config.mjs), but
  // @astrojs/cloudflare v14 declares the binding anyway and the namespace id is
  // pinned in wrangler.jsonc so deploys stop failing with error 10014.
  SESSION: KVNamespace;
  // Sanity read token for the DRAFT-reading preview routes. SANITY_TOKEN is the
  // family's name and is set on both Workers; SANITY_API_READ_TOKEN is this
  // repo's older name for the same thing. Whichever exists wins; see
  // src/lib/cms-preview.ts.
  SANITY_TOKEN?: string;
  SANITY_API_READ_TOKEN?: string;
}
