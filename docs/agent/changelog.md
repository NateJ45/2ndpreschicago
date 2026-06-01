# Change history

> Running change log, moved out of CLAUDE.md so it does not load on every task.

*2026-05-30 — Forked from the Reid Design build; genericized to the ncs-astro-sanity-starter (core foundation + opt-in module library + bootstrap docs). Future projects start their own history from this entry.*

*2026-06-01 — Second Presbyterian Church of Chicago: full Sanity editability for a non-technical church team (PR #2, `feature/church-cms` → `master`). Configurable forms; announcement / worship-resource collections and enriched events + ministries; editable home + seasonal hero; every page's body copy and closing CTA editable via the inline-fallback pattern; FAQ page now reads the `faqItem` collection; a 13-block page builder with a background/media system on every page plus a generic `page` type at `/<slug>`. Studio polish: an in-Studio "How This Works" help center (12 guides), Studio themed to the brand (Bronze/Paper/Ink + Instrument Serif/Newsreader), editable header + footer navigation (`siteSettings.navItems` / `footerColumns`, with the built-in menus as fallback; mobile inherits the header), every document opens on the "All fields" tab, and a real favicon (bundled mark + `siteSettings.favicon` override). No destructive migrations. Full detail + decisions: `docs/church-cms-summary.md`.*
