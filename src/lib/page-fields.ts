// =============================================================================
// page-fields - which lines the in-canvas card may edit (2026-09-06, card 28)
// =============================================================================
// The in-canvas control layer is the floating card that hovers over a line in
// the Presentation preview and lets an editor type the words where the words
// are, instead of clicking them, watching the editor panel scroll to the right
// box, and typing while looking away from the thing they are changing.
//
// Before it draws anything it has to answer one question: IS THIS LINE ONE WE
// MAY EDIT? The overlay cannot ask the Studio, because it runs inside the
// preview iframe in the site's own bundle while the schema lives in the parent
// window. So the answer is a REGISTRY, here, and the registry is kept honest by
// src/lib/page-fields.test.ts, which reads the EXTRACTED schema (schema.json,
// written by `npm run typegen`) and fails when a page gains or loses one of
// these fields without this file being updated.
//
// -----------------------------------------------------------------------------
// WHAT THIS SITE HAS, AND WHAT IT DELIBERATELY DOES NOT
// -----------------------------------------------------------------------------
// The sister sites (presacademy, West Chester Preschool) give their in-canvas
// layer three controls: a band-colour card, a pick-a-word accent picker, and a
// text card. Only the text card is ported here, on purpose:
//
//   NO BAND COLOUR CARD. This site DOES have per-section tone and background
//   controls, but they live on the page-builder blocks inside
//   `flexibleSections[]`, not as top-level fields on the page document. The card
//   layer refuses any path deeper than one segment (see below), so a colour card
//   would have to grow array-path support first. The Studio's own field editor
//   already offers those controls, so nothing is lost meanwhile.
//
//   NO ACCENT-WORD PICKER. `heroScriptAccent` and `heroKeyword` are real fields
//   that Hero really renders, so a picker is possible here in a way it was not
//   on mas-monograms. It is not built in this pass because the picker component
//   (HeadingAccentPicker) carries the inline-rich write path with it, which is a
//   separate card. `heroKeyword` gets a plain text card in the meantime, which
//   is honest: it IS a plain string field.
//
// -----------------------------------------------------------------------------
// WHY THESE FIELD NAMES AND NO OTHERS
// -----------------------------------------------------------------------------
// Three rules decided the list:
//
//   1. The field must be declared by at least one PREVIEWABLE page type.
//   2. The preview route must RENDER it. A card can only hang on an element that
//      exists, and "the schema has the field" is not "the editor sees it". The
//      preview surface draws the hero and the page-builder sections; the hero's
//      lines are top-level fields, which is exactly what this layer can address.
//   3. `onTypes` lists the page types that declare it, and the card checks the
//      document's own `_type` against that list. Carrying the field is a
//      per-TYPE fact: `eyebrow` and `headline` are the 404 page's names for the
//      lines every other page calls `heroEyebrow` and `heroHeadline`, and
//      offering either one on the wrong page would write a field that page has
//      no box for.
// =============================================================================

// Explicit `.ts` extensions: the test command is bare Node
// (`node --experimental-strip-types --test`), which resolves neither the `@/`
// alias nor an extensionless specifier. Vite reads these happily either way.
import { splitStega } from './preview-stega.ts';
import { parseSanityPath, type PathSegment } from './sanity-path.ts';

/**
 * Every page type the preview route can render, in the order a visitor meets
 * them. Mirrors SINGLETON_PAGES in src/sanity/urls.ts plus the generic `page`
 * type, which the route serves at /preview/<slug>.
 */
export const PAGE_TYPES: readonly string[] = [
  'homePage',
  'aboutPage',
  'worshipPage',
  'beliefsPage',
  'musicPage',
  'staffPage',
  'growPage',
  'servePage',
  'kidsPage',
  'foodPage',
  'useOurSpacePage',
  'weddingsPage',
  'givePage',
  'eventsPage',
  'sermonsPage',
  'faqPage',
  'contactPage',
  'privacyPage',
  'notFoundPage',
  'page',
];

/** Every page type except the 404, which names its hero lines differently. */
const HERO_PAGES: readonly string[] = PAGE_TYPES.filter((t) => t !== 'notFoundPage');

/** The hero pages that also carry the liturgical-gold keyword flourish. */
const KEYWORD_PAGES: readonly string[] = HERO_PAGES.filter(
  (t) => t !== 'privacyPage' && t !== 'page',
);

/** One line the card may edit. */
export interface EditableLine {
  /** The field name, exactly as the schema declares it. */
  name: string;
  /**
   * What the card calls it. Plain words, and the Studio's own wording wherever
   * the Studio has some, so the box in the canvas and the box in the editor
   * panel read the same.
   */
  label: string;
  /** Rows in the box. A headline needs two; a single word needs one. */
  rows: number;
  /** The page types that declare this field. */
  onTypes: readonly string[];
}

/**
 * The registry, in the order the preview surface draws them: down the hero.
 */
export const EDITABLE_LINES: readonly EditableLine[] = [
  { name: 'heroEyebrow', label: 'Small label above the heading', rows: 1, onTypes: HERO_PAGES },
  { name: 'eyebrow', label: 'Small label above the heading', rows: 1, onTypes: ['notFoundPage'] },
  { name: 'heroHeadline', label: 'Headline', rows: 2, onTypes: HERO_PAGES },
  { name: 'headline', label: 'Headline', rows: 2, onTypes: ['notFoundPage'] },
  { name: 'title', label: 'Page name', rows: 1, onTypes: ['page'] },
  { name: 'heroSubhead', label: 'Short line under the heading', rows: 3, onTypes: HERO_PAGES },
  { name: 'heroKeyword', label: 'Word to set in gold', rows: 1, onTypes: KEYWORD_PAGES },
];

/** The registry, by field name. */
const BY_NAME: Readonly<Record<string, EditableLine>> = Object.fromEntries(
  EDITABLE_LINES.map((line) => [line.name, line]),
);

/**
 * The visible half of a preview string.
 *
 * A preview page carries invisible stega markers on every string, which is what
 * makes click-to-edit work. They must come OFF before the text reaches the box:
 * a value saved with a marker still inside it would store the marker, and the
 * next preview would encode a second one on top of it.
 */
export function cleanLine(value: unknown): string {
  return typeof value === 'string' ? splitStega(value).cleaned.trim() : '';
}

// -----------------------------------------------------------------------------
// What the in-canvas layer offers on a given element
// -----------------------------------------------------------------------------
// The overlay resolver runs SYNCHRONOUSLY, the instant an element is pointed
// at, and all it holds is the element's path. That is enough to decide which
// control is even a CANDIDATE. The card then confirms against the document's
// real `_type` once the snapshot arrives, and renders nothing if the answer is
// no. Two gates, in that order, because the cheap one runs on every hover and
// the accurate one costs a read.

/** The controls this layer can put on one element. Exactly one, so far. */
export type OverlayControl = 'text';

/**
 * Which control a path is a candidate for. An empty list means the element gets
 * nothing and the host's own overlay is left exactly as it was.
 *
 * A path with more than one segment is never offered. Every line here is a
 * top-level field on the page document; anything deeper is a page-builder block
 * or an array item, and a card there would need array-path support it does not
 * have.
 */
export function overlayControlsForPath(path?: string | null): OverlayControl[] {
  const segments = parseSanityPath(path);
  if (segments.length !== 1) return [];
  const name = segments[0];
  if (typeof name !== 'string') return [];
  return BY_NAME[name] ? ['text'] : [];
}

/** The resolved subject of the text card. */
export interface TextTarget {
  /** Where the value is written. */
  path: PathSegment[];
  /** The current value, with its stega markers removed. */
  text: string;
  /** The field's name as the card shows it. */
  label: string;
  /** Rows for the box. */
  rows: number;
}

/**
 * Work out what a pointed-at element edits, from the path it carries and the
 * document as it currently stands. Returns null for anything the card does not
 * offer, which is what makes the pencil disappear rather than write somewhere
 * unexpected.
 */
export function resolveTextTarget(
  doc: Record<string, unknown> | null | undefined,
  path?: string | null,
): TextTarget | null {
  if (!doc) return null;
  const segments = parseSanityPath(path);
  if (segments.length !== 1) return null;
  const name = segments[0];
  if (typeof name !== 'string') return null;

  const line = BY_NAME[name];
  if (!line) return null;

  // PER INSTANCE, not per field name. `headline` is declared by the 404 page
  // alone: on any other page there is no box for it, and a card that wrote one
  // would put a value in a document the Studio form cannot show.
  const type = typeof doc._type === 'string' ? doc._type : '';
  if (!line.onTypes.includes(type)) return null;

  return { path: [name], text: cleanLine(doc[name]), label: line.label, rows: line.rows };
}
