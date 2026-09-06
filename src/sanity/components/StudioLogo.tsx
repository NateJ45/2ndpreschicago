// StudioLogo.tsx — Logo + wordmark for the Sanity Studio header.
// Rendered in the top-left of the Studio UI in place of the default Sanity logo:
// the church building mark (same image as the site favicon) on a small paper chip,
// next to "Second Presbyterian" in the display serif. The mark sits on a light chip
// so the black silhouette always has contrast, whether the Studio chrome is light
// or dark; the wordmark inherits the header's text color for the same reason.
// The font is loaded by StudioLayout; Georgia is a graceful serif fallback.
// Safe to edit by hand.
//
// The PNG import resolves through ASTRO's asset pipeline now that the Studio
// lives in the site package (folded 2026-09-06, PORTS.md card 10), so it yields
// an ImageMetadata object rather than a bare URL string: hence `churchMark.src`.
// presacademy's copy of this component reads the same way for the same reason.

import React from 'react';
import churchMark from './church-mark.png';

export default function StudioLogo() {
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          borderRadius: '7px',
          background: '#FBF8F2',
          border: '1px solid rgba(54, 48, 42, 0.12)',
          flex: 'none',
        }}
      >
        <img
          src={churchMark.src}
          alt=""
          aria-hidden="true"
          style={{ height: '22px', width: 'auto', display: 'block' }}
        />
      </span>
      <span
        style={{
          fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
          fontSize: '1.15rem',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}
      >
        Second Presbyterian
      </span>
    </span>
  );
}
