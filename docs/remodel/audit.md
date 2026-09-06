# Remodel Phase 1 — Audit & Inventory

Date: 2026-05-31. Branch: `redesign/church-remodel`.

Purpose: map the front end and Sanity schema before the church remodel, and tag every
Sanity type/field KEEP / CONVERT / CUT. This is the traceable record behind the destructive
schema edits in Phase 4 and the component deletions in Phase 3.

Source: two exhaustive read-only inventory passes (schema + front end), reconciled against
`docs/research/church-website-audit.md` (the 10-church design research).

---

## 1. Headline finding

The site was forked from an interior-designer business template ("Reid Design"). The *design
tokens* (warm cream/espresso/bronze, Instrument Serif + Newsreader, the motion layer) are a
genuine strength and on-theme for a historic church. What still reads as "the template" is:

- **Structure**: a generic top nav + a stack of near-identical full-width section bands. No
  church-specific structural language (no service-times utility bar, no "plan your visit"
  front door, no varied section rhythm).
- **Leftover business schema** in the Studio (services-for-sale, portfolio/projects, journal,
  testimonials-as-reviews, designer personal-branding fields, "Start Here" studio guides).
- **Hardcoded page content** that an editor cannot change (home, staff bios, FAQ, weddings).

So the remodel is structural + schema + content-wiring, not a palette swap. The distinctive
look comes from church patterns the research documents (Highland Park Presbyterian especially):
utility bar with service times + Plan Your Visit, arched photo motif, a service-info band,
key-word color emphasis in headlines, and a real church footer.

---

## 2. Sanity schema inventory (33 active types)

### KEEP — church-ready, no structural change
| Type | Notes |
|---|---|
| `ctaBlock` (object) | Prune `internalLink.to` refs to `journalPage`/`journalEntry` when journal is cut |
| `eventsPage`, `event` | Church-ready (categories already Worship/Study/Meals/Music/etc.) |
| `sermonsPage`, `sermon` | Church-ready |
| `worshipPage`, `beliefsPage`, `musicPage`, `staffPage`, `growPage`, `servePage`, `kidsPage`, `foodPage`, `useOurSpacePage`, `weddingsPage`, `givePage` (churchPages.ts) | 11 hero+SEO singletons, church-ready |
| `privacyPage` | Keep; fix placeholder eyebrow copy |
| `notFoundPage` | Keep; fix portfolio default-CTA copy ("Browse the portfolio" → church) |

### KEEP with field surgery — church-fit by removing business fields
- **`siteSettings`**: CUT `availabilityStatus`, `serviceAreas`, `travelFees`, `googleBusinessUrl`,
  `reviewsNote`, `satisfactionGuarantee`, and the interior-designer `sectionVisibility` toggles
  (`showPortfolio/showShop/showEDesign/showGiftCertificates/showPress/showResources/showGuides/showStyleQuiz/showBudgetCalculator`).
  ADD church fields (service times, address, giving link, mission line, optional announcement banner).
- **`homePage`**: CUT entire groups `meetFounder`, `featuredWork`, `process`, `testimonials`,
  `services`, `featuredJournal`, plus `serviceAreaCue`. ADD church home sections (this-Sunday,
  welcome, next-step cards, etc.).
- **`aboutPage`**: CUT groups `philosophy`, `personal`, `stats`; CUT `founderPhoto`,
  `founderAttribution`, `backgroundLine`, `serviceAreaMention`. Keep hero/story/final (rewrite copy).
- **`contactPage`**: CUT `formProjectTypeOptions`, `formLocationOptions`, `formBudgetOptions`,
  `formTimelineOptions`, `formSourceOptions`, `postInquiryRoadmap`, `schedulingLink`,
  `schedulingLinkLabel`, `availabilityNote` (church /contact is static, no Calendly/lead form).
- **`faqPage`** + **`faqItem`**: replace business `category` options
  (Pricing/Process/Logistics/Service Area/Getting Started) with church categories; drop
  `alsoShowOnProcessPage`.

### CUT — interior-designer/business only, no church use
| Type | Reason |
|---|---|
| `service` *(file exists, NOT registered)* | services-for-sale + pricing. Delete file. |
| `servicesPage` *(file exists, NOT registered)* | Builder/Realtor B2B + service-area. Delete file. |
| `testimonial` | Review-platform marketing (Google/Houzz/Facebook). Rebuild fresh later if "stories" wanted. |
| `philosophyPoint` | Designer "values" cards tied to the cut aboutPage philosophy group. |
| `journalEntry` | Designer blog w/ sourceCard / beforeAfter / "designer's note" blocks. |
| `journalCategory` | Journal taxonomy (tied to journalEntry). |
| `journalPage` | Journal index singleton (tied to journal module). |
| `studioGuide` | Editor "Start Here" handbook, studio-framed; not visitor-facing. |
| `studioNotes` | "ideal client" / "designer-speak to avoid"; not visitor-facing. |
| `studioPlaybook` | E-design / trade-sourcing business-growth guides. |

### ADD — new church types (Phase 4)
- `staffMember` (collection) — name, role, bio, photo, email, "favorites". Replaces hardcoded `/pastor-staff`.
- `ministry` (collection) — title, audience (Kids/Youth/Adults/Seniors/Everyone), summary, image, link.
- `sermonSeries` (collection, low-risk) — title, slug, description, image; `sermon.series` becomes a reference.
  Only migrate if few/no sermon docs exist (verify in Phase 4); otherwise keep `series` as string.
- Optional flexible `page` (one-offs) — title, slug, modular section body. Add lean if scope allows.
- Announcement banner — folded into `siteSettings.announcement` object (no new type).

**No CONVERT-tagged types.** Each business type is either rebuilt-fresh-if-wanted or has no church
analog. The "convert" work is field-level surgery inside the KEEP-with-cuts singletons.

---

## 3. Cross-file cleanup tied to the cuts (so nothing dangles)
1. `src/sanity/schemaTypes/index.ts` — remove imports + array entries for every CUT type.
2. `src/sanity/schemaTypes/ctaBlock.ts` — drop `journalPage`/`journalEntry` from `internalLink.to`.
3. `src/sanity/structure.ts` — remove the "Start Here" desk list (studioGuide/studioNotes/studioPlaybook +
   custom components), the Journal desk section, `philosophyPoint` from ORDERABLE_TYPES, journal/studio
   entries in SINGLETON_TYPES + HIDDEN_FROM_DEFAULT, and the testimonial/philosophyPoint Content items.
4. `sanity.config.ts` — prune the stale `SINGLETON_TYPES` set and dead `urlForDoc` cases
   (processPage/portfolioPage/eDesignPage/shopPage/giftPage/resourcesPage/pressPage/styleQuiz/
   budgetCalculator/project/processStep/pressItem/shopCollection/shopItem/leadMagnet/service/servicesPage/journal*).
5. `src/lib/queries.ts` — remove dead exports: `getServicesPage`, `getAllProjects` + `CoreProjectCard`,
   all journal queries, `getPressItems` + `CorePressItem`; trim business fields from
   `getSiteSettings`/`getHomePage`/`getAboutPage`.
6. `src/lib/sectionVisibility.ts` — drop the cut toggles.

---

## 4. Front-end inventory

### Pages (all wrap BaseLayout → global Header + Footer + BackToTop)
| Route | Hero source | Body content | Action |
|---|---|---|---|
| `/` index | partial Sanity (SEO + hero image only) | **almost all HARDCODED** | Rebuild visually + wire to new homePage fields |
| `/worship` | Sanity hero | hardcoded (service band, plan-visit cards, Tozer quote) | Restyle to new section components |
| `/about` | Sanity hero | hardcoded body | Restyle |
| `/faq` | Sanity hero | **hardcoded Q&As** (uses inline `<details>`, not FaqAccordion) | Wire to `faqItem` |
| `/contact` | Sanity hero | hardcoded + site.ts contact + Google Map | Restyle |
| `/grow /serve /kids /food /give /music /weddings /use-our-space` | Sanity hero | hardcoded bodies (weddings has pricing+FAQ; give has Vanco URL) | Restyle; consider ministry collection |
| `/pastor-staff` | Sanity hero | **hardcoded staff array** (file flags this) | Wire to new `staffMember` collection |
| `/what-we-believe` | Sanity hero | hardcoded **by design** (verbatim statement of faith — DO NOT reword) | Restyle only, keep text verbatim |
| `/privacy` | Sanity (full) | Sanity body + static fallback | Cleanest page; leave wiring |
| `/events` + `/events/[slug]` | Sanity | data-driven (recurring fallback list) | Keep; restyle cards |
| `/sermons` + `/sermons/[slug]` | Sanity | data-driven | Keep; restyle cards |
| `/journal` + `/journal/[slug]` | Sanity | **pure template leftover** (links to nonexistent `/portfolio`, "studio" copy) | **DELETE module + routes** |
| `/404` | Sanity-aware | leftover "Browse the portfolio" + "Studio dogs" fallbacks | Fix fallbacks |

### Components — deletion plan
**Delete immediately (zero imports):** `AboutPersonal`, `CalendlyInline`, `FeaturedJournal`,
`FeaturedTestimonial`, `FeaturedWork`, `PostInquiryRoadmap`, `PressStrip`, `ProjectCard`,
`ServiceAreaCue`, `ServiceAreaMap`, `ServiceCard`, `StatsRow` (+`StatsCounter`),
`TestimonialGrid` (+`TestimonialCard`), `ProcessStep` (+`ProcessStepIllustration`), and the
four `ui/` decoratives (`animated-beam`, `bento-grid`, `marquee`, `spotlight`). Also unused but
generic: `ContactForm`, `SectionDivider` (keep `FaqAccordion` — we'll use it for /faq).

**Delete as the journal-removal unit** (imported only by the two `journal/` pages):
`JournalCard`, `JournalCategoryChip`, `JournalPortableText`, `CaseStudyTOC`, `BeforeAfterSlider`,
`StickyCTAChip`, and (then-unused) `ReadingProgress`. Delete the two `journal/` page files in the
same commit or the build breaks.

**Keep (CHURCH):** Hero, HeroBackground, Header, Footer, FinalCta, SectionHeading, SanityImage,
CtaLink, PortableText, FaqAccordion, NewsletterSignup, CopyEmailButton, ThemeToggle, MobileNav,
BackToTop. **Keep (SHARED-UI):** button, card, input, textarea, label, separator, sheet,
accordion, dropdown-menu, sonner.

### Highest-value hardcoded → Sanity migrations
1. Home page (hero + every section) → new `homePage` church fields.
2. `/pastor-staff` bios → new `staffMember` collection.
3. `/faq` Q&As → existing `faqItem` collection (church categories).
4. `/weddings` pricing + FAQ → `weddingsPage` fields (lower priority).
`/what-we-believe` stays hardcoded verbatim by constraint.

---

## 5. Constraints carried into every phase (from CLAUDE.md + client)
- No em-dashes in public-facing site copy.
- `/what-we-believe` text is the leadership's official statement: reproduce verbatim, never reword.
- After ANY schema change: `npm run typegen` → `npm run studio:deploy` → commit. Never click
  "Remove field" in the hosted Studio (deletes data) — deploy the corrected schema instead.
- Build in light AND dark mode. Desktop nav stays server-rendered. Keep the Lenis scroll-reset.
- Do not run `npm run build` while the dev server is running (wipes `.vite/deps_ssr`).
- Branch `redesign/church-remodel` only; back up the dataset before any deletion.
