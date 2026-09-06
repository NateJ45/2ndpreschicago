import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// =============================================================================
// Every public route on the site: the single source of truth for the sweeps.
// The site is `output: 'static'`, so everything Astro emits lands in
// dist/client as build-time HTML and every route below is a real page there.
// lighthouserc.json lists one URL per template from the same set.
// =============================================================================

// The fixed pages: one .astro file each under src/pages. These exist in EVERY
// build, whatever Sanity holds, so they are listed by hand and a missing one is
// a real failure. Derived from src/pages and checked against dist/client on
// 2026-09-06.
export const fixedRoutes: string[] = [
  '/',
  '/about',
  '/contact',
  '/events',
  '/faq',
  '/food',
  '/give',
  '/grow',
  '/kids',
  '/music',
  '/pastor-staff',
  '/privacy',
  '/sermons',
  '/serve',
  '/use-our-space',
  '/weddings',
  '/what-we-believe',
  '/worship',
];

// The CMS-driven templates: /events/[slug], /sermons/[slug] and the custom
// /[slug] pages (e.g. /prayer) get their paths from Sanity in getStaticPaths().
// The production dataset is public, so even the credential-less CI build
// emits them, but WHICH slugs exist is editorial and changes over time. Rather
// than hard-code slugs that exist in one build and not another, discover
// whatever the build actually produced: every `<dir>/index.html` in
// dist/client that is not a fixed route above.
// Route prefixes that are Studio plumbing, not public pages. `/studio` is a
// real `dist/client/studio/index.html` since the Studio was embedded
// (2026-09-06) and would otherwise be discovered as a page: it is the Sanity
// Studio shell, so it carries no church name in its <title> and is not ours to
// hold to the site's a11y and reflow rules. `/preview` and `/api` are SSR-only
// and never appear in dist/client at all; they are listed so this stays right
// if that ever changes.
const NON_PUBLIC_PREFIXES = ['/studio', '/preview', '/api'];

function discoverBuiltRoutes(): string[] {
  const dist = join(process.cwd(), 'dist', 'client');
  if (!existsSync(dist)) return [];
  const found: string[] = [];
  const walk = (dir: string, prefix: string) => {
    for (const name of readdirSync(dir)) {
      if (name.startsWith('_') || name.startsWith('.')) continue;
      const full = join(dir, name);
      if (!statSync(full).isDirectory()) continue;
      const route = `${prefix}/${name}`;
      if (NON_PUBLIC_PREFIXES.some((p) => route === p || route.startsWith(`${p}/`))) continue;
      if (existsSync(join(full, 'index.html')) && !fixedRoutes.includes(route)) {
        found.push(route);
      }
      walk(full, route);
    }
  };
  walk(dist, '');
  return found.sort();
}

/** Every route that must return 200 and pass every sweep. */
export const routes: string[] = [...fixedRoutes, ...discoverBuiltRoutes()];

// Routes whose built HTML carries a <form>. The dark-mode focus-indicator
// check in a11y-dark.spec.ts runs on these. Forms here are Sanity-driven
// (FormRenderer via the sectionForm block, and the footer newsletter signup
// where it is switched on), so the set is read from the build rather than
// guessed: /contact, /worship and the custom /prayer page as of 2026-09-06.
export const formRoutes: string[] = routes.filter((route) => {
  const file = join(process.cwd(), 'dist', 'client', route, 'index.html');
  return existsSync(file) && readFileSync(file, 'utf8').includes('<form');
});
