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

  // Public contact details. Mirrored into Sanity siteSettings by the seed script;
  // used as fallbacks so the live site shows real contact info before Sanity is wired.
  contact: {
    email: "office@secondpreschicago.org",
    pastorEmail: "pastorchesna@secondpreschicago.org",
    phone: "312-225-4951",
    addressLine: "1936 South Michigan Ave",
    cityStateZip: "Chicago, IL 60616",
    officeHours: "Tuesday-Friday, 10am-2pm",
  },

  // Social profiles.
  social: {
    instagram: "https://www.instagram.com/2ndpresbyterian",
    facebook: "https://www.facebook.com/2ndpreschicago",
    youtube: "https://www.youtube.com/@secondpreschicago",
  },

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
  },

  // Static asset paths under public/
  // Note: the logo files are in `src/assets/` and are imported directly
  // by Header.astro / Footer.astro so Astro's <Image> component can emit
  // optimized WebP variants with content-hashed filenames. The keys below
  // stay only for the OG image + favicon, which are still served straight
  // from public/.
  assets: {
    ogDefault: "/og-default.png",
    favicon: "/favicon.svg",
  },

  // Public repo URL (used in footer credit if shown)
  repo: "",
} as const;

export type Site = typeof site;
