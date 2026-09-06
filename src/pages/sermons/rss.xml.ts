// Safe to edit by hand
// Sermons RSS feed. Uses @astrojs/rss (already a project dependency).
// Each item includes title, link, pubDate (sermon date), and description.
// Ordered by date descending (getRecentSermons already does this).

import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getRecentSermons, getSiteSettings } from '@/lib/queries';
import { site } from '@/data/site';

export const GET: APIRoute = async (context) => {
  const [sermons, siteSettings] = await Promise.all([
    getRecentSermons().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  const items = (sermons ?? []).map((sermon: any) => ({
    title: sermon.title ?? '(untitled)',
    link: `/sermons/${sermon.slug?.current ?? ''}`,
    pubDate: sermon.date ? new Date(sermon.date) : undefined,
    description:
      [sermon.speaker, sermon.scripture, sermon.series].filter(Boolean).join(' | ') || undefined,
  }));

  return rss({
    title: `${siteSettings?.title ?? site.name} Sermons`,
    description: 'Sermons from Second Presbyterian Church of Chicago.',
    site: context.site ?? site.url,
    items,
  });
};
