// Foundation, edit with care
// =============================================================================
// CMS content client - for the Studio-only PREVIEW path (/preview/*)
// (ported from mas-monograms 2026-09-06, PORTS.md card 10; original lineage:
// ncs-astro-sanity-starter, presacademy and the WCP site)
// =============================================================================
// Unlike src/lib/sanity.ts (which reads once at BUILD time for the static public
// pages), this client runs per request on `prerender = false` preview routes and
// must read live DRAFT content, so the token comes from the Worker runtime env
// (`cloudflare:workers`), never from a build-time var. Never import this from a
// prerendered page.
//
// perspective/stega both switch on `draftMode`, which callers derive from the
// presence of the Presentation Tool's perspective cookie. There is deliberately
// no fallback argument here (unlike sanityFetch): a preview page should show
// real Sanity state, including empty and missing fields, so an editor notices a
// gap instead of silently seeing built-in fallback copy.
//
// FAILS CLOSED with no token: the client is built without credentials and Sanity
// refuses the draft perspective, so the preview route errors rather than quietly
// serving published content dressed as a draft.
// =============================================================================
import { createClient, type SanityClient } from '@sanity/client';
import { env } from 'cloudflare:workers';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
export const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
export const apiVersion = (import.meta.env.PUBLIC_SANITY_API_VERSION as string) || '2026-05-01';

// -----------------------------------------------------------------------------
// The runtime token
// -----------------------------------------------------------------------------
// PER-SITE ADAPTATION (2026-09-06). The family names this runtime secret
// SANITY_TOKEN, and that is the name to prefer; it is set on both the production
// and the staging Worker. This project ALSO ships a build-time read token named
// SANITY_API_READ_TOKEN (see CLAUDE.md "Worker secrets"), so both names are
// accepted and whichever exists wins. Nobody has to keep two copies of the same
// token in sync. A READ token is sufficient: nothing in the preview path writes.
function previewToken(): string | undefined {
  const e = env as { SANITY_TOKEN?: string; SANITY_API_READ_TOKEN?: string };
  return e.SANITY_TOKEN || e.SANITY_API_READ_TOKEN;
}

// -----------------------------------------------------------------------------
// Setup guard: FAIL CLOSED, but say why
// -----------------------------------------------------------------------------
// This site builds and serves its whole public surface with no runtime token at
// all, because every public page is statically built. The preview stack cannot
// fall back to anything: with no project id the Sanity client constructor throws,
// and with no token the draft perspective is refused. Left alone that surfaces as
// a bare 500 with a stack trace in the Worker log, which reads like a broken
// deploy rather than "this is not set up yet". So every preview entry point
// checks here first and answers with the missing pieces named. Keep it a 503: the
// route is fine, the service behind it is not configured.
const PLACEHOLDER_IDS = new Set(['', 'your-project-id', 'placeholder', 'placeholder-project-id']);

/** Whether the preview routes can do anything at all in this environment. */
export function previewConfig(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!projectId || PLACEHOLDER_IDS.has(projectId.trim())) {
    missing.push('PUBLIC_SANITY_PROJECT_ID (build-time, .env)');
  }
  if (!previewToken()) {
    missing.push(
      'SANITY_TOKEN or SANITY_API_READ_TOKEN (Worker runtime secret, .dev.vars locally)',
    );
  }
  return { ok: missing.length === 0, missing };
}

/** The 503 every preview entry point returns when setup is incomplete. */
export function previewUnconfiguredResponse(missing: string[]): Response {
  return new Response(
    'Live preview is not configured yet.\n\n' +
      'Missing:\n' +
      missing.map((m) => `  - ${m}`).join('\n') +
      '\n\nSee .env.example and .dev.vars.example. The embedded Studio also needs\n' +
      'this origin on the project CORS allow list:\n' +
      '  npx sanity cors add <origin> --credentials\n',
    { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
}

// -----------------------------------------------------------------------------
// NON_STEGA_FIELDS - the single most important list in the preview stack
// -----------------------------------------------------------------------------
// Fields chosen from a fixed dropdown or radio in the schema. NEVER free text an
// editor types, and never displayed as prose. They drive class and component
// selection in the renderers (the section blocks branch on `tone`, `padding`,
// `mediaType` and `width`; links on `linkType`; the events list on `eventType`).
//
// Stega encodes a ~1KB run of INVISIBLE marker characters into every string it
// touches so click-to-edit knows which field to open. On a display string that is
// the whole point; on one of these it silently breaks the exact-string comparison
// (`"internal" + <markers>` !== `"internal"`), so the preview mis-renders while
// the live static site is fine. Excluding them costs nothing: you pick these from
// a list, there is no text to click into.
//
// ADD ANY NEW LOGIC-DRIVING DROPDOWN FIELD HERE THE DAY YOU ADD THE FIELD.
// Derived by scanning every `options: { list: ... }` field in
// src/sanity/schemaTypes/ on 2026-09-06, then unioned with the names the rest of
// the family uses so a block ported in from a sibling repo is covered on arrival.
// -----------------------------------------------------------------------------
const NON_STEGA_FIELDS = new Set([
  // Present in THIS repo's schemas today.
  'audience',
  'category',
  'eventType',
  'linkType',
  'liturgicalSeason',
  'mode',
  'season',
  'service',
  'type',
  // Standard enum names across the site family. Carried so a section ported from
  // a sibling repo is not a preview-only bug waiting to be found. Several are
  // already in use here (align, columns, imageSide, mediaSide, mediaType,
  // padding, source, style, tone, width).
  'align',
  'aspect',
  'businessModel',
  'businessType',
  'colorFamily',
  'columns',
  'days',
  'format',
  'headingLevel',
  'heightHint',
  'icon',
  'imageSide',
  'layout',
  'mediaSide',
  'mediaType',
  'navGroup',
  'overlay',
  'padding',
  'platform',
  'priceRange',
  'ratio',
  'size',
  'source',
  'sourceType',
  'style',
  'styleTag',
  'surface',
  'tone',
  'variant',
  'width',
]);

export function getPreviewClient(draftMode: boolean): SanityClient {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: previewToken(),
    perspective: draftMode ? 'drafts' : 'published',
    stega: {
      enabled: draftMode,
      studioUrl: '/studio',
      // Encode display strings (click-to-edit) but skip the dropdown fields
      // above, whose exact values are used in rendering logic.
      filter: (props) =>
        NON_STEGA_FIELDS.has(String(props.sourcePath.at(-1))) ? false : props.filterDefault(props),
    },
  });
}

/** Run a GROQ query with the draft-aware preview client. */
export async function previewFetch<T>(
  draftMode: boolean,
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return getPreviewClient(draftMode).fetch<T>(query, params);
}
