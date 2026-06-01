// StudioLogo.tsx — Wordmark for the Sanity Studio header.
// Rendered in the top-left of the Studio UI in place of the default Sanity logo.
// The church brand is typographic (Instrument Serif), matching the site header
// wordmark, so this is text rather than an image. The font is loaded by
// StudioLayout; Georgia is a graceful serif fallback while it arrives.
// Safe to edit by hand.

import React from 'react';

export default function StudioLogo() {
  return (
    <span
      style={{
        fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
        fontSize: '1.15rem',
        fontWeight: 400,
        letterSpacing: '0.01em',
        color: '#F1EAD9',
        whiteSpace: 'nowrap',
      }}
    >
      Second Presbyterian
    </span>
  );
}
