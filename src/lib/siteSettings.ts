// Foundation, edit with care
// Single source of truth for resolving the Sanity siteSettings document into the
// identity / contact / social values the header, footer, pages, and JSON-LD all
// render.
//
// Why this exists: every consumer used to re-implement its own
// `siteSettings?.field ?? site.contact.field` resolution. Four copies drifted
// (the footer office-hours never read Sanity at all; the JSON-LD YouTube link was
// hardcoded; the header showed two socials, the footer three). Worse, the
// `?? site.*` fallbacks meant an empty Sanity field silently rendered the
// hardcoded value in src/data/site.ts, so you could never tell from the page
// whether Sanity was actually driving the content.
//
// Rule now: NO component or page reads siteSettings identity/contact/social fields
// directly, and NOTHING imports site.contact / site.social (both deleted). Call
// resolveSiteSettings(raw) and read from the returned object. There is exactly one
// place — here — that decides what each field resolves to:
//
//   - Required identity (church name, email, phone, address, socials): read
//     straight from Sanity. Empty stays empty (renders blank) so a missing value
//     is visible, never masked by a hardcoded default.
//   - Hide-when-empty (officeHours): undefined when blank; callers hide the
//     element rather than show a stand-in.
//   - Derived-from-Sanity defaults (mission -> tagline, pastorEmail -> public
//     email, give link -> /give page, watch link -> /sermons page): a sensible
//     value computed from OTHER Sanity fields or an internal route, never from a
//     hardcoded church-specific literal.
//
// brandName is the one exception that still falls back to src/data/site.ts
// (site.name): the church name is a required Sanity field, so the fallback is an
// unreachable crash-guard, and site.name remains the static identity used by
// <title>/OG meta in BaseLayout.

import { site } from '@/data/site';
import type { WorshipService } from './serviceTime';

/** The raw siteSettings fields this resolver consumes (from getSiteSettings()). */
export interface RawSiteSettings {
  title?: string | null;
  tagline?: string | null;
  mission?: string | null;
  email?: string | null;
  pastorEmail?: string | null;
  phone?: string | null;
  officeHours?: string | null;
  addressLine?: string | null;
  cityStateZip?: string | null;
  worshipService?: WorshipService | null;
  giveUrl?: string | null;
  watchUrl?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialYoutube?: string | null;
}

export interface ResolvedSiteSettings {
  /** Church name. Required in Sanity; site.name is an unreachable crash-guard. */
  brandName: string;
  tagline: string;
  /** Footer mission line. Falls back to the tagline when unset. */
  mission: string;
  /** Public email. Empty string when unset (callers guard with `email &&`). */
  email: string;
  /** Pastoral-care email. Falls back to the public email when unset. */
  pastorEmail: string;
  /** Public phone. Empty string when unset (callers guard with `phone &&`). */
  phone: string;
  /** Office hours. undefined when unset — hide the element, don't substitute. */
  officeHours?: string;
  addressLine: string;
  cityStateZip: string;
  /** "1936 South Michigan Ave, Chicago, IL 60616" for maps + structured data. */
  fullAddress: string;
  /** Google Maps directions link built from the resolved address. */
  mapHref: string;
  /** Passed straight through to serviceTime() for the display strings. */
  worshipService: WorshipService | null;
  /** Where the "Give" button points: the giving portal, else the /give page. */
  giveHref: string;
  /** Where "Watch" points: the livestream URL, else the /sermons page. */
  watchHref: string;
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

const DEFAULT_TAGLINE = 'Serving and celebrating Jesus for the good of the world.';

/** Trim a Sanity string; treat blank/whitespace-only/missing as "unset". */
function clean(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function resolveSiteSettings(raw?: RawSiteSettings | null): ResolvedSiteSettings {
  const s = raw ?? {};

  const tagline = clean(s.tagline) ?? DEFAULT_TAGLINE;
  const email = clean(s.email) ?? '';
  const addressLine = clean(s.addressLine) ?? '';
  const cityStateZip = clean(s.cityStateZip) ?? '';
  const fullAddress = [addressLine, cityStateZip].filter(Boolean).join(', ');

  return {
    brandName: clean(s.title) ?? site.name,
    tagline,
    mission: clean(s.mission) ?? tagline,
    email,
    pastorEmail: clean(s.pastorEmail) ?? email,
    phone: clean(s.phone) ?? '',
    officeHours: clean(s.officeHours),
    addressLine,
    cityStateZip,
    fullAddress,
    mapHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
    worshipService: s.worshipService ?? null,
    giveHref: clean(s.giveUrl) ?? '/give',
    watchHref: clean(s.watchUrl) ?? '/sermons',
    social: {
      instagram: clean(s.socialInstagram),
      facebook: clean(s.socialFacebook),
      youtube: clean(s.socialYoutube),
    },
  };
}
