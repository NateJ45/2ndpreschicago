// Foundation, edit with care
// Sanity Studio configuration for the ncs-astro-sanity-starter template.
// Replace SANITY_STUDIO_PROJECT_ID in studio/.env with the real ID from
// manage.sanity.io after running `sanity init` (or after creating the project
// manually). Studio reads it via the cli config — see sanity.cli.ts for
// runtime overrides.

import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { schemaTypes } from './schemaTypes';
import { deskStructure } from './structure';
import StudioLogo from './components/StudioLogo';
import StudioLayout from './components/StudioLayout';
import { CharacterCountInput } from './components/CharacterCountInput';
import { documentBadges } from './components/documentBadges';

// Brand theme for the Studio UI. Uses Sanity's legacy theme builder which
// maps a handful of CSS custom properties to the Studio's full internal design
// system (it derives the complete light + dark palette from these inputs).
//
// These values mirror the website's own design tokens (src/styles/globals.css)
// so the Studio shares the site's Paper-and-Ink feel: warm Bronze as the
// interactive accent, cream Paper surfaces, Espresso Ink text, and a deep
// Chapel-green top bar with cream text — the same green the site uses for its
// utility bar, footer, and closing CTA. The fonts are patched on below.
const studioThemeProps = {
  // Foundation — neutrals everything else derives from.
  '--black': '#36302A',   // Espresso Ink — darkest text
  '--white': '#FBF8F2',   // Soft Paper — lightest surface
  '--gray-base': '#6E6354', // Warm taupe — tints every neutral warm, not cool

  // Brand accent — Warm Bronze.
  '--brand-primary': '#8A6A43',
  '--brand-primary--inverted': '#ffffff',
  '--focus-color': '#8A6A43',

  // Paper surfaces for inputs and components.
  '--input-bg': '#F1EBE0',
  '--component-bg': '#FBF8F2',
  '--component-text-color': '#36302A',

  // Buttons.
  '--default-button-color': '#8A6A43',
  '--default-button-primary-color': '#8A6A43',
  '--default-button-success-color': '#3E7C66',
  '--default-button-warning-color': '#A07D45',
  '--default-button-danger-color': '#C0392B',

  // Validation + status states.
  '--state-success-color': '#3E7C66',
  '--state-warning-color': '#A07D45',
  '--state-danger-color': '#C0392B',

  // Top navigation bar — deep Chapel green with cream text, echoing the site's
  // utility bar and footer.
  '--main-navigation-color': '#1E423B',
  '--main-navigation-color--inverted': '#F1EAD9',
};

// Patch the brand fonts onto the legacy theme. buildLegacyTheme returns a full
// theme object whose `fonts` map (@sanity/ui) carries a `family` per role; we
// override the heading + text families with the site's faces (Instrument Serif
// for display, Newsreader for body). The font files themselves are injected via
// the StudioLayout component (a Google Fonts <link>), so these names resolve.
// Optional chaining keeps a future @sanity/ui shape change from throwing.
const DISPLAY_STACK = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const BODY_STACK = "'Newsreader', Georgia, 'Times New Roman', serif";

const baseTheme = buildLegacyTheme(studioThemeProps);
const studioTheme = {
  ...baseTheme,
  fonts: baseTheme.fonts
    ? {
        ...baseTheme.fonts,
        heading: baseTheme.fonts.heading
          ? { ...baseTheme.fonts.heading, family: DISPLAY_STACK }
          : baseTheme.fonts.heading,
        text: baseTheme.fonts.text
          ? { ...baseTheme.fonts.text, family: BODY_STACK }
          : baseTheme.fonts.text,
      }
    : baseTheme.fonts,
};

// Set this to your deployed Workers URL (e.g. 'https://my-project.workers.dev') after deploy.
export const SITE_URL_FOR_PREVIEW = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321';

// Map doc _type → live-site path. Singletons get a fixed path; slug-based
// docs build the path from the doc's slug. Returns null for types that have
// no viewable page (siteSettings) — the preview pane is hidden for those.
// Exported so structure.ts can call it when wiring per-doc views.
export function urlForDoc(schemaType: string, doc: any): string | null {
  const SITE_URL = SITE_URL_FOR_PREVIEW;
  const slug = doc?.slug?.current;
  switch (schemaType) {
    // Core pages
    case 'homePage':      return `${SITE_URL}/`;
    case 'aboutPage':     return `${SITE_URL}/about`;
    case 'faqPage':       return `${SITE_URL}/faq`;
    case 'contactPage':   return `${SITE_URL}/contact`;
    case 'notFoundPage':  return `${SITE_URL}/404`;
    case 'privacyPage':   return `${SITE_URL}/privacy`;
    // Church index pages + per-page singletons
    case 'eventsPage':       return `${SITE_URL}/events`;
    case 'sermonsPage':      return `${SITE_URL}/sermons`;
    case 'worshipPage':      return `${SITE_URL}/worship`;
    case 'beliefsPage':      return `${SITE_URL}/what-we-believe`;
    case 'musicPage':        return `${SITE_URL}/music`;
    case 'staffPage':        return `${SITE_URL}/pastor-staff`;
    case 'growPage':         return `${SITE_URL}/grow`;
    case 'servePage':        return `${SITE_URL}/serve`;
    case 'kidsPage':         return `${SITE_URL}/kids`;
    case 'foodPage':         return `${SITE_URL}/food`;
    case 'useOurSpacePage':  return `${SITE_URL}/use-our-space`;
    case 'weddingsPage':     return `${SITE_URL}/weddings`;
    case 'givePage':         return `${SITE_URL}/give`;
    // Collections: dated detail pages by slug; staff list + FAQ list pages.
    case 'event':       return slug ? `${SITE_URL}/events/${slug}` : `${SITE_URL}/events`;
    case 'sermon':      return slug ? `${SITE_URL}/sermons/${slug}` : `${SITE_URL}/sermons`;
    case 'staffMember': return `${SITE_URL}/pastor-staff`;
    case 'faqItem':     return `${SITE_URL}/faq`;
    // Generic custom pages live at /<slug>.
    case 'page':        return slug ? `${SITE_URL}/${slug}` : null;
    default:            return null;
  }
}

export default defineConfig({
  name: 'secondpres',
  // Short title shown in the browser tab when editing.
  title: 'Second Presbyterian Church of Chicago',

  // Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env
  // (or as env vars) after creating your Sanity project at sanity.io/manage.
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  // Brand theme — Slate primary + Paper background.
  theme: studioTheme,

  // Studio chrome overrides. Logo replaces the default Sanity wordmark; the
  // layout wrapper injects the brand web fonts so the theme's serif families
  // (set above) actually load in the Studio.
  studio: {
    components: {
      logo: StudioLogo,
      layout: StudioLayout,
    },
  },

  // Global form customization. Registering the character-count input once here
  // applies it to every capped text field across all schemas. The component
  // falls through to the default input for anything that isn't a string/text
  // field with a max length, so it's safe as a global wrapper.
  form: {
    components: {
      input: CharacterCountInput,
    },
  },

  plugins: [
    structureTool({
      structure: deskStructure,
      // No defaultDocumentNode override: documents show the form only. This is a
      // static site with no live draft preview, so an iframe "Preview" tab would
      // load the last PUBLISHED build (not the editor's current draft) and
      // mislead editors. Changes go live after Publish + the site rebuild; see
      // the "How This Works" guide. (urlForDoc / SITE_URL_FOR_PREVIEW are kept
      // above for reference if a real preview environment is added later.)
    }),
    // Unsplash plugin — adds an "Unsplash" tab to every image picker. The
    // package's correct registration is via the plugins array (not
    // form.image.assetSources — that was my earlier bug). Picking a photo
    // uploads it to the Sanity library + attaches to the field in one shot.
    unsplashImageAsset(),
    // Media browser — adds a top-level "Media" icon in the Studio sidebar
    // for browsing every uploaded image at once with tag + filter + bulk-edit.
    // Much better than the inline image picker for "what's in our library".
    media(),
    // Vision (GROQ query runner) is a developer tool, not an editor tool.
    // Gate it to local dev so it doesn't clutter the deployed Studio.
    ...(process.env.NODE_ENV !== 'production' ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
  },

  // Singleton enforcement: hide these from the global "+" create menu so editors
  // can't make duplicates. Reusable content types stay available.
  document: {
    // Custom at-a-glance status badges (Featured / Needs a photo / Add SEO)
    // rendered next to the publish status. Keep Sanity's built-in badges and
    // append ours.
    badges: (prev) => [...prev, ...documentBadges],
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((option) => !SINGLETON_TYPES.has(option.templateId));
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (SINGLETON_TYPES.has(schemaType)) {
        return prev.filter(
          ({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''),
        );
      }
      return prev;
    },
  },
});

// Singleton document types — one instance each, not duplicable.
const SINGLETON_TYPES = new Set<string>([
  'siteSettings',
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'notFoundPage',
  'privacyPage',
  // Church index pages + per-page singletons
  'eventsPage',
  'sermonsPage',
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
]);
