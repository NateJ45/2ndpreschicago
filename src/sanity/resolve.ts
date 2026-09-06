// Foundation, edit with care
// =============================================================================
// Presentation Tool location resolver
// (ported from mas-monograms 2026-09-06, PORTS.md card 10; original lineage:
// ncs-astro-sanity-starter, presacademy and the WCP site)
// =============================================================================
// Two halves:
//
//  - `mainDocuments` (URL -> document): as you click through the preview iframe
//    like a normal website, Presentation opens the matching document in the
//    editor panel automatically. Routes match the iframe pathname (which lives
//    under /preview). Order matters: the singleton routes come before the
//    catch-all `page` route.
//
//  - `locations` (document -> URL): the reverse, so opening a document from the
//    desk points the preview at the right page. Singletons map to their fixed
//    preview path; `page` docs resolve from the slug. Collection docs (event,
//    sermon, staffMember, faqItem) have no dedicated draft-preview route of
//    their own, so they land on the page they appear on.
//
// The preview routes themselves live in src/pages/preview/. Both this file and
// that route derive their map from SINGLETON_PAGE_PATHS in src/sanity/urls.ts,
// so there is nothing to keep in sync between them. The one copy that still has
// to be updated by hand is FIRST_SEGMENT_PREVIEWABLE in the click interceptor
// inside src/layouts/PreviewLayout.astro, which runs in a browser <script> and
// cannot import a module.
// =============================================================================
import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from 'sanity/presentation';
import { SINGLETON_PREVIEW_PATHS, toPreviewPath } from './urls';

const previewHref = (slug: string) => toPreviewPath(`/${slug}`);

// One static location entry per singleton.
const singletonLocations = Object.fromEntries(
  Object.entries(SINGLETON_PREVIEW_PATHS).map(([type, href]) => [
    type,
    { locations: [{ title: 'Preview', href }] },
  ]),
);

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/preview', filter: '_type == "homePage"' },
    // Singleton routes before the generic :slug catch-all.
    ...Object.entries(SINGLETON_PREVIEW_PATHS)
      .filter(([type]) => type !== 'homePage')
      .map(([type, href]) => ({ route: href, filter: `_type == "${type}"` })),
    { route: '/preview/:slug', filter: '_type == "page" && slug.current == $slug' },
  ]),
  locations: {
    ...singletonLocations,
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => {
        const slug = doc?.slug;
        if (!slug) return { locations: [], message: 'Give this page a slug to preview it.' };
        return { locations: [{ title: doc?.title ?? slug, href: previewHref(slug) }] };
      },
    }),
    // Collection docs have no draft-preview route of their own. Send each to the
    // page it renders on, with a note where a detail page exists live.
    event: {
      locations: [{ title: 'Events', href: '/preview/events' }],
      message: 'Individual event pages appear on the live site after publish.',
    },
    sermon: {
      locations: [{ title: 'Sermons', href: '/preview/sermons' }],
      message: 'Individual sermon pages appear on the live site after publish.',
    },
    staffMember: { locations: [{ title: 'Pastor & Staff', href: '/preview/pastor-staff' }] },
    faqItem: { locations: [{ title: 'FAQ', href: '/preview/faq' }] },
    ministry: { locations: [{ title: 'Home', href: '/preview' }] },
    worshipResource: { locations: [{ title: 'Worship', href: '/preview/worship' }] },
    announcement: { locations: [{ title: 'Home', href: '/preview' }] },
    form: {
      locations: [{ title: 'Contact', href: '/preview/contact' }],
      message: 'A form shows wherever a page places it, which may be more than one page.',
    },
    siteSettings: { locations: [{ title: 'Home', href: '/preview' }] },
  },
};
