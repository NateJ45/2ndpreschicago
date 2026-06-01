// Studio Desk structure. Pins Site Settings at the top, then ALL page singletons
// (one document each) under "Pages", then the reusable content collections.
// Every document type is placed explicitly so nothing floats loose at the desk
// root. The trailing default-list filter is a safety net for any future type
// that hasn't been placed (and hides sanity-plugin-media's media.tag type).
//
// "Pages" is one list (so the rule for editors is simple: every page lives here).
//
// Remodel note: the interior-designer "Start Here" handbook, the Journal section,
// and the Philosophy/Testimonials lists were removed. Pastors & Staff and
// Ministries collections were added under "Content".
//
// Preview pane: singletons explicitly attach a form + preview iframe view via the
// singletonWithPreview helper. Other types pick up preview from defaultDocumentNode
// in sanity.config.ts.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import { Iframe, urlForDoc } from './sanity.config';
import {
  CogIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
  HelpCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CalendarIcon,
  PlayIcon,
  StarIcon,
  HeartIcon,
  ThListIcon,
  BookIcon,
  LockIcon,
  PresentationIcon,
} from '@sanity/icons';

const SINGLETON_TYPES = [
  'siteSettings',
  // Core pages
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'eventsPage',
  'sermonsPage',
  'notFoundPage',
  'privacyPage',
  // Per-page church singletons
  'worshipPage',
  'beliefsPage',
  'musicPage',
  'staffPage',
  'growPage',
  'servePage',
  'kidsPage',
  'foodPage',
  'useOurSpacePage',
  'weddingsPage',
  'givePage',
] as const;

const HIDDEN_FROM_DEFAULT = new Set<string>([
  ...SINGLETON_TYPES,
  // Collections placed explicitly below (so they don't double-show at the root).
  'faqItem',
  'staffMember',
  'ministry',
  'event',
  'sermon',
  // sanity-plugin-media registers this tag type; keep it out of the desk root
  // (the "Media" tool in the top sidebar is where tags belong).
  'media.tag',
]);

/**
 * Build a singleton list item whose editor pane includes both the form view
 * and an iframe preview view (when the doc type has a viewable page).
 *
 * S.editor() and S.document().views([S.view.form()]) both pre-set views and
 * thereby bypass the defaultDocumentNode in sanity.config.ts. So we attach
 * views explicitly here for the singletons that need them.
 */
function singletonWithPreview(
  S: StructureBuilder,
  schemaType: string,
  title: string,
  icon: any,
) {
  const hasPreview = urlForDoc(schemaType, {}) !== null;
  const views = [
    S.view.form(),
    ...(hasPreview
      ? [
          S.view
            .component(Iframe)
            .options({
              url: (doc: any) => urlForDoc(schemaType, doc) ?? '',
              reload: { button: true },
              defaultSize: 'desktop',
            })
            .title('Preview'),
        ]
      : []),
  ];

  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.document()
        .schemaType(schemaType)
        .documentId(schemaType)
        .views(views),
    );
}

export const deskStructure = (S: StructureBuilder, _context: StructureResolverContext) =>
  S.list()
    .title('Second Presbyterian')
    .items([
      // Site Settings — pinned singleton (no preview; not a page)
      singletonWithPreview(S, 'siteSettings', 'Site Settings', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here.
      S.listItem()
        .title('Pages')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              singletonWithPreview(S, 'homePage', 'Home', HomeIcon),
              singletonWithPreview(S, 'worshipPage', "I'm New / Worship", StarIcon),
              singletonWithPreview(S, 'aboutPage', 'About', UserIcon),
              singletonWithPreview(S, 'beliefsPage', 'What We Believe', BookIcon),
              singletonWithPreview(S, 'musicPage', 'Music', PlayIcon),
              singletonWithPreview(S, 'staffPage', 'Pastors & Staff', UsersIcon),

              S.divider(),

              singletonWithPreview(S, 'growPage', 'Grow', HeartIcon),
              singletonWithPreview(S, 'servePage', 'Serve', HeartIcon),
              singletonWithPreview(S, 'kidsPage', 'Kids', HeartIcon),
              singletonWithPreview(S, 'foodPage', 'Food Ministry', HeartIcon),

              S.divider(),

              singletonWithPreview(S, 'eventsPage', 'Events (index page)', CalendarIcon),
              singletonWithPreview(S, 'sermonsPage', 'Sermons (index page)', PlayIcon),

              S.divider(),

              singletonWithPreview(S, 'useOurSpacePage', 'Use Our Space', PresentationIcon),
              singletonWithPreview(S, 'weddingsPage', 'Weddings', StarIcon),
              singletonWithPreview(S, 'givePage', 'Give', HeartIcon),

              S.divider(),

              singletonWithPreview(S, 'faqPage', 'FAQ', HelpCircleIcon),
              singletonWithPreview(S, 'contactPage', 'Contact', EnvelopeIcon),
              singletonWithPreview(S, 'notFoundPage', '404 Page', DocumentTextIcon),
              singletonWithPreview(S, 'privacyPage', 'Privacy Policy Page', LockIcon),
            ]),
        ),

      S.divider(),

      // Content — reusable collections.
      S.listItem()
        .title('Content')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('staffMember').title('Pastors & Staff').icon(UsersIcon),
              S.documentTypeListItem('ministry').title('Ministries').icon(HeartIcon),
              S.documentTypeListItem('faqItem').title('FAQ Items').icon(HelpCircleIcon),
            ]),
        ),

      S.divider(),

      // Events — recurring rhythms + one-time dated events shown on /events
      S.documentTypeListItem('event').title('Events').icon(CalendarIcon),

      // Sermons — messages shown on /sermons
      S.documentTypeListItem('sermon').title('Sermons').icon(PlayIcon),

      // Safety net: surface any document type we have NOT explicitly placed above
      // (and keep the hidden set, including media.tag, out of the desk root).
      ...S.documentTypeListItems().filter((item) => !HIDDEN_FROM_DEFAULT.has(item.getId() as string)),
    ]);
