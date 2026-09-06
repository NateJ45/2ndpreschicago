// Theme-token contrast gate (added 2026-08-27 alongside src/lib/contrast.ts,
// ported from ncs-astro-sanity-starter; PORTS.md card 9).
//
// WHY: the @theme palette in globals.css is the design seam a project is meant
// to edit. Nothing else in the gate chain notices when a palette change pushes
// body text under 4.5:1 -- axe audits the resting DOM of a built page and has no
// rule for token pairs, and Lighthouse can sit at 100 while a heading is
// unreadable on its own surface. This test reads the real tokens out of
// globals.css and asserts the pairs the design system actually puts on screen,
// so a bad reskin fails `npm test` before anyone looks at a screenshot.
//
// SCOPE: the light @theme block only. Those tokens are plain hex, so the check
// is nearly free. The shadcn :root/.dark overrides are authored in oklch with
// alpha and would need a colour-space conversion to check the same way; that is
// a bigger job and is deliberately NOT attempted here. Dark-mode pairs stay
// covered by the visual pass.
//
// PER-SITE ADAPTATION (2026-08-27, this repo)
// The starter asserts --color-primary at AA body text on both paper surfaces.
// Here that pair is 3.95:1 on --color-bg and 4.49:1 on --color-bg-soft, and it
// is NOT a bug: this palette splits the bronze in two. --color-primary is the
// interactive accent (button fills, icons, borders, focus rings, hover states)
// and --color-primary-dark is the anchor/link TEXT colour. So primary is
// asserted at the AA_NON_TEXT 3:1 threshold for UI components, and primary-dark
// carries the body-text assertion. If a future change ever sets body copy in
// --color-primary, this file is wrong and the token pair is wrong: move the
// pair up to TEXT_ON_SURFACE and darken the token until it passes.
//
// NOT asserted: --color-secondary (1.88:1) and --color-tertiary (2.19:1) on the
// paper surfaces, and --color-gold (3.02:1 on --color-bg). All three are
// hairline dividers, eyebrow rules and small decorative accents by design, not
// UI component boundaries and not text. Any token that starts being used for a
// FOCUS RING or a control edge must be added here with AA_NON_TEXT.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  contrastRatio,
  hexToRgb,
  relativeLuminance,
  flatten,
  rgbToHex,
  AA_BODY_TEXT,
  AA_NON_TEXT,
} from './contrast.ts';

const CSS = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'styles', 'globals.css');

/** Pull the hex `--color-*` declarations out of the @theme block. */
function readTokens(): Record<string, string> {
  const css = readFileSync(CSS, 'utf8');
  const tokens: Record<string, string> = {};
  for (const m of css.matchAll(/--(color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

const tokens = readTokens();

/** Read a token, failing loudly rather than silently skipping a pair. */
function token(name: string): string {
  const value = tokens[name];
  assert.ok(value, `globals.css @theme is missing --${name}`);
  return value;
}

test('contrast math matches the WCAG reference points', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
  // Shorthand hex expands.
  assert.equal(contrastRatio('#fff', '#000'), 21);
  // Luminance is symmetric in the ratio, order must not matter.
  assert.equal(contrastRatio('#36302A', '#ECE4DA'), contrastRatio('#ECE4DA', '#36302A'));
  assert.throws(() => hexToRgb('not-a-colour'));
  assert.ok(relativeLuminance(hexToRgb('#ffffff')) > relativeLuminance(hexToRgb('#000000')));
});

test('flatten composites a translucent colour over its backdrop', () => {
  // White at 12% over near-black is what a dark-theme hairline really is.
  const composited = flatten(hexToRgb('#ffffff'), 0.12, hexToRgb('#000000'));
  assert.equal(rgbToHex(composited), '#1f1f1f');
  // Fully opaque returns the foreground untouched.
  assert.deepEqual(flatten(hexToRgb('#36302A'), 1, hexToRgb('#ffffff')), hexToRgb('#36302A'));
});

// Text tokens on the two paper surfaces, at the AA body-text threshold.
const TEXT_ON_SURFACE: Array<[string, string]> = [
  ['color-accent', 'color-bg'], // Espresso Ink: headings + body on paper
  ['color-accent', 'color-bg-soft'], // same on the alternating surface
  ['color-accent-dark', 'color-bg'],
  ['color-accent-dark', 'color-bg-soft'],
  ['color-primary-dark', 'color-bg'], // Bronze Dark: the anchor/link text colour
  ['color-primary-dark', 'color-bg-soft'],
  ['color-chapel', 'color-bg'], // chapel green as text/heading accent on paper
  ['color-chapel', 'color-bg-soft'],
];

for (const [fg, bg] of TEXT_ON_SURFACE) {
  test(`--${fg} on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// Reversed-out text: what actually sits on each dark brand surface. White on
// the espresso/bronze surfaces, warm cream on the chapel greens (the chapel
// surfaces are always paired with --color-chapel-foreground, in both themes).
const REVERSED: Array<[string, string]> = [
  ['color-white-pure', 'color-primary-dark'],
  ['color-white-pure', 'color-accent'],
  ['color-white-pure', 'color-accent-dark'],
  ['color-chapel-foreground', 'color-chapel'],
  ['color-chapel-foreground', 'color-chapel-deep'],
];

for (const [fg, bg] of REVERSED) {
  test(`--${fg} on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// UI components and their states: icons, button fills, control edges and focus
// rings drawn in --color-primary. SC 1.4.11 is 3:1, not 4.5:1. See the
// per-site adaptation note at the top of this file for why primary is here and
// not in TEXT_ON_SURFACE.
const UI_ON_SURFACE: Array<[string, string]> = [
  ['color-primary', 'color-bg'],
  ['color-primary', 'color-bg-soft'],
];

for (const [fg, bg] of UI_ON_SURFACE) {
  test(`--${fg} on --${bg} meets AA non-text (UI components)`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_NON_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_NON_TEXT}:1`,
    );
  });
}

// The primary button: white label on a bronze fill is the single most-used
// control on the site, so it gets its own assertion rather than riding on the
// surface pairs above.
test('--color-white-pure on the --color-primary button fill meets AA body text', () => {
  const ratio = contrastRatio(token('color-white-pure'), token('color-primary'));
  assert.ok(
    ratio >= AA_BODY_TEXT,
    `white on --color-primary (${token('color-primary')}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
  );
});
