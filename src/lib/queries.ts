// Foundation, edit with care
// GROQ queries per page + church collections. Each function returns the page
// singleton plus any auto-populated collections that page needs.
//
// Remodel note: the interior-designer queries (services, projects/portfolio,
// journal, press, business siteSettings fields, designer homePage/aboutPage
// groups) were removed. Church collections (staff, ministries) were added.
//
// Types: until `sanity typegen generate` runs, return types are `any`.
// Run `npm run typegen` after schema changes to regenerate src/lib/sanity.types.ts.

import { sanityFetch } from './sanity';

// Common Portable Text + image projection shorthand
const IMAGE_PROJECTION = `{
  ...,
  asset->,
  "alt": coalesce(alt, asset->altText, "")
}`;

const CTA_PROJECTION = `{
  ...,
  internalLink->{ _type, "slug": slug.current }
}`;

// ---- Site settings (used in BaseLayout / Header / Footer) -----------------

export async function getSiteSettings() {
  return sanityFetch(`*[_type == "siteSettings"][0]{
    title,
    tagline,
    mission,
    email,
    phone,
    serviceTimes,
    watchUrl,
    giveUrl,
    socialInstagram,
    socialFacebook,
    socialYoutube,
    seoImage${IMAGE_PROJECTION},
    footerCredit,
    footerCreditUrl,
    newsletter,
    announcement
  }`, {}, null);
}

// ---- Generic per-page hero (church page singletons) -----------------------
// One helper for every per-page singleton (worshipPage, musicPage, growPage,
// etc.). Returns the hero + SEO fields, or null when Sanity is unconfigured or
// the document doesn't exist yet, so pages fall back to their inline copy +
// built-in photo. Pass the singleton's _type, e.g. getPageHero('worshipPage').
export async function getPageHero(type: string) {
  return sanityFetch(`*[_type == $type][0]{
    heroEyebrow,
    heroHeadline,
    heroSubhead,
    heroImage${IMAGE_PROJECTION},
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION}
  }`, { type }, null);
}

// ---- Home page ------------------------------------------------------------
// Hero + SEO only. The home sections render from inline church copy; the hero
// image (single or slideshow) is the editor-managed override.

export async function getHomePage() {
  return sanityFetch(`*[_type == "homePage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow,
    heroHeadline,
    heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroImages[]${IMAGE_PROJECTION},
    heroPrimaryCta${CTA_PROJECTION},
    heroSecondaryCta${CTA_PROJECTION},
    heroRotatingWords,
    heroScriptAccent
  }`, {}, null);
}

// ---- About page -----------------------------------------------------------

export async function getAboutPage() {
  return sanityFetch(`*[_type == "aboutPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    storyEyebrow, storyHeadline, storyContent,
    finalCtaEyebrow, finalCtaHeadline, finalCtaScriptAccent, finalCtaSubhead,
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION}
  }`, {}, null);
}

// ---- FAQ page -------------------------------------------------------------

export async function getFaqPage() {
  return sanityFetch(`*[_type == "faqPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    categoryOrder,
    "faqs": *[_type == "faqItem"] | order(category asc, displayOrder asc){
      question, answer, category, displayOrder
    },
    finalCtaEyebrow, finalCtaHeadline, finalCtaScriptAccent, finalCtaSubhead,
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    secondaryCta${CTA_PROJECTION}
  }`, {}, null);
}

// ---- Contact page ---------------------------------------------------------

export async function getContactPage() {
  return sanityFetch(`*[_type == "contactPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    formIntroNote,
    whatToExpectEyebrow,
    whatToExpectHeadline,
    whatToExpectContent
  }`, {}, null);
}

// ---- 404 page -------------------------------------------------------------

export async function getNotFoundPage() {
  return sanityFetch(`*[_type == "notFoundPage"][0]{
    seoTitle,
    seoDescription,
    eyebrow,
    headline,
    body,
    heroImage${IMAGE_PROJECTION},
    primaryCtaLabel, primaryCtaHref,
    secondaryCtaLabel, secondaryCtaHref,
    tertiaryCtaLabel, tertiaryCtaHref
  }`, {}, null);
}

// ---- Privacy page ---------------------------------------------------------

export async function getPrivacyPage() {
  return sanityFetch(`*[_type == "privacyPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    lastUpdated,
    body
  }`, {}, null);
}

// ---- Pastors & staff collection -------------------------------------------

export async function getStaffMembers() {
  return sanityFetch(`*[_type == "staffMember"] | order(displayOrder asc, name asc){
    _id, name, role, email,
    photo${IMAGE_PROJECTION},
    bio,
    favorites[]{ label, value }
  }`, {}, []);
}

// ---- Ministries collection ------------------------------------------------

const MINISTRY_CARD = `{
  _id, title, audience, summary, link,
  image${IMAGE_PROJECTION}
}`;

export async function getMinistries() {
  return sanityFetch(
    `*[_type == "ministry"] | order(displayOrder asc, title asc) ${MINISTRY_CARD}`,
    {},
    [],
  );
}

// Ministries flagged to appear in the home "Get involved" next-step row.
export async function getFeaturedMinistries() {
  return sanityFetch(
    `*[_type == "ministry" && featured == true] | order(displayOrder asc, title asc) ${MINISTRY_CARD}`,
    {},
    [],
  );
}

// ---- Events module --------------------------------------------------------

// Card projection for the events list (no full description body).
const EVENT_CARD = `{
  _id, title, slug, eventType, category, scheduleLabel, start, end, location,
  summary, registrationUrl, featured,
  image${IMAGE_PROJECTION}
}`;

export async function getEventsPage() {
  return sanityFetch(`*[_type == "eventsPage"][0]{
    seoTitle, seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION}
  }`, {}, null);
}

// Recurring rhythms (weekly worship, Bible study) — always shown, ordered by
// representative start time then title.
export async function getRecurringEvents() {
  return sanityFetch(
    `*[_type == "event" && eventType == "recurring"] | order(start asc, title asc) ${EVENT_CARD}`,
    {},
    [],
  );
}

// One-time events that haven't passed yet (end time if set, else start).
// "now" is resolved at build time; a rebuild refreshes the list.
export async function getUpcomingEvents() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && eventType == "oneTime" && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(featured desc, start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

export async function getEventBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "event" && slug.current == $slug][0]{
      _id, title, slug, eventType, category, scheduleLabel, start, end, location,
      summary, registrationUrl, featured,
      image${IMAGE_PROJECTION},
      description
    }`,
    { slug },
    null,
  );
}

export async function getAllEventSlugs(): Promise<string[]> {
  const list: Array<{ slug: { current: string } }> = await sanityFetch(
    `*[_type == "event" && defined(slug.current)]{ slug }`,
    {},
    [],
  );
  return list.map((e) => e.slug?.current).filter(Boolean);
}

// ---- Sermons module -------------------------------------------------------

const SERMON_CARD = `{
  _id, title, slug, date, speaker, series, scripture, videoUrl, featured,
  image${IMAGE_PROJECTION}
}`;

export async function getSermonsPage() {
  return sanityFetch(`*[_type == "sermonsPage"][0]{
    seoTitle, seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead, livestreamUrl
  }`, {}, null);
}

export async function getRecentSermons() {
  return sanityFetch(
    `*[_type == "sermon"] | order(featured desc, date desc) ${SERMON_CARD}`,
    {},
    [],
  );
}

export async function getSermonBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "sermon" && slug.current == $slug][0]{
      _id, title, slug, date, speaker, series, scripture, videoUrl, audioUrl, featured,
      image${IMAGE_PROJECTION},
      description
    }`,
    { slug },
    null,
  );
}

export async function getAllSermonSlugs(): Promise<string[]> {
  const list: Array<{ slug: { current: string } }> = await sanityFetch(
    `*[_type == "sermon" && defined(slug.current)]{ slug }`,
    {},
    [],
  );
  return list.map((s) => s.slug?.current).filter(Boolean);
}
