# Second Presbyterian Church of Chicago — Content & Branding Inventory

Source: https://www.secondpreschicago.org/ (Squarespace 7.1)
Pulled: 2026-05-31. Client: Rev. Chesna Hinkley (Interim Pastor).

This is the migration source-of-truth. It maps the live Squarespace content and
branding onto the starter's seams: `src/data/site.ts`, `src/styles/globals.css`
(`@theme` block), and the Sanity seed. Verbatim copy is preserved so it can be
dropped into Studio or page files. See `docs/bootstrap/NEW-PROJECT.md` for the
order of operations.

> Status flags and open decisions are collected at the bottom under
> "Decisions needed before build."

---

## 1. Identity → `src/data/site.ts`

| Field | Value |
|---|---|
| `name` | Second Presbyterian Church of Chicago |
| `studio` | Second Presbyterian Church of Chicago |
| `domain` | secondpreschicago.org |
| `url` | https://www.secondpreschicago.org |
| `storageKeyPrefix` | secondpres |
| `themeStorageKey` | secondpres-theme |

**Tagline / slogan:** "Serving and celebrating Jesus for the good of the world"
**Hero identity line:** "The Church of the Angels in Chicago's South Loop"
**Nickname:** "The Church of the Angels"
**Denomination:** Presbyterian Church (USA) — Reformed tradition.

---

## 2. Branding → `globals.css` `@theme` + `site.ts` `brandColors`

### Color palette (pulled from computed styles)

| Role | Hex | RGB | Where it's used on the live site |
|---|---|---|---|
| Paper / background | `#ECE4DA` | 236, 228, 218 | Warm cream page background |
| Paper soft | `#F6F3EC` | 246, 243, 236 | Lighter alt section background |
| Ink / text + dark sections | `#36302A` | 54, 48, 42 | Body text (dominant) and dark section fills |
| Primary / accent (buttons) | `#B9A590` | 185, 165, 144 | Pill button fill (clay / taupe) |
| Border / light warm gray | `#E5E3DF` | 229, 227, 223 | Hairlines, dividers |

The overall feel is warm, earthy, and historic: cream paper, espresso-brown
text, a muted clay accent. Buttons are fully rounded pills (`border-radius: 300px`
→ `rounded-full`) with letter-spaced text, often translucent over hero imagery.

**Proposed token mapping** (final values are a Step 4 design-seam decision):

```
--color-paper:      #ECE4DA
--color-paper-soft: #F6F3EC
--color-ink:        #36302A
--color-primary:    #B9A590   /* clay accent */
--color-border:     #E5E3DF
--tint-rgb:         185, 165, 144   /* matches --color-primary; warm overlays */
```

> a11y note: clay `#B9A590` on cream `#ECE4DA` is low-contrast for text/links.
> The live site keeps button labels in espresso `#36302A`, not white. We will
> likely need a darker primary for links/focus rings to defend the Lighthouse
> 100 accessibility target. Flag this when setting tokens.

### Fonts

Both faces are serifs (the body font is a serif, a deliberate editorial look —
note this departs from the starter default of Inter for body).

| Token | Family | Weights used | `@fontsource` package |
|---|---|---|---|
| `--font-display` | **Instrument Serif** | 400, italic 400 | `@fontsource/instrument-serif` |
| `--font-body` | **Newsreader** | 400, 700, italic 400/700 | `@fontsource-variable/newsreader` |

Live Google Fonts request confirms:
`Newsreader:ital,wght@0,400;0,700;1,400;1,700` and `Instrument+Serif:ital,wght@0,400;1,400`.

Nav links and buttons both use Newsreader with letter-spacing. No script/calligraphic accent.

### Logo, favicon, OG image

- **Logo:** No image logo. The header brand is a **text wordmark** —
  "Second Presbyterian Church of Chicago" set in Instrument Serif. (Starter's
  Header/Footer expect `logo-light.*` / `logo-dark.*` in `src/assets/`; either
  set a wordmark image or adapt the header to render the text.)
- **Favicon (current):** https://images.squarespace-cdn.com/content/v1/68e56733ba3b0337de92cf2a/1d8e09cc-3c8d-4588-86df-7480b39a9c38/favicon.ico?format=100w → replace `public/favicon.svg`.
- **OG image (current):** http://static1.squarespace.com/static/68e56733ba3b0337de92cf2a/t/68f94ffd367cdb6d25a21d87/1761169405070/second-presbyterian-eric-allix-rogers-04.webp — a professional exterior photo. Regenerate via `npm run og` with church inputs.
- **Hero image:** full-bleed exterior photo of the historic stone sanctuary.

**Imagery source / rights:** site photography is credited to **Eric Allix Rogers**.
Confirm the church has rights to reuse these images on the new site before
re-hosting. Images currently live on the Squarespace CDN and must be re-exported.

---

## 3. Navigation / information architecture

The live top nav has six items (two are simple links, four are dropdown folders):

- **About Us** (folder)
  - Worship → `/worship`
  - Pastor & Staff → `/pastor-staff`
  - What We Believe → `/what-we-believe`
  - Music → `/music`
- **Get Involved** (folder)
  - Grow → `/grow`
  - Serve → `/serve`
  - Kids → `/kids`
- **Events** → `/events`
- **Food** → `/food`
- **Space** (folder)
  - Use Our Space → `/use-our-space`
  - Weddings → `/weddings`
  - Friends of Historic Second Church → https://www.historicsecondchurch.org/ (external)
- **Give** → `/give`

---

## 4. Page content (verbatim)

### Home (`/`)
- Tagline: "Serving and celebrating Jesus for the good of the world"
- Hero headline: "Serving and celebrating Jesus for the good of the world."
- CTA buttons: "Worship with us at 11am", "Live stream"
- Section: "The Church of the Angels in Chicago's South Loop"
  - "We gather in the abundant life of Jesus to worship, love, serve, pray, and share the gospel in word and deed. Whoever you are, you are welcome here."
- "Upcoming events" preview block: "We're formed in community. Join us for upcoming worship, fellowship, study, art, and food."
- Newsletter signup: "Subscribe to The Record"

### Worship (`/worship`)
- Heading: "Whether you're a weekly churchgoer, haven't been in ages, or don't know anything about Christianity, there's a place for you here."
- Services: 11am Sundays, traditional/liturgical format. Eucharist on the first Sunday of each month. Casual attire acceptable.
- Children: "Little ones are part of the worshipping congregation at Second, and we welcome their noise and needs." Books, coloring materials, fidget toys provided. Children's message during service. Cry room with audio stream available.
- Quote: "We are called to an everlasting preoccupation with God." — A.W. Tozer
- Resources: Live stream via YouTube; current bulletin as PDF download.

### Pastor & Staff (`/pastor-staff`)
Page heading: "Pastors & Staff". Four people (full bios below).

**Rev. Chesna Hinkley — Interim Pastor** (`/rev-chesna-hinkley`, pastorchesna@secondpreschicago.org)
Assumed Interim Pastor in fall 2024. Degrees from Princeton Theological Seminary and the University of Pittsburgh (concentration in Neuroscience). Working toward a Doctor of Ministry in Reformed Theology at Pittsburgh Theological Seminary. Ordained in 2021 at Madison Avenue Presbyterian Church in New York City, where she managed "children's ministry, mission, adult education, and the young adult group." Professional passions: "people, preaching, and strategizing for the future." Enjoys reading, traveling (23 countries and 28 states), dining with friends, and her cat, Regan.

**Rev. Judy Landt — Parish Associate** (`/rev-judy-landt`)
"The Rev. Judy Landt serves as Parish Associate at Second. She holds a Master of Divinity from McCormick Theological Seminary, BA and MAT degrees from The University of Chicago, and a JD from Illinois Institute of Technology Chicago Kent College of Law." Ordained Minister of Word and Sacrament in the PCUSA in 2003; ministry experience across Illinois, Wisconsin, and Minnesota. Background in mediation and conflict resolution with churches, families, businesses, and courts.

**Michael Shawgo — Director of Music & Organist** (`/michael-shawgo`)
From Central Illinois. "Bachelor of Music in Organ Performance from Illinois Wesleyan University in Bloomington" under Dr. David Gehrenbeck. Further study with J. Marcus Ritchie at the Cathedral of St. Philip in Atlanta and Dexter Bailey in Chicago. Member of the American Guild of Organists, the Organ Historical Society, the American Theatre Organ Society, and Phi Mu Alpha. Interests: reading "Grant Williams" by Giancarlo Stampalia; watching "Downton Abbey"; 20s/30s blues & jazz and opera.

**Ashley McLean — Office Administrator** (`/ashley-mclean`)
Experience in "communications, graphic arts, and office management." Interests include jewelry making, 3D printing, and home improvement. Lives with her fiancé and two dogs, James Brown (JB) and Bella (blind); they enjoy cooking together. Reading "The Artist's Way" by Julia Cameron; documentaries; 90s-2000s neo soul and R&B, plus audiobooks.

### What We Believe (`/what-we-believe`)
- On Humanity: "Humanity and all things, seen and unseen, were created by God out of the abundance of the divine love of the Trinity." Each person bears God's image with inherent worth and dignity. Without Christ, humanity remains captive to Sin and Death; Augustine: "Our hearts are restless until they find rest in you."
- On God: "God is love, eternally three Persons and one Being." Trinity (Father, Son, Holy Spirit) coeternal, consubstantial, coequal. God revealed through Jesus Christ, fully divine and fully human.
- On the Gospel: Christ died sacrificially to remove sin, rose bodily, continues through the Holy Spirit. Believers become "a new creation, forgiven of all their sin," with hope of resurrection and eternal life.
- Identity: **Reformed** within the PCUSA, affirming the ecumenical creeds and the PCUSA Book of Confessions; biblical authority interpreted through Christ as its center.
- Core values: Inclusive (full welcome of women and LGBTQ individuals in leadership); Neighborhood Ministry (South Loop); Authentic Worship (music, liturgy, fellowship); Warm Welcome (forming disciples through community).

### Music (`/music`)
- Heading: "Our musical life at Second". Epigraph: "I will sing of your strength, in the morning I will sing of your love." — Psalm 59:16
- Sunday worship features hymns, spirituals, and anthems accompanied by organ.
- **Quartette Choir:** revives an early-American Protestant practice. Chicago's first quartette choir was established in 1836; Second Presbyterian followed about two decades later. Today's quartet is classical professional vocalists leading congregational hymns, anthems, and service music. (Repertoire example: "Ho, Every One that Thirsteth" by Will Macfarlane.)
- **Organ:** incorporates salvaged parts of an 1873 Johnson & Son instrument destroyed in a 1900 sanctuary fire. Current organ built by the Austin Organ Company of Hartford, CT (opus 767), completed 1917. A 1930s "thundersheet" (likely from a theater) provides thunder effects in the annual performance of Théodore Dubois' "The Seven Last Words of Christ."

### Grow (`/grow`)
- Heading: "Community Groups at Second". Tagline: "Drop in and walk with others on the Way of Jesus."
- **Mid-Morning Bible Study:** "First and third Thursdays at 10 in the Pastor's Office, reading through books of the Bible together over coffee."
- **Theology on Tap:** "Third Thursdays at 7 at rotating pubs, reading short pieces of theological writing over drinks."

### Serve (`/serve`)
**"Coming Soon"** — no content yet. Need copy from the client.

### Kids (`/kids`)
**"Coming Soon"** — no content yet. Need copy from the client.

### Events (`/events`)
Heading: "Upcoming events".

Recurring:
- Worship — Sundays 11:00 AM–12:15 PM — "Sunday morning service of word and sacrament"
- Friends of Historic Second Church Tours — Sundays 12:15–1:00 PM and Saturdays 11:00 AM–3:00 PM — "Free docent-led tours by Friends of Historic Second Church"
- Lunch Bag Program — Tue–Thu 11:00 AM–1:00 PM — "Grab and go lunch bag for all in need"
- South Loop Community Table — Sundays 6:45–8:30 PM — "Free, sit-down meal for all in need, hosted by Care for Friends"
- Mid-Morning Bible Study — Thursdays 10:00–11:00 AM — "All are welcome for Bible study over coffee in the pastor's office"
- Alpha to Omega Bible Reading Group — Thursdays 5:00–6:00 PM — "Reading through the Bible together" (conference call)
- Second Church Book Group — select Sundays 9:30–10:30 AM
- Theology on Tap — select dates 7:00–8:30 PM — "Meeting at rotating pubs to discuss a short theological reading"
- Communion Sunday Potluck — select Sundays 12:30–1:30 PM

One-time (as of pull date):
- Session Meeting — Tue May 26, 2026, 6:00–8:00 PM
- South Michigan Avenue Block Fest — Sat June 27, 2026, 11:00 AM–3:00 PM — "Free fun for our neighbors of all ages, and open to the public"
- Office closures: Mon May 25 (Memorial Day), Fri June 19 (Juneteenth), Fri July 3 (Independence Day)

### Food (`/food`)
- Heading: "Find food for all in need, no questions asked, at our Cullerton door on Tuesday, Wednesday, Thursday, and Sunday."
- **Lunch Bag** (Tue–Thu, 11am–1pm): grab-and-go. "Pantry staples, produce, clothing, and hygiene items are provided occasionally as available."
- **South Loop Community Table** (Sun, 6:45–8:30pm): sit-down meal. "Come play games, listen to music, and enjoy a meal with others." Medical and social work services, occupational therapy, and clothing available. Hosted by Care for Friends. Does not operate in summer.
- CTAs: Calendar; Give to support Lunch Bag; Give to support SLCT.

### Use Our Space (`/use-our-space`)
- Heading: "Interested in using space at Second?"
- "youth sports, board meetings, worship, meal programs, social services, speakers, concerts, performance rehearsals, parties, 12-step groups, and all sorts of other events throughout the week."
- "premium South Loop location close to public transit"; "competitive rates, friendly support, and first-come, first-served free parking."
- Booking: "Get in touch below to inquire about fees and availability." For long-term: "If you are interested in a conversation about long-term space sharing, we are so excited to meet you and talk about collaboration! Please skip the form and send an email directly to the Pastor."
- (No published capacities or rates on this page.)

### Weddings (`/weddings`)
- Heading: "Weddings at Second"
- Overview: "Get married in a National Historic Landmark! Our 1901 Arts and Crafts sanctuary, home to nine Tiffany windows and extraordinary murals, attracts visitors from all over the world." Accommodates weddings of all sizes; Michigan Avenue / South Loop location near reception venues, photography, and transit.

FAQ (good candidate for `faqItem` seed):
- **Who can get married at Second?** "We welcome gay and straight couples. Because the sanctuary is a consecrated space, religious ceremonies must be Christian." Nonreligious ceremonies permitted if respectful. No dress code.
- **Music:** "Our Music Director's services are built into a typical wedding package, which may include our exceptional 1917 Austin organ and/or piano." Recorded music via CD/aux available. The organ predates standardized pitch, so instruments must tune down to it.
- **Own officiant:** "Yes! We require premarital counseling for couples married in our sanctuary." The church pastor can officiate Christian weddings; fee waived for members.
- **Eucharist:** "Ordained Protestant clergy of the sacramental tradition (Presbyterian, Anglican, Methodist, Lutheran, and certain other evangelical churches) may preside at communion with special permission of the church Session."
- **Capacity:** "The main floor of the sanctuary can seat 600 people. There is additional balcony seating, should you require it."
- **On-site support:** Wedding Coordinator at rehearsal and ceremony. Bridal Parlor and North Parlor included. Parking for 18 vehicles plus nearby public options. Sanctuary is accessible.
- **Reception:** "Our Fellowship Hall may be rented for an additional fee. Please note this is a carpeted space."

Pricing:
- Standard package (rehearsal + 3 hours wedding-day use): **$1,500**
- Officiant: **$500**
- Premarital counseling only: **$250**
- Live stream of ceremony: **$250**

### Give (`/give`)
- Heading: "Thank you for entrusting your tithes and offerings to Second"
- Single online giving option via **Vanco** (eServicePayments). Current link:
  https://www.eservicepayments.com/cgi-bin/Vanco_ver3.vps?appver3=wWsk24ZWJSTZKsGd1RMKlg0BDvsSG3VIWQCPJNNxD8upkiY7JlDavDsozUE7KG0nFx2NSo8LdUKGuGuF396vbQob3Vy7b9Yfe_jNfJWTbVeXHubq5Z7ap5JVmPEpc4ZeYHCKCZhESjGNQmZ5B-6dx5zOQjapagb4-GcDOvSEdsc=&ver=3

---

## 5. Contact, footer, social

- **Address:** 1936 South Michigan Ave, Chicago, IL 60616
- **Phone:** 312-225-4951
- **Email:** office@secondpreschicago.org (pastor: pastorchesna@secondpreschicago.org)
- **Office hours:** Tuesday–Friday, 10am–2pm
- **Food ministry entrance:** the Cullerton door
- **Social:** YouTube (@secondpreschicago), Instagram (@2ndpresbyterian), Facebook (@2ndpreschicago)
- **Affiliated external site:** Friends of Historic Second Church — https://www.historicsecondchurch.org/

---

## 6. Proposed mapping to the starter (needs review)

The starter was built for a service business, so the fit is not 1:1. Proposed:

| Live page | Starter target |
|---|---|
| Home | `index.astro` / `homePage` singleton |
| What We Believe + history | `about.astro` / `aboutPage` (or a dedicated beliefs page) |
| Worship, Music, Grow, Serve, Kids, Food | ministry/section pages — candidates for the `service` collection or bespoke pages |
| Pastor & Staff (+ 4 bios) | a staff/team collection (bios as documents) |
| Weddings | dedicated page; its Q&A seeds `faqItem` |
| Use Our Space | venue page wired to the Web3Forms contact form |
| Contact | `contact.astro` / `contactPage` |
| The Record (newsletter) | `newsletter` module |
| Give | giving page linking to Vanco |
| Events | see decision below |

---

## 7. Decisions needed before build

1. **Events.** The church leans heavily on recurring events, but there is no
   `events` module in the starter (modules are: portfolio, process, newsletter,
   lead-magnets, style-quiz, budget-calculator, shop, e-design, gift-certificates,
   press, resources). Options: build a new events module, repurpose `journal`,
   or embed an external calendar. This is the biggest structural gap.
2. **"Services" abstraction.** Decide how Worship/Music/ministries map — one
   "ministries" collection, the existing `service` collection, or standalone pages.
3. **Body font.** Confirm keeping a serif body (Newsreader). The starter default
   is a sans (Inter). The church's editorial look depends on the serif body.
4. **Primary color contrast.** Clay `#B9A590` is too light for link/button text
   on cream. Pick a darker primary or keep dark-text-on-clay, and verify a11y.
5. **Coming Soon pages.** Serve and Kids have no content. Need copy from the client.
6. **Photography rights.** Confirm the church can reuse the Eric Allix Rogers
   images; re-export assets off the Squarespace CDN.
7. **Logo.** Header brand is a text wordmark, not an image. Decide whether to
   render text in the header or commission a wordmark/mark image.
8. **Giving link.** Confirm the Vanco URL is current before wiring the Give page.
