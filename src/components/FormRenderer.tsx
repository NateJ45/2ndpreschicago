// Renders a configurable `form` document. Native mode builds inputs from
// form.fields and submits to the form's provider; embed mode delegates to <Embed>.
//
// Submit resolution (native): Web3Forms (form.provider.accessKey || PUBLIC_WEB3FORMS_KEY)
// -> Formspree (provider.accessKey as form id) -> mailto: fallback (provider.notifyEmail
// || fallbackEmail) so a freshly-seeded keyless form still reaches the church.
// A11y + honeypot patterns match NewsletterSignup.tsx.

import { useRef, useState, type FormEvent } from 'react';
import Embed from './Embed';

export interface FormFieldDef {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  width?: 'full' | 'half';
}

export interface FormDoc {
  _id?: string;
  title?: string;
  heading?: string;
  intro?: string;
  mode?: 'native' | 'embed';
  fields?: FormFieldDef[];
  submitLabel?: string;
  successMessage?: string;
  consentNote?: string;
  provider?: {
    service?: 'web3forms' | 'formspree' | 'email';
    accessKey?: string;
    notifyEmail?: string;
  };
  embedUrl?: string | null;
  embedHtml?: string | null;
}

interface Props {
  form: FormDoc;
  /** Site contact email, used as the final mailto fallback. */
  fallbackEmail?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ENV_WEB3FORMS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined;

const inputCls =
  'w-full px-s py-s border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]';

// A <select> keeps the same box but carries NO focus utilities of its own, so
// the global `:focus-visible { outline: 2px solid var(--ring) }` in globals.css
// is what draws its indicator.
//
// Why it cannot use the ring above: Tailwind's focus:ring-* compiles to a
// box-shadow, and WebKit renders native form controls itself and drops
// box-shadow on them. The `focus:outline-none` that pairs with the ring then
// suppressed the global outline too, so both selects on the Sanity forms had
// NO visible focus indicator at all in Safari and iOS, a WCAG 2.4.7 failure.
// Measured in a real WebKit on 2026-09-06 rather than assumed: the select does
// enter :focus and :focus-visible, but its computed box-shadow stays `none`
// while focused, on the same class every passing text field carries.
//
// The global outline is the same indicator every other focusable thing on the
// site already uses, is theme-reactive, and paints on native controls in every
// engine. Do not add focus:outline-none back here.
const selectCls =
  'w-full px-s py-s border border-input bg-background text-foreground rounded-md min-h-[44px]';

export default function FormRenderer({ form, fallbackEmail }: Props) {
  if (!form) return null;

  // ---- Embed mode -------------------------------------------------------
  if (form.mode === 'embed') {
    const hasEmbed = form.embedUrl || form.embedHtml;
    if (!hasEmbed) return null;
    return (
      <div>
        {form.heading && <h2 className="font-display text-h3 text-foreground">{form.heading}</h2>}
        {form.intro && <p className="mt-s leading-relaxed text-foreground/80">{form.intro}</p>}
        <div className="mt-m">
          <Embed
            mode={form.embedUrl ? 'url' : 'html'}
            url={form.embedUrl ?? undefined}
            html={form.embedHtml ?? undefined}
            title={form.heading || form.title}
          />
        </div>
      </div>
    );
  }

  // ---- Native mode ------------------------------------------------------
  const fields = form.fields ?? [];
  const submitLabel = form.submitLabel || 'Send';
  const successMessage = form.successMessage || 'Thank you. We will be in touch soon.';
  const consentNote = form.consentNote;
  const service = form.provider?.service || 'web3forms';
  const accessKey = form.provider?.accessKey || ENV_WEB3FORMS_KEY;
  const notifyEmail = form.provider?.notifyEmail || fallbackEmail;

  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [botcheck, setBotcheck] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  function setField(name: string, value: string | boolean) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function firstMissingRequired(): FormFieldDef | null {
    for (const f of fields) {
      if (!f.required) continue;
      const v = values[f.name];
      if (f.type === 'checkbox') {
        if (!v) return f;
        continue;
      }
      if (!v || (typeof v === 'string' && !v.trim())) return f;
      if (f.type === 'email' && typeof v === 'string' && !/.+@.+\..+/.test(v)) return f;
    }
    return null;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    if (botcheck) {
      setStatus('success');
      return;
    } // honeypot

    const missing = firstMissingRequired();
    if (missing) {
      setErrorMsg(`Please complete the "${missing.label}" field.`);
      formRef.current?.querySelector<HTMLElement>(`[name="${missing.name}"]`)?.focus();
      return;
    }

    // mailto path: service=email, or no key configured for web3forms/formspree.
    const needsKey = service === 'web3forms' || service === 'formspree';
    if (service === 'email' || (needsKey && !accessKey)) {
      const to = notifyEmail || '';
      const subject = encodeURIComponent(`${form.title || 'Website'} inquiry`);
      const body = encodeURIComponent(
        fields.map((f) => `${f.label}: ${formatVal(values[f.name])}`).join('\n'),
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      setStatus('success');
      return;
    }

    setStatus('submitting');
    try {
      let ok = false;
      if (service === 'formspree') {
        const res = await fetch(`https://formspree.io/f/${accessKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(plainValues(values)),
        });
        ok = res.ok;
      } else {
        const res = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `${form.title || 'Website'} inquiry`,
            from_name: 'Second Presbyterian website',
            ...plainValues(values),
          }),
        });
        const json = await res.json().catch(() => ({}));
        ok = res.ok && (json as Record<string, unknown>).success !== false;
      }
      if (ok) setStatus('success');
      else {
        setStatus('error');
        setErrorMsg(
          'Something went wrong sending your message. Please try again, or email us directly.',
        );
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the server. Check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-primary bg-muted p-l"
      >
        <p className="font-display text-h4 text-foreground">{successMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {form.heading && <h2 className="font-display text-h3 text-foreground">{form.heading}</h2>}
      {form.intro && <p className="mt-s leading-relaxed text-foreground/80">{form.intro}</p>}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="mt-m"
        aria-busy={status === 'submitting'}
      >
        {/* honeypot */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
        >
          <label>
            Leave blank
            <input
              type="text"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              value={botcheck}
              onChange={(e) => setBotcheck(e.target.value)}
            />
          </label>
        </div>

        {errorMsg && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-s rounded-md border border-destructive bg-destructive/10 p-s text-sm text-foreground"
          >
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-s sm:grid-cols-2">
          {fields.map((f) => {
            const id = `f-${f.name}`;
            const span = f.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2';
            if (f.type === 'checkbox') {
              return (
                <div key={f.name} className={`${span} flex items-start gap-s`}>
                  <input
                    id={id}
                    name={f.name}
                    type="checkbox"
                    checked={!!values[f.name]}
                    onChange={(e) => setField(f.name, e.target.checked)}
                    className="mt-1 h-5 w-5"
                  />
                  <label htmlFor={id} className="text-sm text-foreground">
                    {f.label}
                    {f.required && ' *'}
                  </label>
                </div>
              );
            }
            return (
              <div key={f.name} className={span}>
                <label htmlFor={id} className="mb-1 block text-sm font-semibold text-foreground">
                  {f.label}
                  {f.required && ' *'}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    id={id}
                    name={f.name}
                    rows={4}
                    placeholder={f.placeholder}
                    value={(values[f.name] as string) || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className={inputCls}
                  />
                ) : f.type === 'select' ? (
                  <select
                    id={id}
                    name={f.name}
                    value={(values[f.name] as string) || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select…</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(values[f.name] as string) || ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className={inputCls}
                  />
                )}
                {f.helpText && <p className="mt-1 text-xs text-foreground/80">{f.helpText}</p>}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="press-tactile mt-m inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-l py-s text-xs font-semibold tracking-[0.18em] text-primary-foreground uppercase transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : submitLabel}
        </button>
      </form>

      {consentNote && (
        <p className="mt-s text-xs leading-relaxed text-foreground/80">
          {consentNote.includes('privacy policy') ? (
            <>
              {consentNote.replace('privacy policy', '').trimEnd()}{' '}
              <a
                href="/privacy"
                className="underline underline-offset-2 transition-colors hover:text-link"
              >
                privacy policy
              </a>
              .
            </>
          ) : (
            consentNote
          )}
        </p>
      )}
    </div>
  );
}

function formatVal(v: string | boolean | undefined): string {
  if (v === true) return 'Yes';
  if (v === false || v == null) return '';
  return String(v);
}
function plainValues(values: Record<string, string | boolean>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) out[k] = formatVal(v);
  return out;
}
