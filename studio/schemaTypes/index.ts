// Registers every schema type with the Studio.
// Order doesn't affect runtime; alphabetical here for readability.

import { aboutPage } from './aboutPage';
import { churchPageSingletons } from './churchPages';
import { contactPage } from './contactPage';
import { ctaBlock } from './ctaBlock';
import { event } from './event';
import { eventsPage } from './eventsPage';
import { faqItem } from './faqItem';
import { faqPage } from './faqPage';
import { homePage } from './homePage';
import { journalCategory } from './journalCategory';
import { journalEntry } from './journalEntry';
import { journalPage } from './journalPage';
import { notFoundPage } from './notFoundPage';
import { philosophyPoint } from './philosophyPoint';
import { privacyPage } from './privacyPage';
import { sermon } from './sermon';
import { sermonsPage } from './sermonsPage';
import { siteSettings } from './siteSettings';
import { studioGuide } from './studioGuide';
import { studioNotes } from './studioNotes';
import { studioPlaybook } from './studioPlaybook';
import { testimonial } from './testimonial';

export const schemaTypes = [
  // Object types (embedded) first so they're defined before docs that reference them
  ctaBlock,

  // Singletons
  siteSettings,
  homePage,
  aboutPage,
  faqPage,
  contactPage,
  journalPage,
  eventsPage,
  sermonsPage,
  notFoundPage,
  privacyPage,
  // Per-page church singletons (worship, music, grow, serve, kids, food,
  // use-our-space, weddings, give, what-we-believe, pastors & staff).
  ...churchPageSingletons,
  // Start Here editable singletons
  studioGuide,
  studioNotes,
  studioPlaybook,

  // Reusable content collections
  testimonial,
  faqItem,
  philosophyPoint,
  journalCategory,
  journalEntry,
  event,
  sermon,
];
