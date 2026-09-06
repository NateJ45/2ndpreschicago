// Foundation, edit with care
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation';
import { Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { LaunchIcon } from '@sanity/icons';
import { SINGLETON_PAGES, SINGLETON_PREVIEW_PATHS, toPreviewPath } from '../urls';
import { startNav, stepNav, type PendingNav } from '../../lib/preview-navigation';
import { LiveDraftBridge } from './LiveDraftBridge';

// =============================================================================
// PreviewNavigator - the Squarespace-style page list beside the live preview
// (ported from mas-monograms 2026-09-06, PORTS.md card 10; original lineage:
// ncs-astro-sanity-starter)
// =============================================================================
// Docked to the left of the Presentation tool (components.unstable_navigator).
// Click a page and the preview jumps there while the edit panel follows
// (Presentation resolves the URL through resolve.mainDocuments).
//
//  - Status dots: amber = published with unpublished edits, hollow = never
//    published. Answers "did my change go live?" at a glance.
//  - A live-page link per published row.
//  - Site settings pinned at the bottom.
//
// PER-SITE ADAPTATION (2026-09-06). The starter's copy carries a whole page-ops
// layer with this list (duplicate / archive / add-section / share-link, cards 21,
// 24, 25 and 19), none of which is ported here yet. mas-monograms stripped it to
// a static singleton list because that site has no `page` type at all.
//
// This site DOES have a `page` type (editor-created custom pages at /<slug>), so
// the list has two groups: the fixed site pages, and whatever custom pages exist,
// fetched once alongside them. There is deliberately no "New page" button and no
// client.listen subscription: creating a page is a Structure-tool gesture here,
// and adding the ops layer means porting cards 21 and 24 first. Restore them
// from the starter on the day those cards land.

const APIV = '2026-05-01';

// Pages in the order a visitor meets them, derived from the one page map in
// ../urls.ts. The doc id equals the type (the desk structure's singleton
// convention).
const MAIN_PAGES: { type: string; label: string }[] = SINGLETON_PAGES.map(({ type, label }) => ({
  type,
  label,
}));

// Live path per singleton (preview path minus the /preview prefix).
const livePathFor = (type: string) => {
  const href = SINGLETON_PREVIEW_PATHS[type];
  if (!href) return undefined;
  return href === '/preview' ? '/' : href.replace(/^\/preview/, '');
};

interface NavRow {
  id: string;
  type: string;
  label: string;
  href: string;
  liveHref?: string;
  hasDraft: boolean;
  hasPublished: boolean;
  /** True for an editor-created `page` doc, false for a fixed site page. */
  custom: boolean;
}

async function fetchRows(client: ReturnType<typeof useClient>): Promise<NavRow[]> {
  // Raw perspective on purpose: we need BOTH twins for the status dots. One
  // query covers the singletons and the custom pages; the custom ones also carry
  // their title and slug, which the singletons do not need.
  const docs = await client.fetch<{ _id: string; _type: string; title?: string; slug?: string }[]>(
    '*[_type in $types || _type == "page"]{ _id, _type, title, "slug": slug.current }',
    { types: MAIN_PAGES.map((p) => p.type) },
  );

  const byType = new Map<string, { draft: boolean; published: boolean }>();
  for (const d of docs) {
    if (d._type === 'page') continue;
    const isDraft = d._id.startsWith('drafts.');
    const prev = byType.get(d._type) ?? { draft: false, published: false };
    byType.set(d._type, {
      draft: prev.draft || isDraft,
      published: prev.published || !isDraft,
    });
  }

  const singletonRows: NavRow[] = MAIN_PAGES.map(({ type, label }) => ({
    id: type, // singleton doc id == type
    type,
    label,
    href: SINGLETON_PREVIEW_PATHS[type],
    liveHref: byType.get(type)?.published ? livePathFor(type) : undefined,
    hasDraft: byType.get(type)?.draft ?? false,
    hasPublished: byType.get(type)?.published ?? false,
    custom: false,
  }));

  // Custom `page` docs, collapsed across their draft/published twins by slug so
  // an unpublished edit shows as one row with an amber dot rather than two rows.
  const bySlug = new Map<string, NavRow>();
  for (const d of docs) {
    if (d._type !== 'page' || !d.slug) continue;
    const isDraft = d._id.startsWith('drafts.');
    const prev = bySlug.get(d.slug);
    const row: NavRow = prev ?? {
      id: d._id.replace(/^drafts\./, ''),
      type: 'page',
      label: d.title || d.slug,
      href: toPreviewPath(`/${d.slug}`),
      liveHref: undefined,
      hasDraft: false,
      hasPublished: false,
      custom: true,
    };
    row.hasDraft = row.hasDraft || isDraft;
    row.hasPublished = row.hasPublished || !isDraft;
    if (!isDraft) row.liveHref = `/${d.slug}`;
    if (d.title) row.label = d.title;
    bySlug.set(d.slug, row);
  }

  return [...singletonRows, ...[...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label))];
}

/** Amber = live page with unpublished edits; hollow = never published. */
function StatusDot({ row }: { row: NavRow }) {
  if (!row.hasDraft) return null;
  const unpublished = !row.hasPublished;
  return (
    <span
      title={unpublished ? 'Not published yet' : 'Has unpublished edits'}
      style={{
        flexShrink: 0,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: unpublished ? 'transparent' : '#B98A3E',
        border: unpublished ? '1.5px solid #9aa4b2' : 'none',
      }}
    />
  );
}

export function PreviewNavigator() {
  const client = useClient({ apiVersion: APIV });
  const navigate = usePresentationNavigate();
  const params = usePresentationParams();
  const [rows, setRows] = useState<NavRow[] | null>(null);

  const refetch = useCallback(() => {
    fetchRows(client)
      .then(setRows)
      .catch(() => setRows([]));
  }, [client]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // params.preview is the iframe's current URL; compare pathnames only.
  const current = (params.preview ?? '').split('?')[0];

  // BOUNCE-AWARE navigation (2026-08-28, editor feedback). Clicking a page took
  // two clicks every time: the panel changed, the iframe did not, the panel
  // bounced back, and the second click worked. The whole rule set, and the host
  // sources it was read out of, live in ../../lib/preview-navigation.ts; this is
  // only the timer and the navigate call. It replaces an earlier sticky retry
  // that re-issued navigate() with the SAME href, which leaves params.preview at
  // the value it already had, so the host's effect never re-ran and nothing was
  // ever posted to the frame.
  //
  // `pending` also drives the row highlight, and because it now survives the
  // bounce the list stays put instead of flickering back and forth.
  const [pending, setPending] = useState<PendingNav | null>(null);
  const go = useCallback(
    (href: string, type: string, id: string) => {
      // The updater form hands over the intent still in flight, if any - a
      // second click inside a second supersedes it, and startNav remembers
      // where it was heading so stepNav can re-issue this click when that
      // predecessor lands (the swallowed-click fix, 2026-08-29).
      setPending((prev) => startNav(href, type, id, current, Date.now(), prev?.href));
      navigate(href, { type, id });
    },
    [navigate, current],
  );
  useEffect(() => {
    if (!pending) return undefined;
    const step = () => {
      const next = stepNav(pending, current, Date.now());
      if (next.action === 'settle') {
        setPending(null);
        return;
      }
      if (next.action === 'retry' && next.pending) {
        setPending(next.pending);
        navigate(next.pending.href, { type: next.pending.type, id: next.pending.id });
        return;
      }
      // Identity is the signal: stepNav hands back the same object when nothing
      // moved, which is what keeps this effect from re-running itself forever.
      if (next.pending !== pending) setPending(next.pending);
    };
    step();
    // The window has to close on its own: params.preview can sit still for the
    // whole of it, and a stale `pending` would pin the row highlight.
    const timer = setInterval(step, 400);
    return () => clearInterval(timer);
  }, [pending, current, navigate]);

  // Which page the preview is showing, as a row. `pending` wins so the answer
  // follows the click rather than the page load, exactly as the highlight does.
  // Only used to mount the live-draft bridge below.
  const currentRow = useMemo(() => {
    if (!rows) return null;
    const href = pending?.href ?? current;
    if (!href) return null;
    return rows.find((r) => r.href === href) ?? rows.find((r) => href.endsWith(r.href)) ?? null;
  }, [rows, pending, current]);

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      {/* KEYSTROKE-INSTANT PREVIEW (2026-08-28). Renders nothing. It lives here
          because this panel is the one place inside Presentation that already
          knows WHICH page the preview is showing, and it is always mounted
          alongside the preview iframe it posts into. See ./LiveDraftBridge.tsx
          for what it sends and src/lib/preview-live-draft.ts for the contract. */}
      {currentRow && (
        <LiveDraftBridge
          key={currentRow.id}
          documentId={currentRow.id}
          documentType={currentRow.type}
        />
      )}
      <Box flex={1} padding={3} style={{ overflowY: 'auto' }}>
        <Stack gap={2}>
          <Text size={1} weight="semibold" muted style={{ textTransform: 'uppercase' }}>
            Website pages
          </Text>
          {rows === null ? (
            <Flex align="center" gap={2} padding={2}>
              <Spinner muted />
              <Text size={1} muted>
                Loading
              </Text>
            </Flex>
          ) : (
            <Stack gap={1}>
              {rows.map((r, i) => {
                const active = pending
                  ? pending.href === r.href
                  : current === r.href || (r.href !== '/preview' && current.endsWith(r.href));
                // Heading before the first editor-created page, so the fixed
                // site pages and the custom ones read as two groups.
                const startsCustom = r.custom && !rows[i - 1]?.custom;
                return (
                  <Fragment key={r.id}>
                    {startsCustom && (
                      <Box paddingTop={3} paddingBottom={1}>
                        <Text
                          size={1}
                          weight="semibold"
                          muted
                          style={{ textTransform: 'uppercase' }}
                        >
                          Custom pages
                        </Text>
                      </Box>
                    )}
                    <Flex align="center" gap={1}>
                      <Card
                        as="button"
                        flex={1}
                        padding={2}
                        radius={2}
                        tone={active ? 'primary' : 'default'}
                        pressed={active}
                        style={{ cursor: 'pointer', textAlign: 'left', minWidth: 0 }}
                        onClick={() => go(r.href, r.type, r.id)}
                      >
                        <Flex align="center" gap={2}>
                          <Text
                            size={1}
                            weight={active ? 'semibold' : 'regular'}
                            textOverflow="ellipsis"
                            style={{ flex: 1, minWidth: 0 }}
                          >
                            {r.label}
                          </Text>
                          <StatusDot row={r} />
                        </Flex>
                      </Card>
                      {r.liveHref && (
                        /* Outside the row button: a button may not nest a link.
                         Opens the REAL page in a new tab. */
                        <Button
                          as="a"
                          href={r.liveHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          mode="bleed"
                          padding={2}
                          icon={LaunchIcon}
                          title={`Open the live page (${r.liveHref})`}
                          aria-label={`Open the live page for ${r.label}`}
                        />
                      )}
                    </Flex>
                  </Fragment>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Box>
      {/* Pinned under the page list so "edit the business details" never needs a
          trip back to the Structure tool. */}
      <Box padding={3} style={{ borderTop: '1px solid var(--card-border-color, #e2e8f0)' }}>
        <Card
          as="button"
          padding={2}
          radius={2}
          style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
          onClick={() =>
            navigate(current || '/preview', { type: 'siteSettings', id: 'siteSettings' })
          }
        >
          <Text size={1}>Site settings</Text>
        </Card>
      </Box>
    </Flex>
  );
}
