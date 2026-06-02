// Safe to edit by hand
// Static identity values that don't change between deploys.
// Content editors update their fields through Sanity instead — see studio/ and src/lib/queries.ts.
// Replace these placeholders with your project's real values before launch.

export const site = {
  name: "Second Presbyterian Church of Chicago",
  studio: "Second Presbyterian Church of Chicago",
  domain: "secondpreschicago.org",
  url: "https://www.secondpreschicago.org",
  storageKeyPrefix: "secondpres",
  themeStorageKey: "secondpres-theme",

  // NOTE: contact details (email, pastoral email, phone, address, office hours)
  // and social profile URLs used to live here as hardcoded fallbacks. They were
  // removed: those values now live ONLY in Sanity siteSettings and are read
  // through src/lib/siteSettings.ts (resolveSiteSettings). Keeping a second,
  // hardcoded copy here is exactly what let an empty or changed Sanity field get
  // silently masked on the live site, so there is no longer a copy to drift from.

  // Brand colors are also declared in src/styles/globals.css.
  // Mirrored here for any script that needs them outside CSS (OG generator, structured data, etc.).
  brandColors: {
    primary: "#8A6A43",       // Bronze
    primaryDark: "#6B4F2E",   // Bronze Dark
    accent: "#36302A",        // Espresso Ink
    accentDark: "#241F1A",    // Espresso Dark
    secondary: "#B9A590",     // Clay
    tertiary: "#A89A86",      // Warm Stone
    bg: "#ECE4DA",            // Paper (warm cream)
    bgSoft: "#F6F3EC",        // Paper Soft
    border: "#DED6C8",        // Warm Border
    chapel: "#1E423B",        // Chapel green (Tiffany-glass) — utility bar, footer, CTA
    chapelDeep: "#16322C",    // Chapel green, deepest base
    gold: "#A07D45",          // Liturgical gold accent
  },

  // Static asset paths under public/
  // Note: the logo files are in `src/assets/` and are imported directly
  // by Header.astro / Footer.astro so Astro's <Image> component can emit
  // optimized WebP variants with content-hashed filenames. The keys below
  // stay only for the OG image + favicon, which are still served straight
  // from public/.
  assets: {
    ogDefault: "/og-default.png",
    favicon: "/favicon.png",
  },

  // Public repo URL (used in footer credit if shown)
  repo: "",
} as const;

export type Site = typeof site;
