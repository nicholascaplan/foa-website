# The Friends of Ashley Website: Project Brief

**Last updated:** 3 October 2026
**Organisation:** Parent Teacher Association for Ashley C of E Primary School, Walton-on-Thames
**Live site:** <https://www.thefriendsofashley.org/>

This is the canonical record of **what the site is, what has been decided and how it is built**. It deliberately contains no backlog or status narrative:

- Outstanding work, open questions and provisional content live in [`ACTIONS.md`](ACTIONS.md).
- Agent behaviour rules live in [`../AGENTS.md`](../AGENTS.md).
- Testing lives in [`TEST-STRATEGY.md`](TEST-STRATEGY.md).
- The documentation rules and rationale are in [`README.md`](README.md).

Contents: 1 Summary · 2 Decisions · 3 Scope · 4 Requirements · 5 Technical specification

## 1. Summary

The FOA needs a fast, welcoming and maintainable public website for parents, carers and staff. Its purpose is to answer practical questions quickly, reduce repeated or outdated WhatsApp messages, explain what The FOA does and make participation feel approachable.

Design character: a **warm, modern editorial community noticeboard**: the quick access of a bento layout with calmer hierarchy, larger typography, fewer cards and less app-like visual language.

Implementation: Astro 7 static site with typed local content collections, built locally with project CSS and deployed through GitHub Pages. The earlier hash-routed prototype is archived in `prototype/` as a design reference only.

### Routes

```text
/                       Home
/whats-on/              What's On
/events/fireworks-2026/ Fireworks on the Field
/uniform/               Uniform
/get-involved/          Get Involved
/committee/             Committee
/reps/                  Reps Hub
/meeting-minutes/       Meeting Minutes archive
/about/                 About The FOA
/contact/               Contact Us
/newsletter/            Newsletter
/privacy/               Privacy Notice
/404.html               Not found
```

The Community Notice Board and a public accessibility statement are deferred and have no route. Final event URL conventions remain open (see [`ACTIONS.md`](ACTIONS.md)).

## 2. Decisions

These are confirmed unless the project owner explicitly revises them. Edit entries in place when decisions change; do not append contradicting entries.

### Product and audience

- The audience is busy parents and carers using phones, often at drop-off or pickup.
- It is a public information and community site, not an internal committee administration system.
- The homepage first answers: "What do I need to know or do right now?" Practical information takes priority over explaining the organisation.
- Content is concise, plain-English and suitable for readers who use English as an additional language.
- The Newsletter page is an archive with a clearly identified latest issue followed by previous issues. Newsletters are reproduced in full from the source issues in `assets/`, on straight paper sheets with an FOA letterhead, each pinned to a cork noticeboard. The latest issue and the archive sit on two separate boards, drawn in CSS only (no photography). The latest issue previews its first three sections and each previous issue previews its opening section; Read more / Show less expands the rest in place with a short animation (instant under reduced motion; no dialog).
- The Meeting Minutes page archives approved FOA meeting records; the first entry is the 16th September 2026 AGM minutes. Minutes are published only after review and removal of personal or sensitive information.
- A FAQs page is later, low-priority scope.

### Design

- Warm modern editorial; community-led rather than corporate or software-like.
- Restrained cards and badges; confident editorial typography; generous spacing. Do not depend on photography.
- Interior page heroes use a centered, inset heritage-green panel rather than a full-bleed banner.
- Heritage green is the primary brand colour; amber is for events and celebratory emphasis. Warm ivory/paper surfaces.
- Typography: Georgia serif display with a system sans-serif body. Keep this unless a self-hosted pairing offers a clear brand benefit.
- Use the approved FOA logo (`assets/FOA Logo.jpg`). Do not use Ashley School branding at this stage; `assets/logo-big.png` contains the school mark and must not be used until approved.
- The supplied Fireworks image is the focal event image, but all event facts must also be available as structured text.
- The Fireworks event page shows the full poster (`fireworks-poster.jpg`) as a plain, non-interactive image with descriptive alt text: no enlarge link and no caption. On desktop (48rem and up) it sits in the right-hand column beside the schedule, in a light-green framed mat (`.poster-frame`) capped at 30rem wide. On mobile it follows the schedule as a full-width light-green band, flush with the footer, with the poster up to 28rem wide. It is deliberately not placed above the schedule, because it repeats the schedule and summary card facts.
- Committee portraits are shown compactly because source files are low resolution.
- The warm editorial direction, level of playfulness and Fireworks prominence were approved at review.
- The homepage hero introduction precedes the current-event card at every viewport, so visitors understand The FOA before seeing an event prompt.
- Homepage hero shows one of two mutually exclusive cards. The intact Welcome Tea poster (with `Upcoming event` label and `Welcome Tea` heading) shows until it starts at 13:00 on Saturday 3rd October 2026 (`archiveFrom` is a date-time). From then the Fireworks editorial card replaces it, and Welcome Tea moves from Upcoming to Past events at the same moment. The Fireworks card is centred: eyebrow, title, image, an amber date badge (weekday, day, month), a proportional timeline of the event schedule (gates open, quiet display, main display), equal-width ticket-price and location chips with aligned icons, and a full-width CTA matching the image width. Schedule times come from the event's `schedule` list in the content collection, which the Fireworks event page also renders.
- Event and sale dates matching the visitor's local date are labelled **Today** or **Tomorrow** automatically. Do not apply to newsletter dates or document metadata.
- What's On drops timed events from Upcoming at their start time. Events with `allDay` show no time and drop off at the end of their UK day. Events with `archiveFrom` use that date-time instead.
- Public date copy uses ordinal days (`5th November`, never `5 November` or `5 Nov`), including weekday forms (`Wednesday 16th December`). Use `ordinalDateFormatter` in `src/lib/dates.ts` for generated dates; the compact calendar tile (`OCT` / `02`) is the only exception.
- No event status pills in event lists or past-event cards.
- A global `[hidden] { display: none !important; }` rule protects date-driven visibility; component display rules otherwise override `hidden`.
- Quick-action rows must not animate padding on hover (it shifts text wrapping on touch devices).
- The Committee page shows the vacant Co-Secretary role as an eighth card, visually distinct from confirmed members, linking to the shared Co-Secretary enquiry email; a full-width recruitment callout remains below the grid.
- Footer: independent link columns; Ashley School Website and Donate via JustGiving links open in a new tab and are labelled as such.
- Removed on purpose: draft/readiness banners in public pages; the hash router; the earlier public Community and Accessibility pages.

### Information architecture

- Primary navigation, in order: **Home, What's On, Get Involved, Uniform**. The desktop header also shows **Newsletter** between Home and What's On; the mobile menu uses the same order, followed by Contact Us.
- Committee, Reps Hub and Meeting Minutes belong under Get Involved. About, Contact and policy pages are reached through the footer and relevant page content. Reps Hub is for class reps only, so it is linked from Get Involved (including the homepage Get involved row) and the footer, not the primary or mobile navigation.
- What's On is a chronological list: upcoming events first, then a clearly separate **Earlier this year** section of selected completed events. Past events are never mixed into the upcoming list or presented as current calls to action; completed event pages may remain for context.
- Individual events use reusable event pages. A contextual **Back to What's On** link on the event page shows only when the visitor arrived from that route.
- The 2026 Pre-loved Uniform sales are Fridays 2nd October, 6th November and 4th December at 15:25 in the school playground, card-only and subject to weather. They are listed as structured event content and link to the Uniform page.
- Homepage order: current important event or status; immediate parent tasks; What's On preview; volunteer prompt; purpose and three pillars; contact, governance and legal information.

### Personal information and safeguarding

- Committee presentation uses names and roles only, plus an approved portrait. Names and roles for 2026/27 are confirmed: Helen Platt and Sarah Parish (Co-Chairs); Clare Birks and Darren Malone (Co-Treasurers); Nick Caplan and Cristy Amponsah (Co-Comms); Lizzie Grillo (Fundraising Initiatives Lead); Co-Secretary vacant.
- Do not publish child year groups, or attribute notices to a parent plus a child's year group.
- Use the shared FOA contact route (email address and approved Google Form), not individual contact details.
- Meeting locations and schedules may be public.
- Charity wording and registered charity number are confirmed as correct.
- Final pre-publication consent check for committee names, roles and portraits is outstanding (see [`ACTIONS.md`](ACTIONS.md)).

### Language

- English-first. One Arabic RTL demonstration validates layout direction.
- Do not show a language selector that translates only part of the site.
- Safety, ticketing, accessibility, privacy and operational translations require human review.
- Name languages in text; do not use flags.

### Ticketing

- The site never processes payments or issues tickets. The Fireworks ticket journey is a normal link to an external provider, clearly described as leaving the site; no embedded checkout.
- Until a provider and URL are confirmed, the event page shows the non-interactive status "Ticket link to follow."
- Remove unverified promises (payment methods, accounts, instant e-tickets).
- Confirmed Fireworks facts: Thursday 5th November 2026; 16:30–18:30; quiet display 17:00; main display 18:00; £8.50 per person; under-2s free; Helen Platt is event lead; attractions are a Ferris wheel, fairground games, food stalls and mulled wine.
- Confirmed Pre-loved Uniform prices: £3 for coats and new-logo items, £1 for all other items, card only. Donation instruction: "If you have any uniform which you would like to donate, please drop it in the green bins by the School Office - no torn items please!"
- Christmas Fayre is Saturday 5th December 2026, led by Rachel and Sophie. Welcome Tea is Saturday 3rd October. Santa's Grotto is Wednesday 16th December 2026, run by parents and carers during the school day.

### Notice Board

- Deferred; no public route. If introduced, it is editorial and committee-managed: no unmoderated publishing, notices need publication and expiry dates, and the Committee owns review, expiry and takedowns.
- Show an honest empty state rather than invented notices.

### Reps Hub

- Messages are shareable copy with copy-to-clipboard actions, visible success/failure feedback (success clears after three seconds), class-representative wording and "Learn more" links to canonical pages. No draft or workflow labels in public copy.
- The Fireworks quiet display is scheduled for 17:00 across all pages and messages.

### Contact, donations and analytics

- Contact Us offers the shared email address and the approved Google Form. The form is unlinked/no-indexed at `/playground.html` as an experiment only.
- A persistent **Donate via JustGiving** link (`https://www.justgiving.com/charity/Friends-of-Ashley`) is in the footer, repeated on About The FOA beside the fundraising-impact content. Navigation and homepage remain free of it so it does not compete with events and tasks.
- Google Analytics (`G-V2X8ZMQ5XZ`) is consent-controlled: the tag is absent until a visitor selects **Allow analytics cookies**. Rejecting or withdrawing consent denies analytics storage and removes known Analytics cookies. The banner is non-blocking, remembers the choice locally and is reopenable from the footer.
- Required Google Analytics property settings: 2-month event/user retention with reset-on-activity disabled; Google Signals and user-provided data disabled; email redaction active; no advertising, cross-domain or connected-site integrations.
- Do not add other optional technologies without extending the Privacy Notice and consent control.
- The Privacy Notice at `/privacy/` covers website enquiries, the external Google Form and consented analytics. Shared-inbox and Google Form retention are recorded as pending.

### Technical direction

- Astro 7, static output, separate generated pages and normal path-based links. Never use hash routing.
- Typed local content collections are the interim source for events, newsletters and committee members until a CMS is chosen. Keep models compatible with a later CMS adapter. Sanity is a candidate only.
- CSS is built locally with central tokens; no Tailwind CDN. Prefer zero client JavaScript for static content.
- Client JavaScript is limited to the mobile menu, Today/Tomorrow labels, time-sensitive event placement, the newsletter expand/collapse, Reps Hub clipboard actions and the cookie banner.
- GitHub Pages hosting, deployed from `main` through a verification gate. Production builds target `https://www.thefriendsofashley.org/` at the root path.
- Metadata: canonical, Open Graph and Twitter tags, compact FOA favicon (white square, bold heritage-green `F`, with PNG fallback), Event structured data, sitemap, robots rules, a useful 404 page.
- The closed mobile menu is `inert` so hidden links cannot take keyboard focus.
- Asset URLs must go through the shared `withBase()` helper so the site works at both root and the temporary `/foa-website/` base path.
- Development-only controls (Mobile preview, Reset cookie consent) are omitted from production builds. In local desktop development, they are compact, accessible icon buttons fixed together at the top centre of the viewport, clear of the page text.

## 3. Scope

### MVP (delivered or in progress)

Responsive homepage; What's On with earlier-this-year section; reusable event pages and the Fireworks 2026 page; external ticket link; Pre-loved Uniform hub; Get Involved, Committee and the Co-Secretary vacancy; Reps Hub; Meeting Minutes archive; Newsletter; About The FOA and three pillars; shared contact route; Privacy Notice; SEO metadata, sitemap and canonical URLs; GitHub Pages deployment.

### Later scope

See [`ACTIONS.md`](ACTIONS.md) → Later.

### Out of scope for MVP

- Auctions or bidding
- Processing payments or issuing tickets on the site
- Parent accounts or custom authentication on GitHub Pages
- An open, unmoderated community feed or public self-service notice publishing
- Internal committee task management
- Storing child information, or publishing child year groups alongside named adults
- A guarantee of six complete languages
- Real-time dynamic content without a static rebuild
- Dependence on a large professional photography library

## 4. Requirements

### 4.1 Functional

**Global navigation**
- Home, What's On, Uniform and Get Involved are reachable from every public page.
- Mobile navigation is a real menu. Back, forward, refresh, bookmarks and shared links work through real URLs. The current page is identifiable.

**Homepage**
- Show the most important current event prominently; direct routes to current events, uniform, Get Involved (which covers class reps) and the latest newsletter (title and date generated from the newsletters collection); an upcoming-event preview; current volunteer needs; purpose and three pillars without displacing practical information; contact and charity information in the footer.

**What's On**
- Upcoming events in chronological order, each with date, name, time, location and status where available.
- Past events separated under **Earlier this year**, with completed-event styling and no ticket calls to action.
- Event data model supports upcoming, on-sale, sold-out, cancelled and completed states.

**Event pages**
- Title, date, time, location, schedule and concise summary; ticket price and external link where relevant, clearly identified as external.
- Accessibility and practical-attendance information, cancellation/refund information (or a link), attractions and FAQs where relevant, and a last-reviewed date for operational information.
- No unverified provider or accessibility claims.

**Uniform**
- How and where to donate; next confirmed sale date, time and location; price list; accepted/rejected items; payment methods; a contact route for questions or size requests if supported. The page hero leads with two actions: "Email the Preloved team" (prefilled subject and body asking for sizes and quantities) and "Fill in the Google Form" (external request form).

**Get Involved and Committee**
- Explain that meetings are informal and open to all; show current approved committee names and roles and active vacancies; explain time commitment and support; provide the shared contact action; expose no unnecessary information about children.

**Reps Hub**
- Approved, current messages, each linking to the canonical source page, with visible copy success/failure feedback. Native sharing optional. Messages need review and expiry dates; stale messages must not appear as current.

**Community Notice Board (if restored)**
- Only committee-approved notices, each with a category, publication state and expiry date; expired notices excluded automatically; no unmoderated publishing; a takedown/contact route.

**Language support**
- Correct document language; RTL set at document level; shareable locale routes if several locales launch; predictable and honest fallback; human review for safety-critical and transactional translations.

**Content management (once a CMS exists)**
- Non-technical editors can update time-sensitive content without code, preview before release, with validated required fields and dates, publication/expiry support, static rebuild on publish, and failed builds visible to an identified owner.

### 4.2 Non-functional

**Mobile and responsive**
- Mobile-first from approximately 320px upward, with deliberate tablet and desktop layouts. Touch targets around 44×44 CSS pixels. Nothing important depends on hover.
- At the narrowest widths, secondary brand text and multi-column layouts may simplify to protect readability.
- On mobile, show useful task or event information early with a restrained heading scale.

**Accessibility**
- Target WCAG 2.2 AA. Semantic landmarks, headings, lists, links, buttons and forms; skip link and visible keyboard focus; do not rely on colour, icons or emoji alone; announce asynchronous feedback; respect `prefers-reduced-motion`; support 200% zoom and text enlargement.
- Keep important body copy comfortably readable; avoid tiny text.

**Performance**
- Static rendering; no client JavaScript for non-interactive content; local CSS; system fonts or a minimal self-hosted set; optimised images with declared dimensions; test under representative mobile network conditions.

**Privacy and safeguarding**
- Collect no personal information unless necessary for an approved feature. No CMS write credentials or private data in client code. Complete the publication-consent check for portraits and any biographies. Avoid child associations. Publish a privacy notice describing processors and retention. Define moderation, expiry and takedown for notices.

**Security**
- HTTPS via GitHub Pages. Secrets only in approved deployment secret stores; never GitHub tokens in webhook URLs or client code. Least-privilege CMS roles. A practical Content Security Policy compatible with required providers. Render external CMS content safely.

**SEO and sharing**
- Unique titles and descriptions; canonical URLs; sitemap and robots; Open Graph; accurate Organisation and Event structured data; `hreflang` only for complete shareable locale routes; a useful 404.

**Maintainability**
- Reusable layouts and components; central design tokens; **event facts in one structured source** rather than duplicated strings; documented content ownership and annual committee handover; build and deployment instructions in the repository.

## 5. Technical Specification

### 5.1 Current architecture

```text
Typed Astro content collections (src/content/)
        |
        v
GitHub Actions: check -> build -> site tests -> Playwright/axe
        |  (all must pass)
        v
GitHub Pages at www.thefriendsofashley.org
        |
        +--> External ticket provider (payment and ticket issuance)
```

Source layout:

- `src/pages/`: one `.astro` file per route
- `src/layouts/`, `src/components/`: shared shell, navigation, event and content components
- `src/content/`: typed collections for events, newsletters and committee members
- `src/styles/global.css`: design tokens and responsive component styles
- `assets/`: brand assets, event images, committee portraits and source documents
- `tests/site.test.mjs`, `tests/e2e/`: generated-site and browser tests
- `prototype/`, `fundraising-progress-options.html`: archived/unlinked design references
- `.github/workflows/deploy.yml`: build, verify and deploy

### 5.2 Hosting, domain and deployment

- Pushes to `main` run `npm run verify`; `dist/` is uploaded and deployed only if it passes, with concurrency so older builds cannot overwrite newer ones. The workflow installs Chromium for Playwright.
- The workflow builds with `SITE_URL=https://www.thefriendsofashley.org` and `BASE_PATH=/`. The canonical domain is `www.thefriendsofashley.org`, with HTTPS enforced by GitHub Pages; the apex domain redirects to `www`. `SITE_URL` is not needed for ordinary local development.
- DNS is at 123 Reg: apex A records point to GitHub Pages (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) and `www` is a CNAME to `nicholascaplan.github.io`. Existing email, SPF, DKIM, DMARC and nameserver records must not be changed.
- The custom domain is assigned to this repository (`nicholascaplan/foa-website`). The earlier pre-launch holding page lives in `nicholascaplan/foa-holding-page` and no longer holds the domain.
- The temporary repository-path review deployment at `https://nicholascaplan.github.io/foa-website/` uses a `/foa-website/` base path; it is not the canonical configuration. Navigation, metadata and assets must keep working at both root and base paths.
- Define a failed-production-build notification route and preview builds before CMS publication (see [`ACTIONS.md`](ACTIONS.md)).

### 5.3 CMS (not selected)

Sanity is the candidate, not a dependency. Do not select or integrate a CMS until content ownership, editor access, preview and publishing workflows are confirmed. Required capabilities: friendly authentication for non-technical volunteers, structured schemas, draft preview, role-based access, validation, publication and expiry dates, image handling, API access during static builds, secure build triggering, and clear ownership with yearly access handover. Sanity pricing, editor limits, authentication and webhook behaviour must be revalidated before adoption.

If adopted, the build would be triggered by an authenticated CMS publish event.

### 5.4 Minimum content models

Models for a future CMS (current Astro collections cover events, newsletters and committee members). Do not include child information by default.

- **Site settings:** site name, school relationship wording, charity number, shared contact address, social links, default locale, footer/legal links.
- **Event:** title, slug, summary, start/end date-time and timezone, location, status, schedule items, ticket products/prices, external ticket URL, ticket availability, past-event display state and current-year archive inclusion, attractions, accessibility information, weather/cancellation and refund information, FAQs, publish/expiry dates, last reviewed date, SEO metadata, locale and translation review state.
- **Committee member:** display name, role, optional approved biography, optional consented portrait, display order, start/end dates, visibility status, consent/review date.
- **Role vacancy:** title, summary, responsibilities, estimated time commitment, support/handover details, contact action, status, opening/closing dates.
- **Uniform information:** donation location and instructions, accepted/rejected items, sale dates, price rows, payment methods, contact/help text, last reviewed date.
- **Rep message:** title, body, canonical page, locale, approval status, publish/expiry dates, last reviewed date.
- **Notice (if restored):** title, summary/body, category, activity date-time, location, approved attribution, moderation status, publish/expiry dates, takedown state, internal moderation notes.

### 5.5 Internationalisation

- Locale-prefixed routes if several languages launch (for example `/ar/`, `/pl/`); correct `<html lang>` and `<html dir>`; locale-aware formatting; stored translation status and source revision; no silent mixing of incomplete English and translated content; defined fallback; `hreflang` for complete equivalents; test with genuine Arabic and Urdu content.

### 5.6 Ticket integration

- Payments and ticket issuance stay with the external provider. A normal external link is preferred; use an embed only if the provider officially supports it and it passes accessibility, privacy, cookie and CSP review. Show ticket availability only from a reliable data source. Never expose provider secret keys in browser code.

### 5.7 Quality gates

Required before launch and enforced in CI where noted:

- Type checking and content validation (`npm run check`; CI)
- Production build (CI)
- Generated-site contracts, including internal links and assets (CI)
- Playwright navigation journeys and representative axe scans (CI)
- Dependency audit (`npm audit`)
- Keyboard testing and representative screen-reader testing (manual)
- Responsive visual checks and mobile performance checks (manual/scheduled)
- Metadata and structured-data validation
- CMS draft/publish/expiry testing and ticket-provider end-to-end testing (when those features exist)

Scope, layers, cadence and implementation order are in [`TEST-STRATEGY.md`](TEST-STRATEGY.md).
