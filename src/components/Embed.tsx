// Shared embed renderer. Two modes:
//   url  -> a plain <iframe> (Google Forms, calendars, maps, simple players).
//   html -> arbitrary pasted markup (Subsplash "Smart Embeds", Planning Center
//           sign-ups). We parse the markup with DOMParser and append the nodes,
//           then re-create every <script> element (copying src + attributes +
//           inline code) so the browser executes them — parsed/imported scripts
//           do NOT auto-run. Editor-only input (authenticated Studio users).
// Reused by FormRenderer (embed-mode forms) and the Phase 2 `embed` page block.

import { useEffect, useRef } from 'react';

export interface EmbedProps {
  mode: 'url' | 'html';
  url?: string | null;
  html?: string | null;
  title?: string;
  /** Aspect ratio for url iframes, e.g. "16/9". Omit for auto height. */
  aspect?: string | null;
}

export default function Embed({ mode, url, html, title, aspect }: EmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== 'html' || !html || !containerRef.current) return;
    const container = containerRef.current;
    container.replaceChildren();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    for (const node of Array.from(parsed.body.childNodes)) {
      container.appendChild(document.importNode(node, true));
    }
    // Imported scripts don't execute; re-create them so embeds load.
    for (const old of Array.from(container.querySelectorAll('script'))) {
      const next = document.createElement('script');
      for (const attr of Array.from(old.attributes)) next.setAttribute(attr.name, attr.value);
      if (old.textContent) next.textContent = old.textContent;
      old.parentNode?.replaceChild(next, old);
    }
  }, [mode, html]);

  if (mode === 'url' && url) {
    return (
      <div
        className="overflow-hidden rounded-md border border-border-soft"
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <iframe
          src={url}
          title={title || 'Embedded content'}
          loading="lazy"
          className="w-full"
          style={{ border: 0, minHeight: aspect ? undefined : 480, height: aspect ? '100%' : undefined }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  if (mode === 'html' && html) {
    return <div ref={containerRef} className="embed-html" />;
  }

  return null;
}
