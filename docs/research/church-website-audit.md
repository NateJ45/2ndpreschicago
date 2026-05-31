# Church Website Audit — Second Pres vs. 10 Strong Presbyterian Sites

Date: 2026-05-31. Purpose: compare our project site against best-in-class Presbyterian church websites and identify what to change. Findings feed the implementation plan at `docs/superpowers/plans/2026-05-31-church-template-upgrade.md`.

## Sites researched

Highland Park Presbyterian (Dallas, hppres.org — the named gold standard), Fourth Presbyterian (Chicago, our closest peer: historic urban landmark), Menlo Church (Bay Area, modern exemplar), Redeemer (NYC), National Presbyterian (DC), Village Presbyterian (Kansas City, inclusive PCUSA, our closest values peer), Myers Park (Charlotte), Tenth Presbyterian (Philadelphia), Peachtree (Atlanta), First Pres Orlando, First Pres Houston, Second Presbyterian (Memphis).

---

## What the strong sites consistently do

**Information architecture (shallow, verb/audience-based).** Nav stays to ~5-7 items organized around what a visitor wants to *do*: Visit / I'm New, About, Worship (or Watch), Connect / Get Involved, Give, Events. Menlo: `Visit · About · Watch · Ministries · Give`. Peachtree: `About · Visit · Connect · Watch · Events · Give`.

**Homepage anatomy (repeatable modules).** A near-universal pattern: (1) photo hero with a one-line emotional welcome + service times + a single primary CTA; (2) a short mission/welcome line; (3) a 3-card "next step" row (typically Watch / Connect / Serve or Give); (4) latest sermon or "this Sunday"; (5) events; (6) newsletter/contact. Fourth, Village, and Menlo all open with a hero + an overlay info card naming *this week's* worship.

**Lead with belonging, not doctrine or heritage.** Every site opens with welcome ("Hope is for everyone," "All are invited. All are included. All are loved.," "Wherever you are in your journey of faith, we are here for you"). History and theology live deeper in the IA as credibility, not as the front door.

**Concrete first-visit logistics.** Service times, address, parking, childcare/nursery, "come as you are," and accessibility are stated plainly and early. National Pres and Memphis explicitly call out accessibility (large-print, hearing assist, special-needs). Lowering visitor anxiety is treated as a primary job.

**Worship as living content.** A persistent Watch/Livestream link plus a searchable **sermon archive** organized by series and speaker is standard (Tenth, Peachtree, National Pres, Menlo). Several connect sermons to small-group next steps.

**Authentic people photography.** The current standard is warm, candid photos of real congregants — faces, families, diverse ages — not stock and not only architecture. Menlo and Village both lead with people; best-practice writeups single this out as the #1 modern shift.

**Explicit values / mission.** Memphis's "Retell, Reimagine, Repair," Fourth's "A Light in the City," Village's affirming language + pride flag. A crisp, repeatable mission and named values differentiate far more than a generic welcome.

**Typography + color.** Split between bold modern sans (Menlo: Gotham 900 uppercase; Fourth: Source Sans) and editorial serif (Village: Adelle serif headings). Serif is fully legitimate for a historic PCUSA church. Palettes are a single brand color (Menlo teal/blue, Fourth purple, Village navy) over white, with warm accents. Buttons trend to rounded/pill. Motion is restrained: fades, gentle reveals, hero carousels.

---

### Featured exemplar — Highland Park Presbyterian (hppres.org)

The most polished site reviewed and the client's named gold standard. Specific techniques worth copying:
- **Type pairing:** display serif (Abril Titling) + clean sans body (Proxima Nova) — the premium editorial norm. The hero emphasizes key words in a second color ("Find & Follow" set in sage against deep teal).
- **Hero:** split layout — an oversized serif headline + two pills ("Sundays" in gold, "Find Your Place" outline) on the left, an **arched-top candid photo** (a congregant serving, not the building) on the right. The arch is a quiet architectural nod.
- **Service band:** immediately under the hero, a table of every gathering by style / time / location (Classical, Contemporary, plus a "Family of Churches" with Chinese + All Nations services) — instant "when and where" clarity.
- **Nav:** a utility row (Live · Events · Give · search) above a five-item bar (I'm New · Ministries · Who We Are · Sermons · Sundays). Visit, Watch/Sermons, and Give are all one click away.
- **Palette:** off-white + deep teal + sage + liturgical gold. Calm, premium, unmistakably a church.
- **Mission:** "Helping people find and follow Jesus" and "a family of churches for the flourishing of the city."

Our warm-editorial design sits in the same tier; the gaps Highland Park exposes are experiential (an arched/elegant photo treatment, a service-info band, key-word color emphasis, and Sermons + I'm New in the nav) and are already captured in the plan.

## How our site compares

| Dimension | Strong peers | Our site today | Verdict |
|---|---|---|---|
| Typography | Mixed; serif is valid (Village) | Instrument Serif + Newsreader, editorial | **Ahead** — more distinctive than most |
| Color / palette | Single brand color + white | Warm cream / espresso / bronze, light+dark | **Ahead** — cohesive, on-theme |
| Motion / polish | Restrained fades/carousels | Scroll reveals, Lenis, card-lift, view transitions | **Ahead** |
| Buttons / components | Pills common | Pill CTAs, card system | **On par** |
| Nav / IA | 5-7 verb/audience items | About Us / Get Involved / Events / Food / Space / Give | **On par** (slightly deep; "Space/Food" are unusual top-level) |
| Homepage structure | Hero + welcome + next-step cards + this-Sunday + events | Hero + welcome + worship + get-involved + events teaser | **On par** |
| **Photography** | Authentic people + interiors | One building exterior, text-forward elsewhere | **Behind** — biggest gap |
| **Sermons / media** | Livestream + searchable archive | A "Watch Online" link only | **Behind** |
| **"I'm New" experience** | Dedicated, concrete first-visit page | Worship page covers some | **Behind** |
| **"This Sunday" specifics** | Date/preacher/series up front | Generic "Sundays at 11am" | **Behind** |
| Inclusivity signal | Explicit + visual (Village) | In copy, not visually foregrounded | **Behind** (we're affirming PCUSA — a differentiator) |
| Newsletter capture | Standard email signup | "The Record" mentioned, signup off | **Behind** |
| Events | Calendar + detail | Full Events module | **Ahead** |
| Giving | Persistent Give | Give in nav + page (Vanco) | **On par** |
| Accessibility callouts | Stated (NPC, Memphis) | None yet | **Behind** |

**Bottom line:** our *design system* (type, color, motion, components) already meets or beats the peer set and is more editorially distinctive. The gaps are **content and experience**, not aesthetics.

---

## Prioritized gaps to close

1. **Photography.** Lead with people and show the interior. Pull the Eric Allix Rogers congregation/Tiffany-window/sanctuary-interior images and weave them across home, worship, about, music. Add a people-forward hero option.
2. **Sermons / media section.** Add a `/sermons` (or `/watch`) experience: latest message + a livestream link + an archive (a Sanity collection in the template). This is core church content we're missing.
3. **"I'm New / Plan a Visit" page.** One page that answers first-visit anxiety concretely: what to expect, when/where, parking, childcare, accessibility, "come as you are," what to do when you arrive. Make it the primary hero CTA destination.
4. **"This Sunday" module.** A home + worship element naming the upcoming service (date, preacher/series, online link), editable in Sanity.
5. **Inclusivity, foregrounded.** Make "All are welcome" a visible, intentional moment (a short affirming statement block), fitting an affirming PCUSA congregation, without it feeling like a marketing slogan.
6. **Newsletter / The Record.** A real signup block (provider-ready) on home + footer.
7. **Accessibility note.** State accessibility + nursery + parking on the Visit/Worship page.
8. **IA polish.** Consider adding "I'm New" and "Watch/Sermons" to the primary nav; the current "Food" and "Space" top-level items are unusual — keep them but ensure Visit/Watch/Give read first.

## Template-reuse implications

Build each of the above as **configurable, content-driven** pieces so the result is a reusable general church template, not a one-off:
- Sermons as a module (`modules/sermons/`) mirroring the events module pattern.
- "This Sunday" + the Visit page driven by Sanity singletons with inline fallbacks (the established pattern).
- Photography wired through `SanityImage` with bundled fallbacks so a new church swaps images without code.
- An affirming-statement and newsletter block that are toggle/config-driven (a church that is not affirming can omit it).
- Keep all new color/type within the design-seam tokens so a reskin stays a one-file change.
