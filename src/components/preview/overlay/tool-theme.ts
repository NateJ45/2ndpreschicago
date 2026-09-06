// Safe to edit by hand
// =============================================================================
// tool-theme - the ONE per-repo thing about the in-canvas controls (card 28)
// =============================================================================
// `styles.ts` beside this file is canonical: every repo in the family draws the
// same tool chrome, and the shapes, radii, shadows and spacing are shared. The
// only thing that is genuinely this project's own is the six values below, so
// they live here, alone, and a fork edits this file and nothing else.
//
// FIXED, AND SURFACE-INDEPENDENT ON PURPOSE. These controls float over the page,
// so they have to read as TOOLS rather than as content: a white card still reads
// as a control on Linen, on a photo, and on the indigo closing band, while an
// indigo card on that band would read as part of the design. The values are
// written as LITERALS rather than `var(--color-...)` for the same reason.
//
// The hexes are this site's own brand tokens from src/styles/globals.css:
//   Heirloom Ink    #26312E  the text, and the filled state of a pressed control
//   Secondary Taupe #5A5148  captions and hints, 6.72:1 on Linen
//   Mulish          the body face
// A rebrand that moves the ink or the body face should update this file in the
// same pass. Nothing breaks if it does not; the controls simply stay neutral.
// =============================================================================

/** The palette and type the canonical `styles.ts` draws every control with. */
export interface ToolTheme {
  /** Card and button background. */
  paper: string;
  /** Text, and the filled state of a pressed control. */
  ink: string;
  /** Captions and secondary text. */
  muted: string;
  /** Hairline borders. */
  line: string;
  /** The drop shadow that lifts a floating card off the page. */
  shadow: string;
  /** The font stack, matching the site's body face. */
  font: string;
}

export const TOOL: ToolTheme = {
  paper: '#FFFFFF',
  ink: '#26312E',
  muted: '#5A5148',
  line: 'rgba(38, 49, 46, 0.14)',
  shadow: '0 6px 20px rgba(38, 49, 46, 0.22), 0 1px 2px rgba(38, 49, 46, 0.16)',
  font: '"Mulish Variable", system-ui, -apple-system, sans-serif',
};
