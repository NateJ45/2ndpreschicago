// Foundation, edit with care
// =============================================================================
// Studio URL helpers - shared by the repo-root sanity.config.ts, the desk
// structure, the Presentation location resolver (src/sanity/resolve.ts) and the
// preview route (src/pages/preview/[...slug].astro).
// =============================================================================
// Extracted out of the old studio/sanity.config.ts on 2026-09-06 when the
// studio folded into the root package (PORTS.md card 10). Components import
// this small sibling module instead of reaching up to the repo-root config
// file, which keeps the config free to import them without a cycle.
//
// THIS MODULE IS THE ONE SOURCE OF TRUTH for the page map. The family's card 10
// and card 11 warn that the map lives in THREE files that must agree, and that
// the third one degrades silently. Two of those three are collapsed here: both
// src/sanity/resolve.ts and the preview route derive their maps from
// SINGLETON_PAGE_PATHS below. The third copy still exists and still has to be
// kept in step by hand - FIRST_SEGMENT_PREVIEWABLE inside the click interceptor
// in src/layouts/PreviewLayout.astro - because that code runs in a browser
// <script> block, which cannot import a module.
//
// It must stay dependency-free (no `sanity` imports): the preview route pulls
// it into the Worker bundle.

// -----------------------------------------------------------------------------
// Env access that works in BOTH bundlers. The sanity CLI defines
// process.env.SANITY_STUDIO_*; the EMBEDDED /studio (bundled by Astro/Vite) has
// no meaningful `process` global in the browser and exposes PUBLIC_* vars on
// import.meta.env instead. A bare `process.env.X` read would throw a
// ReferenceError the moment the embedded studio chunk evaluates.
// -----------------------------------------------------------------------------
export const envVal = (...names: string[]): string | undefined => {
  for (const n of names) {
    const fromProcess = typeof process !== 'undefined' ? process.env?.[n] : undefined;
    if (fromProcess) return fromProcess;
    const fromVite = (import.meta as { env?: Record<string, string | undefined> }).env?.[n];
    if (fromVite) return fromVite;
  }
  return undefined;
};

// Live-site base used by urlForDoc. Defaults to the local dev server so a fresh
// clone still resolves; set PUBLIC_SITE_URL (or SANITY_STUDIO_PREVIEW_URL) to
// the real origin.
export const SITE_URL_FOR_PREVIEW =
  envVal('SANITY_STUDIO_PREVIEW_URL', 'PUBLIC_SITE_URL') || 'http://localhost:4321';

/**
 * Every page SINGLETON, mapped to the live path it renders at. Insertion order
 * is the order the Presentation navigator lists them in, so it reads roughly
 * like the site's own navigation rather than alphabetically.
 *
 * A page in here is previewable: the preview route serves it and the resolver
 * points Presentation at it. Adding a page singleton means adding it here, and
 * then adding its first path segment to FIRST_SEGMENT_PREVIEWABLE in
 * src/layouts/PreviewLayout.astro.
 */
export const SINGLETON_PAGES: ReadonlyArray<{ type: string; path: string; label: string }> = [
  { type: 'homePage', path: '/', label: 'Home' },
  { type: 'aboutPage', path: '/about', label: 'About' },
  { type: 'worshipPage', path: '/worship', label: 'Worship' },
  { type: 'beliefsPage', path: '/what-we-believe', label: 'What We Believe' },
  { type: 'musicPage', path: '/music', label: 'Music' },
  { type: 'staffPage', path: '/pastor-staff', label: 'Pastor & Staff' },
  { type: 'growPage', path: '/grow', label: 'Grow' },
  { type: 'servePage', path: '/serve', label: 'Serve' },
  { type: 'kidsPage', path: '/kids', label: 'Kids' },
  { type: 'foodPage', path: '/food', label: 'Food' },
  { type: 'useOurSpacePage', path: '/use-our-space', label: 'Use Our Space' },
  { type: 'weddingsPage', path: '/weddings', label: 'Weddings' },
  { type: 'givePage', path: '/give', label: 'Give' },
  { type: 'eventsPage', path: '/events', label: 'Events' },
  { type: 'sermonsPage', path: '/sermons', label: 'Sermons' },
  { type: 'faqPage', path: '/faq', label: 'FAQ' },
  { type: 'contactPage', path: '/contact', label: 'Contact' },
  { type: 'privacyPage', path: '/privacy', label: 'Privacy' },
  { type: 'notFoundPage', path: '/404', label: '404 page' },
];

/** Live path per singleton type. */
export const SINGLETON_PAGE_PATHS: Record<string, string> = Object.fromEntries(
  SINGLETON_PAGES.map(({ type, path }) => [type, path]),
);

/** Editor-facing label per singleton type. */
export const SINGLETON_PAGE_LABELS: Record<string, string> = Object.fromEntries(
  SINGLETON_PAGES.map(({ type, label }) => [type, label]),
);

/** A live path turned into its /preview equivalent. `/` becomes `/preview`. */
export const toPreviewPath = (path: string): string =>
  path === '/' ? '/preview' : `/preview${path}`;

/** Preview path per singleton type, derived from the map above. */
export const SINGLETON_PREVIEW_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(SINGLETON_PAGE_PATHS).map(([type, path]) => [type, toPreviewPath(path)]),
);

// Map doc _type -> live-site PATH (no host). Singletons come from the map above;
// slug-based docs build the path from the slug. Returns null for types with no
// public page of their own (siteSettings).
//
// Two callers depend on this staying accurate: the "view it live" affordances
// in the Studio, and src/sanity/resolve.ts, which turns these paths into the
// Presentation tool's document <-> URL mapping.
export function pathForDoc(schemaType: string, doc: any): string | null {
  const singleton = SINGLETON_PAGE_PATHS[schemaType];
  if (singleton) return singleton;

  const slug = doc?.slug?.current;
  switch (schemaType) {
    // Collections: dated detail pages by slug; staff list + FAQ list pages.
    case 'event':
      return slug ? `/events/${slug}` : '/events';
    case 'sermon':
      return slug ? `/sermons/${slug}` : '/sermons';
    case 'staffMember':
      return '/pastor-staff';
    case 'faqItem':
      return '/faq';
    // Generic custom pages live at /<slug>.
    case 'page':
      return slug ? `/${slug}` : null;
    default:
      return null;
  }
}

/** Full URL on the live-site base. */
export function urlForDoc(schemaType: string, doc: any): string | null {
  const path = pathForDoc(schemaType, doc);
  return path === null ? null : `${SITE_URL_FOR_PREVIEW}${path}`;
}
