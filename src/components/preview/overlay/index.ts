// Safe to edit by hand
// =============================================================================
// The in-canvas control layer - one resolver, one control (2026-08-28, card 28)
// =============================================================================
// @sanity/visual-editing lets the previewed page put its OWN React components
// inside the overlay, anchored to whatever element is pointed at, by handing
// `<VisualEditing>` a `components` resolver. That is the whole hook this layer
// hangs on. Everything the resolver returns renders INSIDE the preview iframe,
// in the site's bundle, positioned over the element's outline.
//
// THREE FACTS ABOUT THE HOST, all read out of the pinned 5.4.5 source:
//
//   1. The resolver only runs while the optimistic actor is ready, and the
//      overlay only draws for hovered or focused elements. So "these controls
//      exist only in Edit mode, only on the thing you are pointing at" needs no
//      gate of our own; it is how the host already behaves.
//   2. The overlay layer is `pointer-events: none`. Anything clickable must be
//      wrapped in the `PointerEvents` component the host passes in as a prop.
//      It is the opt-in, and it also marks the node as overlay chrome rather
//      than page content.
//   3. Each control renders as a child of the element's outline box, which is
//      absolutely positioned at the element's rect. So `position: absolute` in
//      a control means "the corner of the outline", not a measuring exercise.
//
// AND ONE THAT COST A DEPLOYED BUG (presacademy, 2026-08-28): a custom
// component only mounts on a node the Studio schema resolves to a FIELD. A bare
// array-item path yields no resolver context, so a control can never hang off a
// section wrapper. Every path this site offers a control on is a real top-level
// field on the page document, so that trap is out of reach here - but it is the
// reason `overlayControlsForPath` refuses anything longer than one segment
// rather than trying to be clever about array items.
//
// The decision about WHICH control an element gets is pure and lives in
// src/lib/page-fields.ts, where it is drift-gated against the schemas. This
// file is only the wiring.
// =============================================================================
import type { OverlayComponent, OverlayComponentResolver } from '@sanity/visual-editing';
import { overlayControlsForPath, type OverlayControl } from '@/lib/page-fields';
import TextPopover from './TextPopover.tsx';

const BY_CONTROL: Record<OverlayControl, OverlayComponent> = {
  text: TextPopover as OverlayComponent,
};

/**
 * Hand every pointed-at element the control its path makes it a candidate for.
 * Returning undefined - the common case, for every element that is not one of
 * the registered lines - leaves the host's own overlay exactly as it was.
 */
export const inCanvasControls: OverlayComponentResolver = (context) => {
  const path = (context.node as { path?: string } | undefined)?.path;
  const controls = overlayControlsForPath(path);
  if (controls.length === 0) return undefined;
  return controls.map((name) => BY_CONTROL[name]);
};
