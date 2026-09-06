// Foundation, edit with care
// =============================================================================
// preview-edit-attr - explicit `data-sanity` targets for repeatable ARRAY items
// (ported from mas-monograms 2026-09-06; PORTS.md card 17)
// =============================================================================
// Stega markers give click-to-edit on TEXT. A whole card (its band, its images,
// its empty space) has no text of its own to click, so the Presentation overlay
// cannot draw item-level controls from stega alone. An explicit `data-sanity`
// attribute on each item wrapper fixes that: the overlay outlines the item as ONE
// array member and shows the array controls in the canvas (insert before/after,
// duplicate, remove, drag to reorder). That is the Squarespace feel.
//
// PER-SITE ADAPTATION, 2026-09-06 - READ THIS BEFORE PORTING ANYTHING BACK.
// The starter and presacademy attach this to a PAGE-BUILDER array (`pageBuilder`
// / `flexibleSections`): one array per page holding interchangeable section
// blocks. mas-monograms, whose copy of this file this one is ported from, has no
// page builder at all and attaches it to bespoke object arrays instead.
//
// THIS REPO HAS BOTH. Every page singleton carries a real `flexibleSections[]`
// page-builder array rendered by src/components/Sections.astro, AND several
// carry their own bespoke repeatable lists (the weekly rhythms on the home page,
// the small groups on /grow, the ways to serve on /serve, the wedding FAQs). So
// the field name below is a SET covering both kinds, and the preview route
// renders the builder array through the REAL section components while listing
// the bespoke arrays as labelled editable blocks.
//
// Three rules, each learned the hard way somewhere in the family:
//
//  1. PREVIEW SURFACES ONLY. The live site never renders these attributes: the
//     static pages never call this helper. `npm run parity compare` is the gate
//     on that promise, and it is why the preview surface is a separate route
//     rather than a flag threaded through the real pages.
//  2. The attribute must sit on a REAL block box. The overlay outlines the
//     element's rect, and a `display: contents` element has none.
//  3. The field name must be the array the items actually live in. Point the
//     overlay at the wrong array and every control silently edits nothing.
//
// Drag-and-drop needs no extra props in @sanity/visual-editing 5.4.5: it is on as
// soon as the attribute exists.
// =============================================================================
import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute';

/**
 * Every repeatable object array this site previews, by the page type that owns
 * it. These names come from src/sanity/schemaTypes/<type>.ts and are the exact
 * GROQ/patch paths the Studio uses, so a typo here is a silently dead control.
 *
 * Keep in step with PREVIEW_PAGES in src/pages/preview/[...slug].astro, which is
 * what decides which of these actually render.
 */
export type EditableArrayField =
  // Every page singleton: the page-builder array, rendered for real by
  // src/components/Sections.astro.
  | 'flexibleSections'
  // The generic `page` type calls its builder array `sections`.
  | 'sections'
  // homePage
  | 'heroRotatingWords'
  | 'weeklyRhythms'
  // beliefsPage / growPage / servePage / useOurSpacePage / weddingsPage
  | 'resources'
  | 'groups'
  | 'ways'
  | 'uses'
  | 'weddingFaqs'
  | 'weddingPricing'
  // contactPage
  | 'contactReasons'
  // faqPage
  | 'categoryOrder';

export interface EditDoc {
  /** The PUBLISHED document id (no `drafts.` prefix). */
  id: string;
  /** The document _type, e.g. "homePage". */
  type: string;
}

/**
 * The `data-sanity` value that targets one array item on a doc.
 *
 * PRIMITIVE ARRAYS NEED THE INDEX, NOT A KEY (found 2026-08-28 by the
 * data-sanity-vs-GROQ count check). The starter's card only ever attaches this
 * to arrays of OBJECTS, which Sanity always gives a `_key`. This repo also has
 * arrays of plain strings - `homePage.trustItems` is `of: [{ type: 'string' }]` -
 * and a primitive array member has no `_key` at all. Keying off `_key` there
 * silently rendered NO attribute and no controls: home showed 5 attributes where
 * the arrays held 8 items, and nothing errored. So the selector falls back to
 * the positional form, which is what the Studio patches primitives by.
 *
 * Pass `_key` when the item has one; it survives reordering, which an index does
 * not.
 */
export function arrayItemEditAttr(
  doc: EditDoc,
  field: EditableArrayField,
  keyOrIndex: string | number,
): string {
  const selector =
    typeof keyOrIndex === 'number' ? `${field}[${keyOrIndex}]` : `${field}[_key=="${keyOrIndex}"]`;
  return createDataAttribute({
    id: doc.id.replace(/^drafts\./, ''),
    type: doc.type,
    baseUrl: '/studio',
  })(selector).toString();
}

/** The `data-sanity` value that targets a whole field on a doc (a hero headline,
 *  a CTA block), so the overlay can outline non-array editable regions too. */
export function fieldEditAttr(doc: EditDoc, field: string): string {
  return createDataAttribute({
    id: doc.id.replace(/^drafts\./, ''),
    type: doc.type,
    baseUrl: '/studio',
  })(field).toString();
}

/**
 * The `data-sanity` value that targets a field on ANY document - the
 * WordPress-template-part gesture (2026-08-28). PreviewLayout wraps the shared
 * Header and Footer in this attribute pointed at `siteSettings`, so in Edit
 * mode the chrome outlines as one editable surface and a click switches the
 * Presentation edit panel to the owning document, opened at `path`.
 */
export function docEditAttr(id: string, type: string, path: string): string {
  return createDataAttribute({
    id: id.replace(/^drafts\./, ''),
    type,
    baseUrl: '/studio',
  })(path).toString();
}
