// Foundation, edit with care
// =============================================================================
// Sanity Studio configuration - loaded by the EMBEDDED /studio
// =============================================================================
// Moved here from studio/sanity.config.ts on 2026-09-06, when the nested studio/
// package was folded into this one (PORTS.md card 10).
//
// The studio now lives in the SAME package as the site. One node_modules, one
// copy of every module, which is what keeps the styled-components / @sanity/ui
// theme context intact: a nested studio package gives TWO module instances of
// styled-components, so the ThemeProvider mounted by one is invisible to
// useTheme in the other and the desk dies on its first custom-component render
// (styled-components error #18, then "Cannot read properties of undefined
// (reading 'v2')") while the login screen, which is core code only, renders
// fine. That was presacademy's 2026-08-26 production outage.
//
// @sanity/astro mounts this config at /studio (see astro.config.mjs); the sanity
// CLI (sanity.cli.ts) uses it for typegen and dataset commands. Deploying the
// site now deploys the Studio, so the embedded one can never drift stale.

import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { schemaTypes } from './src/sanity/schemaTypes';
import { deskStructure } from './src/sanity/structure';
import { resolve } from './src/sanity/resolve';
import { envVal } from './src/sanity/urls';
import { PreviewNavigator } from './src/sanity/components/PreviewNavigator';
import StudioLogo from './src/sanity/components/StudioLogo';
import StudioLayout from './src/sanity/components/StudioLayout';
import { CharacterCountInput } from './src/sanity/components/CharacterCountInput';
import { documentBadges } from './src/sanity/components/documentBadges';

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

// Dev detection must FAIL CLOSED. The obvious test is
// `process.env.NODE_ENV !== 'production'`, which was correct for the old
// standalone studio build but is WRONG for the embedded one: the Astro/Vite
// client bundle injects `globalThis.process ??= {}`, so `process` exists with an
// empty env, NODE_ENV is undefined, and the comparison is true IN PRODUCTION.
// That would ship the Vision GROQ console to the church's editors. Test
// positively for dev instead, so an unknown environment gets the editor build.
const IS_DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

// The live-site URL map (urlForDoc / SITE_URL_FOR_PREVIEW) moved to
// src/sanity/urls.ts when the studio folded in (2026-09-06). It is imported by
// the desk structure and by the Presentation resolver, so it has to live
// somewhere both can reach without importing this config file and creating a
// cycle.

export default defineConfig({
  name: 'secondpres',
  // Short title shown in the browser tab when editing.
  title: 'Second Presbyterian Church of Chicago',

  // envVal reads process.env (the sanity CLI) OR import.meta.env (the embedded
  // Studio, bundled by Astro/Vite, where `process.env` is an empty object). A
  // bare process.env read here would leave the deployed Studio with no project
  // id. See src/sanity/urls.ts.
  projectId:
    envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID') || 'placeholder-project-id',
  dataset: envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production',

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
      // No defaultDocumentNode override: documents show the form only, and the
      // live preview is Presentation's job (below), not an iframe pane's.
      //
      // WHY THIS COMMENT CHANGED (2026-09-06). It used to argue that this site
      // deliberately had NO preview, because an iframe pane on a fully static
      // site would load the last PUBLISHED build rather than the editor's
      // current draft, and so would mislead editors about what they were
      // looking at. That objection was right about an iframe pane, and it is
      // exactly what the Presentation stack answers: /preview/** is an SSR
      // route that reads DRAFT content with the runtime token, so what the
      // preview shows is the draft, not the last deploy. The old reasoning is
      // kept here rather than deleted because it is the reason the preview had
      // to be built this way instead of the cheap way.
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
    // Click-to-edit live preview against the Studio-only /preview/* routes
    // (never the real public pages: see src/sanity/resolve.ts and the site's
    // src/pages/preview/). previewMode only sets `enable`, because `disable` is
    // a documented no-op in this Sanity version, so exiting preview is a plain
    // link to /api/draft-mode/disable (see PreviewLayout.astro). The relative
    // URLs assume the EMBEDDED /studio, i.e. same origin as the site.
    //
    // REQUIRES the SANITY_TOKEN (or the existing SANITY_API_READ_TOKEN) runtime
    // secret. Without it the preview routes fail closed and this tool shows a
    // 503 naming what is missing rather than a stack trace.
    presentationTool({
      resolve,
      previewUrl: {
        initial: '/preview',
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      // The Squarespace-style page list beside the preview: click a page, the
      // preview jumps there and the edit panel follows.
      components: {
        unstable_navigator: {
          component: PreviewNavigator,
          minWidth: 160,
          maxWidth: 280,
        },
      },
    }),
    // Vision (GROQ query runner) is a developer tool, not an editor tool.
    // Gate it to local dev so it doesn't clutter the deployed Studio.
    ...(IS_DEV ? [visionTool()] : []),
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
