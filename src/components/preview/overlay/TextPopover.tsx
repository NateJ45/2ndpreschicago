// Safe to edit by hand
// =============================================================================
// TextPopover - type the line where the line is (2026-08-28, card 28)
// =============================================================================
// Most editing is changing some words. Today that means clicking the words,
// watching the editor panel scroll to the right box, and typing there while
// looking away from the thing being changed. This is the same edit without the
// look-away: a pencil on the line, a card anchored to it, the current value
// already in the box.
//
// It writes through the optimistic document API, so there is no token in this
// bundle: the patch travels over the comlink to the parent Studio window, which
// applies it with the editor's own session, exactly as if she had typed in the
// form. That is why the change lands in the DRAFT, shows in the unpublished
// changes badge, is covered by the Studio's own undo, and still needs Publish.
//
// PLAIN TEXT ONLY, and that is the whole control. The sibling repos' version of
// this card also edits a rich twin, with bold and italic buttons. No page here
// has one (there is no `*Rich` field anywhere in the schema), so the twin half
// and the src/lib/inline-rich-write.ts it needs are deliberately not ported.
//
// The line it is allowed to edit, and what to call it, are decided in
// src/lib/page-fields.ts, where the decision is pure and drift-gated against
// the schemas. This file is the browser half only.
//
// TWO THINGS THAT COST A REAL BUG SOMEWHERE IN THIS FAMILY, both kept here:
//
//   1. `focused`, NOT `activated`. The host draws an element's overlay while it
//      is merely in the VIEWPORT, so a control gated on that would sprout a
//      pencil on every line at once.
//   2. The card keeps its OWN open state, and only three gestures close it: the
//      Save button, Escape, and focus leaving the card. `focused` is recomputed
//      on every `presentation/focus` the Studio sends back, so a card that
//      lived and died by it would vanish a beat after opening.
// =============================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import type { OverlayComponentProps } from '@sanity/visual-editing';
import { resolveTextTarget, type TextTarget } from '@/lib/page-fields';
import { setAt, unsetAt, useDraftDocument } from './useDraftDocument.ts';
import { usePopover } from './usePopover.ts';
import { TOOL, bar, button, card, caption, field, primaryButton } from './styles.ts';

export default function TextPopover(props: OverlayComponentProps): React.ReactNode {
  const { node, PointerEvents, focused } = props;
  const { read, write } = useDraftDocument(node.id);
  const [target, setTarget] = useState<TextTarget | null>(null);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);
  const { onKeyDown } = usePopover(open, cardRef, close, areaRef);

  // Resolve what this element edits, and read its current value. One read: the
  // document answers both "may this line be edited on THIS page" and "what does
  // it say right now".
  useEffect(() => {
    let alive = true;
    void read().then((doc) => {
      if (!alive) return;
      setTarget(resolveTextTarget(doc, node.path));
    });
    return () => {
      alive = false;
    };
  }, [read, node.path]);

  // Seed the box each time the card opens, so a cancelled edit is really gone.
  useEffect(() => {
    if (!open || !target || !areaRef.current) return;
    areaRef.current.value = target.text;
  }, [open, target]);

  if (!focused || !target) return null;

  const save = () => {
    const value = (areaRef.current?.value ?? '').replace(/\s+$/, '');
    const previous = target.text;
    setTarget({ ...target, text: value });
    // An emptied box UNSETS rather than storing '', which is what clearing the
    // box in the editor panel does. A stored empty string would satisfy a
    // "required" check that an absent field correctly fails.
    void write(value.trim() === '' ? unsetAt(target.path) : setAt(target.path, value)).then(
      (ok) => {
        if (!ok) setTarget((current) => (current ? { ...current, text: previous } : current));
      },
    );
    close();
  };

  return (
    <>
      <PointerEvents style={bar}>
        <button
          ref={triggerRef}
          type="button"
          style={button}
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((was) => !was);
          }}
        >
          Edit here
        </button>
      </PointerEvents>

      {open && (
        <PointerEvents style={{ position: 'absolute', left: 0, top: '100%', zIndex: 2 }}>
          <div
            ref={cardRef}
            role="dialog"
            aria-label={`Edit ${target.label}`}
            tabIndex={-1}
            style={{ ...card, position: 'static', width: '340px' }}
            onKeyDown={onKeyDown}
            onClick={(event) => event.stopPropagation()}
            onBlur={(event) => {
              // Focus leaving the card entirely is a save, the way clicking away
              // from a form field is. Focus moving BETWEEN the card's own
              // controls is not.
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) save();
            }}
          >
            <p style={{ ...caption, margin: '0 0 8px' }}>{target.label}</p>
            <textarea
              ref={areaRef}
              rows={target.rows}
              defaultValue={target.text}
              style={field}
              aria-label={target.label}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  save();
                }
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px',
                gap: '8px',
              }}
            >
              <span style={{ color: TOOL.muted, fontSize: '11px' }}>
                Enter saves. Shift and Enter starts a new line. Esc cancels.
              </span>
              <button
                type="button"
                style={primaryButton}
                onClick={(event) => {
                  event.stopPropagation();
                  save();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </PointerEvents>
      )}
    </>
  );
}
