// Safe to edit by hand
// Generates /robots.txt at build time, deriving the Sitemap URL from the
// site.url constant in src/data/site.ts so the domain can never drift.
// Replaces the static public/robots.txt which was correct but a drift hazard.

import type { APIRoute } from 'astro';
import { site } from '@/data/site';

export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${site.url}/sitemap-index.xml`, ''].join(
    '\n',
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
