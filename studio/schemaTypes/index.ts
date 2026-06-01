// Registers every schema type with the Studio.
// Order doesn't affect runtime; grouped here for readability.
//
// Remodel note: the interior-designer types (service, servicesPage, testimonial,
// philosophyPoint, journal*, studio* "Start Here" helpers) were removed. The
// church collections staffMember + ministry were added.

import { aboutPage } from './aboutPage';
import { churchPageSingletons } from './churchPages';
import { contactPage } from './contactPage';
import { ctaBlock } from './ctaBlock';
import { event } from './event';
import { eventsPage } from './eventsPage';
import { faqItem } from './faqItem';
import { faqPage } from './faqPage';
import { homePage } from './homePage';
import { ministry } from './ministry';
import { notFoundPage } from './notFoundPage';
import { privacyPage } from './privacyPage';
import { sermon } from './sermon';
import { sermonsPage } from './sermonsPage';
import { siteSettings } from './siteSettings';
import { staffMember } from './staffMember';

export const schemaTypes = [
  // Object types (embedded) first so they're defined before docs that reference them
  ctaBlock,

  // Singletons
  siteSettings,
  homePage,
  aboutPage,
  faqPage,
  contactPage,
  eventsPage,
  sermonsPage,
  notFoundPage,
  privacyPage,
  // Per-page church singletons (worship, what-we-believe, music, pastors & staff,
  // grow, serve, kids, food, use-our-space, weddings, give).
  ...churchPageSingletons,

  // Reusable content collections
  faqItem,
  staffMember,
  ministry,
  event,
  sermon,
];
