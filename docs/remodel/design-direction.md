# Remodel Phase 2 — Design Direction

Date: 2026-05-31. Branch: `redesign/church-remodel`. Decision record for the visual remodel.

Source of truth: `docs/research/church-website-audit.md` (10 strong Presbyterian sites, Highland
Park Presbyterian as the named gold standard). The research already screen-studied the peer set;
this remodel builds from those distilled patterns rather than re-screenshotting all ten, to keep
the effort on execution. Where a specific decision copies a peer, it is cited inline.

## The problem we are solving
The site was forked from a warm-monochrome interior-designer template. Its *tokens* are good, but
two things make it read as "the template": (1) a warm-only palette identical in feel to the source
build, and (2) generic structure (standard two-row header, full-bleed scrim hero, a stack of
identical full-width bands). The fix is a distinctively ecclesiastical **palette evolution** plus
**church-specific structure**, not a teardown of the (strong) type and motion system.

---

## 1. Identity tokens

### Palette — keep the warm base, add a liturgical cool counterpoint
The warm identity (Paper cream `#ECE4DA`, Espresso `#36302A`, Bronze `#8A6A43`) is genuine to this
landmark church and stays. The differentiator is a new **Chapel** accent: a deep Tiffany-glass
green-teal drawn from the church's own stained glass (Second is "The Church of the Angels," with
nine Tiffany windows). Warm gold + cool stained-glass green is unmistakably a historic church and
breaks cleanly from the warm-mono template.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-chapel` | `#1E423B` (deep fir/Tiffany green) | `#3E6F63` (lifted, for text-on-dark) | Utility bar bg, footer base, FinalCta bg, keyword emphasis, ornaments |
| `--color-chapel-deep` | `#16322C` | `#16322C` | Footer/CTA deepest base |
| `--color-chapel-foreground` | `#F1EAD9` (warm cream) | `#F1EAD9` | Text on chapel surfaces |
| `--color-gold` | `#A07D45` (liturgical gold, a touch warmer/brighter than bronze) | `#C7A875` | Small accents, keyword emphasis alt, rules |

Bronze remains the primary CTA color. Chapel is the new structural color (bars, footer, closing
CTA) and the cool keyword-emphasis color. AA contrast verified for cream-on-chapel (`#F1EAD9` on
`#1E423B` ≈ 9.2:1) and chapel-on-cream for headings.

### Type — keep, push the editorial signature
Instrument Serif (display) + Newsreader (body) stay; the research rates serif a strength and more
distinctive than most peers. New editorial device copied from Highland Park ("Find & Follow" in
sage): **keyword color emphasis** — one key word in a headline set in chapel green or gold. Add a
`.kw` helper span. Eyebrows stay uppercase tracked.

### Shape — the arch motif (the signature)
The building is Gothic Revival; Highland Park uses an arch as "a quiet architectural nod." Add a
reusable **arched-top** treatment (`.arch-top`, a large top radius forming a Romanesque rounded
crown) applied to hero photo, staff headshots, ministry/feature images. Repetition makes it the
site's visual fingerprint. Buttons stay pill. Cards gain a slightly larger radius for warmth.

---

## 2. Header — utility bar + church nav (breaks the template default)
Replace the muted designer "eyebrow strip" with a **Chapel-green utility bar** (Highland Park's
utility row): left = service time + address (`Sundays at 11am · 1936 S Michigan Ave`); right =
`Watch Live`, `Give`, Instagram/Facebook, theme toggle. Cream text on deep green — an immediate,
church-coded signal at the very top of every page.

Main row stays on cream: serif wordmark left, server-rendered primary nav (`I'm New`, `About Us`,
`Get Involved`, `Watch`, `Events`, `Space`, `Give`) with the existing accessible `<details>`
dropdowns, and a gold **Plan a Visit** pill. (Desktop nav stays server-rendered per CLAUDE.md.)
Drops the interior-designer `availabilityStatus` pill entirely.

## 3. Footer — a real church footer on Chapel green
Rebuild from the light-muted strip into a **Chapel-green footer** (cream text), a strong structural
departure visible site-wide. Columns: (1) Service times + address with a "Get directions" map link;
(2) Visit / Get Involved links; (3) Connect links; (4) Get in touch (email, phone, office hours,
socials) + the mission line. Bronze accent stripe stays on top. Newsletter block above when enabled.

## 4. Hero — split layout with an arched photo (the home showcase)
Replace the full-bleed dark scrim hero with Highland Park's **split hero** on cream: left column =
eyebrow, oversized serif headline with one keyword in chapel/gold, subhead, two pills (Plan a Visit
gold, Watch outline), and a one-line "This Sunday" detail; right column = an **arched-top photo**
(sanctuary / Tiffany window) with a thin bronze frame. Stacks on mobile. This is the single biggest
break from the template and the clearest "purpose-built church" signal.

Interior pages keep a refined full-bleed Sanity-image hero (shorter, keyword emphasis, a gold
baseline rule) so they stay cohesive without each needing a bespoke layout.

## 5. Sections — vary the rhythm, kill the identical bands
Distinctive, reusable section components replace the uniform band stack:
- **Service-times band** (Highland Park "service band"): a compact card under the hero stating the
  gathering(s), in-person + online, communion cadence, with Plan a Visit / Watch actions.
- **Welcome**: asymmetric two-column with an arched feature image.
- **Inclusive welcome**: a centered Chapel-green quote block (foregrounds the affirming PCUSA
  identity the research flags as a differentiator).
- **Next steps**: ministry cards with arched images, audience-oriented (Grow / Serve / Kids / Food).
- **This Sunday / latest sermon** + **Events rhythms** + **Newsletter (The Record)**.
- **FinalCta** restyled onto Chapel green (was espresso) so the closing band is the cool anchor.

Layouts alternate width and image side; chapel-green bands punctuate the cream so the page reads as
composed sections, not a uniform stack.

## 6. Motion — keep it, it is already restrained
Astro View Transitions, Lenis, scroll reveals, card-lift, hero Ken Burns, the entry stagger all
stay (the research rates our motion ahead of peers). New arch images get the existing `img-zoom`
treatment. Nothing new that risks performance or accessibility. Build in light AND dark, both
viewports, per CLAUDE.md.

## 7. Schema implications (feeds Phase 4)
Tokens and components above are content-driven: chapel/gold/arch are one-file token changes; the
service-times band, this-Sunday line, ministry cards, and staff list become Sanity-editable
(`siteSettings` service times + mission, new `homePage` church fields, new `ministry` and
`staffMember` collections). Keeps the result a reusable church template, not a one-off.
