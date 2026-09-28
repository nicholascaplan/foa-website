# The Friends of Ashley Website: Project Brief and Status

**Status:** First full-route Astro implementation complete and deploying to GitHub Pages for mobile review; current route and UX refinement pass complete
**Last updated:** 28 September 2026  
**Project:** The Friends of Ashley (FOA) website
**Organisation:** Parent Teacher Association for Ashley C of E Primary School, Walton-on-Thames

This is the canonical record of the project's current state, decisions, requirements and next actions. Update it whenever a material product, design, content or technical decision is made.

Agent working conventions, including the session-closure protocol, are recorded in [`../AGENTS.md`](../AGENTS.md).

## 1. Executive Summary

The FOA needs a fast, welcoming and maintainable public website for parents, carers and staff. Its primary purpose is to answer practical questions quickly, reduce repeated or outdated WhatsApp messages, explain what The FOA does and make participation feel approachable.

The agreed design direction is a **warm, modern editorial community noticeboard**. It combines the quick access of the original Bento concept with a calmer hierarchy, larger typography, fewer cards and less app-like visual language.

A responsive static prototype was created and has now been migrated into a static Astro implementation with separate routes for:

- The homepage
- The Fireworks on the Field event page
- Mobile navigation
- An external ticket-provider handoff
- Home, What's On, Uniform, Get Involved and Committee
- Reps Hub, Newsletter, About and Contact

The first Astro implementation and current route/UX refinement pass are complete. The next phase is generated-site visual review and operational content resolution; formal accessibility testing, a public accessibility statement and CMS selection remain later work.

## 2. Where We Have Got To

### Discovery and review completed

- Reviewed the original engineering specification.
- Reviewed the initial interactive HTML design playground.
- Assessed information architecture, usability, visual hierarchy, accessibility, internationalisation, privacy, safeguarding, content governance and technical feasibility.
- Identified that the original prototype was a useful design sandbox but not implementation-ready.
- Identified that the most important pre-build issues were content hierarchy, operational ownership, personal-data policy, multilingual scope, ticketing and notice-board moderation.

### Design direction agreed

- Use the original Community Bulletin/Bento idea as the foundation.
- Borrow direct utility patterns from the Frictionless App concept.
- Avoid presenting the public site as a SaaS dashboard or administrative application.
- Use a warm editorial character with school heritage cues.
- Prioritise current events and practical parent tasks over organisational messaging.
- Use task-oriented top-level navigation.
- Use names and roles only for committee members in the prototype.
- Demonstrate English content plus one representative RTL layout rather than pretending all six languages are complete.
- Use an external ticket-provider call to action instead of a simulated internal checkout.

### Higher-fidelity prototype completed

The repository currently contains:

- `index.html`
  - Single-file, hash-routed responsive prototype for Home, What's On, Uniform, Get Involved, Community, Committee, Reps Hub, Newsletter, About, Contact and Fireworks
  - Task-oriented desktop and mobile navigation that changes views without a new page load
  - Co-Secretary vacancy strip
  - Warm editorial hero
  - Featured Fireworks event
  - Quick parent actions
  - What's On preview
  - Volunteer recruitment feature
  - Moderated community notice preview
  - Upcoming and past event separation, including the Welcome Tea completed-event treatment
  - Clearly private prototype patterns for sold-out, cancelled and completed events
  - Newsletter page with a Latest Newsletter section and Previous Newsletters section
  - Readable 28 September 2026 issue and supplied Back to School issue summary
  - Honest empty, draft-policy and pending-ticket states where approved production content is unavailable
- `styles.css`
  - Brand and component tokens
  - Responsive layouts
  - Mobile menu and instant phone-preview styles
  - Visible focus states
  - Reduced-motion support
  - Mobile-first spacing and typography overrides, including explicit desktop phone-preview overrides
- `script.js`
  - Working mobile navigation
  - Escape-key mobile-menu closing
  - Hash-route view switching
  - Instant desktop-only phone preview that resizes the loaded prototype instead of loading an iframe
  - Automatic Today/Tomorrow labels for event and sale dates only
- `assets/`
   - Committee portrait assets supplied by the project owner
   - `welcome tea.png`, the supplied Welcome Tea poster for the past-event example
   - Supplied Fireworks event image
  - `logo-big.png`, a supplied purpose/three-pillars graphic for The FOA containing the Ashley School mark
  - The event image is used on the homepage and Fireworks page
  - Committee portraits are used on the Committee page at intentionally modest display sizes
  - The purpose graphic is not yet used because Ashley School branding is currently out of scope
  - `FOA KEY EVENTS CALENDAR 2026-2027 (1).pdf` is the reference for confirmed 2026 event and Preloved Uniform dates

### Verification completed

- JavaScript syntax passes `node --check`.
- Git whitespace checks pass.
- Local file references resolve.
- All prototype views are served from `index.html`; local asset references resolve.
- Core semantic elements, labels, skip links and reduced-motion handling are present.
- Full visual regression and browser automation testing has not yet been added.

### Astro implementation completed

- Astro 7 now generates separate HTML pages for all agreed routes; the hash router is not used in production pages.
- The former single-file review tool is archived in `prototype/`.
- Shared layouts and components provide global navigation, footer, page heroes, event lists and date labels.
- Typed local content collections are the confirmed interim source for events, newsletters and committee members until a CMS is selected.
- Only the mobile menu and Today/Tomorrow event labels use client-side JavaScript.
- Canonical, Open Graph and Twitter metadata, Event structured data, sitemap generation, robots rules and a 404 page are implemented.
- A GitHub Pages workflow checks, tests, builds and deploys the static output at `https://nicholascaplan.github.io/foa-website/` for mobile review; the final custom domain remains to be configured.
- The temporary review deployment uses the `/foa-website/` repository base path. The project still targets root hosting when a custom domain is selected.
- `npm run verify` passes Astro/TypeScript diagnostics, the production build, a rendered-homepage smoke test and a generated internal-link/asset crawl. `npm audit` reports zero vulnerabilities.

## 3. Decisions Made

These decisions are considered confirmed unless the project owner explicitly revises them.

### Product and audience

- The primary audience is busy parents and carers using phones, often outside the school at drop-off or pickup.
- The website is a public information and community site, not an internal committee administration system.
- The homepage should first answer: "What do I need to know or do right now?"
- Practical information takes priority over explaining the organisation.
- Content should be concise, plain-English and suitable for readers who use English as an additional language.
- A Newsletter page will provide a blog-style archive for the latest and previous newsletters from The FOA.
- An FAQs page is a later, low-priority addition and is not required for the immediate prototype work.

### Design

- Overall character: **warm modern editorial**.
- Concept direction: simplified Community Bulletin/Bento, with selective utility patterns from the Frictionless App.
- The site should feel community-led rather than corporate or software-like.
- Use restrained cards and badges rather than putting every item in a visually equal container.
- Use confident editorial typography and generous spacing.
- Avoid depending on photography for the overall design.
- Use the supplied Fireworks image as a focal event image while keeping all event facts available as structured text.
- Use the supplied committee portraits on the Committee page.
- Keep portrait presentation compact because the source files are low resolution.
- Replace the prototype leaf mark with the approved logo for The FOA in `assets/FOA Logo.jpg`.
- Do not use Ashley School branding at this stage.
- Heritage green is the primary brand colour.
- Amber is primarily for events and celebratory emphasis.
- Warm ivory/paper surfaces replace the earlier slate-heavy visual treatment.
- Use a legible sans-serif body face and a restrained serif display face.
- The current prototype uses system fonts to avoid external font dependencies during design review.
- Keep the current Georgia and system-sans typography for now; review a future self-hosted font pairing only if it provides a clear brand benefit.

### Information architecture

Agreed top-level navigation:

1. Home
2. What's On
3. Get Involved
4. Uniform

Expected grouping:

- Committee and Reps Hub belong under Get Involved.
- The Community Notice Board is deferred and has no current public route.
- Individual events use reusable event pages.
- What's On should be a chronological list before considering a calendar grid.
- What's On should show upcoming events first, followed by a clearly separate **Earlier this year** section for selected completed events. Welcome Tea is the first example to include, using the supplied poster as the source for event information.
- Past events must not be mixed into the upcoming list or presented as current calls to action; completed event pages may remain available for context, photos/posters and sharing.

### Homepage hierarchy

The intended order is:

1. Current important event or status
2. Immediate parent tasks
3. What's On preview
4. Volunteer vacancy or participation prompt
5. The FOA purpose and three pillars
6. Contact, governance and legal information

### Personal information

- Prototype committee content should use names and roles only.
- Do not display children's year groups in the prototype.
- Do not attribute public notices using a parent's name plus their child's year group.
- Use the shared contact address for The FOA rather than individual contact details.
- The project owner has requested that supplied committee portraits be included.
- A final names, roles and publication-consent check remains part of pre-launch content approval.
- The 2026/27 committee names and roles are confirmed: Helen Platt and Sarah Parish, Co-Chairs; Clare Birks and Darren Malone, Co-Treasurers; Nick Caplan and Cristy Amponsah, Co-Comms; Lizzie Grillo, Fundraising Initiatives Lead; Co-Secretary vacant.
- All seven supplied committee portraits may be used in the design prototype. Higher-resolution replacements are required before production launch.

### Language and internationalisation

- The current prototype is English-first.
- It includes one Arabic RTL demonstration to validate layout direction.
- Do not display a six-language selector that only translates part of the site.
- Published safety, ticketing, accessibility, privacy and operational translations require human review.
- Language names should be the primary labels; national flags should not stand in for languages.

### Ticketing

- The FOA site should not pretend to process payments itself.
- The MVP will link to a selected external ticketing provider.
- The ticket-provider CTA must clearly describe that the user is leaving for an external checkout.
- The current dialog is a prototype placeholder only.
- Remove unverified promises about payment methods, accounts and instant e-tickets until a provider is selected.
- The production ticket journey will be a simple normal link to the selected external ticketing site, not an embedded checkout or one built by The FOA.

### Notice Board

- The MVP should be committee-managed and editorial, not an open user-generated feed.
- Public self-publishing is out of scope for the MVP.
- Notice submission, if introduced, must be moderated.
- Notices require publication and expiry dates so stale content is removed.
- Until approved real notices are supplied, the prototype should show an honest empty state rather than invented public notices.

### Technical direction

- The production frontend is Astro 7 with static output.
- Typed local Astro content collections are the interim content source until the CMS is selected.
- The Astro implementation must use separate generated HTML pages and normal path-based links. Do not carry the prototype's hash routing into production.
- GitHub Pages remains the preferred hosting target.
- Sanity remains a candidate CMS but has not been finally selected or integrated.
- Production CSS should be built locally; do not use the Tailwind CDN.
- Prefer zero client-side JavaScript for static content and small isolated scripts only where interaction is required.
- Configure production for a custom-domain root rather than a repository subpath. The final hostname is still pending.

## 4. Next Steps

This is the ordered backlog to use when asking, "What are the next steps?"

### Step 1: Review the current prototype

**Status:** In progress; review has moved to the deployed generated Astro site  
**Owner:** Project owner and representative stakeholders from The FOA

Review the generated Astro routes on both phone and desktop at `https://nicholascaplan.github.io/foa-website/` or with `npm run dev`. The archived hash-routed prototype in `prototype/` is retained only as a design reference.

Specifically decide:

- Does the warm editorial direction feel like The FOA and Ashley?
- Is the homepage hierarchy correct?
- Is Fireworks too dominant or appropriately prominent?
- Does the serif/sans typography feel trustworthy and approachable?
- Is the amount of content right for a mobile homepage?
- Does the navigation terminology make sense to parents?
- Should the prototype become warmer, more playful or more formal?

### Review decisions: 27 September 2026

- The warm editorial direction, current serif/sans balance and Fireworks prominence are approved for this prototype phase.
- Keep the current level of playfulness for now.
- The homepage hierarchy works, but the homepage should not carry all content as a single long page. Move the supporting content to focused routes.
- Keep the prototype in one fast-loading HTML file while using hash routes to provide focused, non-scrolling page views during review.
- The phone preview must be instant and must not load a duplicate iframe.
- Increase the header logo display size.
- Order primary navigation as Home, What's On, Get Involved and Uniform.
- The approved logo for The FOA has been supplied and replaces the prototype leaf mark.
- Ashley School branding must not be used at this stage.
- Committee names, roles and portraits may be published subject to the existing final pre-publication check. Replace the current low-resolution portraits before production launch.
- Concise committee biographies are likely wanted. Confirm their wording and presentation in a later content-review step; do not use desktop-only tooltips for core biographical content.
- If the Community Notice Board returns, the Committee will own its review, expiry and takedowns.
- Meeting locations and schedules may be public.
- The Contact Us route now offers the shared email address for The FOA and the approved Google contact form.
- The draft Privacy route and footer link were removed; no privacy notice is currently published, and the final privacy wording and publication timing remain open.
- About The FOA now links to Meet the Committee directly below its introductory copy.
- Reps Hub copy uses ordinal date style, and successful copy-to-clipboard feedback clears after three seconds.
- Fireworks facts are approved for this prototype. The supplied calendar provides provisional 2026 Uniform sale dates and operating details; these require a final pre-launch confirmation.
- The supplied calendar confirms the 2026 Preloved Uniform sales: Friday 2 October, Friday 6 November and Friday 4 December, all at 15:25 in the playground and subject to weather. It also confirms Reception Welcome Tea on Saturday 3 October and Fireworks on Thursday 5 November.
- The project owner confirms Christmas Fayre is Saturday 5 December. The supplied calendar states Saturday 28 November, so treat the calendar entry as superseded and verify the final public date before launch.
- Ticketing selection and policy decisions remain pending.

### Mobile design review: 28 September 2026

- Remove the persistent prototype-status banner so reviewers can assess the public-facing experience without implementation caveats occupying the first viewport.
- Mobile pages must show useful task or event information earlier and use a substantially smaller heading scale.
- On the mobile homepage, place the current featured event before the mission statement for The FOA. Desktop may retain the editorial mission-and-event composition.
- Remove the "What do you need today?" heading; the task options should be self-explanatory.
- Event and sale dates that match the visitor's local date should be labelled **Today** or **Tomorrow** automatically. Do not apply these labels to newsletter publication dates or document metadata.
- The desktop phone-preview mode must use explicit mobile typography because CSS viewport units still refer to the desktop browser viewport when the page body is visually constrained.
- Desktop breakpoint layouts must also be explicitly neutralised in phone-preview mode. Constraining the body width does not stop desktop media queries from applying to grids and cards.
- Past-event cards should use a compact image crop with the event summary below it on mobile, rather than a desktop side-by-side layout or a page-dominating poster.
- Mobile event rows should reserve width for the date and allow titles, details and status labels to wrap naturally without creating narrow text columns.
- On the mobile homepage, keep the mission paragraph, action buttons and featured event as one compact sequence. Avoid inherited desktop gaps between those elements.
- The Newsletter view should present one clearly identified Latest Newsletter followed by a Previous Newsletters section, with readable issue formatting rather than a duplicated archive/date column on mobile.
- The 28th September 2026 Autumn Term News & Fireworks Tickets newsletter is the latest published issue. The supplied Welcome Back from The FOA newsletter is the previous issue, dated 16th September 2026, and its concise summary is shown in the archive.
- Review responsive behavior down to approximately 320px; at the narrowest supported widths, secondary brand text and multi-column committee layouts may simplify to protect readability.

### Navigation simplification decision: 28 September 2026

- Keep the header and mobile menu focused on four parent-task routes: Home, What's On, Get Involved and Uniform.
- Remove Newsletter, Committee, Reps Hub and About The FOA from the primary/mobile menu rather than presenting nine equal-priority destinations.
- Keep Committee, Reps Hub and About The FOA discoverable through Get Involved; keep Newsletter, About The FOA, Contact and policy pages available through the footer and relevant page content.

### Content and route refinement: 28 September 2026

- Use ordinal day formatting in public date copy, including `5th November`, `6th November` and `4th December`.
- Remove the unpublished Privacy route rather than presenting draft wording as a public page.
- Keep the final privacy notice as a pre-publication requirement once ownership, processors, retention and contact handling are approved.
- Provide a prominent About The FOA link to the Committee page near the top of the route.
- Clear the Reps Hub's successful "Copied to clipboard." status after three seconds.

### Mobile interaction refinement: 28 September 2026

- The homepage quick-action rows no longer animate horizontal padding on hover. The previous padding change could alter text wrapping and shift following rows on touch devices; the interaction now keeps layout dimensions fixed and moves only the arrow with a composited transform.
- Reduced the mobile homepage gap between the hero action buttons and the quick-action list by removing the stacked hero-bottom and quick-action-top spacing. Desktop spacing is unchanged.
- The Newsletter archive opens the 16th September issue in a native dialog with its full approved letter content. The reader uses one dynamic-viewport-height scroll region, contains over-scroll and locks page scrolling while open so mobile readers can reliably reach both ends of the issue.

### Session closure decisions: 28 September 2026

- Keep the current static prototype as a temporary single-file, hash-routed review tool.
- Do not carry hash routing into production. The approved Astro implementation will generate separate pages with normal path-based links.
- Use `assets/fireworks.jpg` as the current Fireworks image asset.
- The persistent prototype disclaimer was removed from the review UI.
- The mobile homepage prioritises the current featured event and no longer uses the “What do you need today?” heading.
- The Newsletter page now presents the latest issue first and previous newsletters below it. The Back to School issue is shown without an invented publication date.
- The Newsletter recipient-metadata note was removed from the review UI.

### Astro implementation session closure: 28 September 2026

- All approved views are implemented as separate static Astro 7 routes with normal path-based links.
- Typed local content collections are the interim source until a CMS is selected.
- The original review prototype is archived under `prototype/`.
- Local development is documented in `README.md`: run `npm install` once, then `npm run dev` and open the URL printed by Astro.
- At that point, automation covered Astro/TypeScript diagnostics, content schema validation, production static generation and dependency auditing.
- Generated-site smoke and internal-link tests were added in the later GitHub Pages deployment session recorded below.
- Browser end-to-end, automated accessibility and visual regression tests have not yet been added.

### Local mobile-preview session closure: 28 September 2026

- `src/components/DevMobilePreview.astro` adds a development-only Mobile preview control to the shared layout.
- The control opens the current route in a real 390px-wide browser window, so the site's normal responsive media queries apply.
- The control is omitted from production builds and is documented in the README local-development instructions.
- If the browser blocks the preview window, local pop-ups must be allowed for the Astro development address.

### GitHub Pages review deployment: 28 September 2026

- The repository is `nicholascaplan/foa-website`.
- Pushes to `main` run the verification gate before GitHub Pages deployment.
- The initial test suite verifies key homepage content and crawls generated internal links and assets.
- The review URL is `https://nicholascaplan.github.io/foa-website/`; the final custom domain and DNS remain pending.
- Astro navigation, metadata and public assets support both the repository review base path and a future root deployment.
- GitHub Pages is enabled for Actions deployment, and the first gated build and deployment completed successfully.
- The local `main` branch tracks `origin/main` after fetching the newly created remote branch.
- The first recommended next action is a real-device phone and desktop review, followed by automated accessibility coverage.

### Deployed asset-path fix: 28 September 2026

- The deployed Committee portraits were not loading because `src/pages/committee.astro` emitted root-relative image URLs such as `/helen.jpeg`, which bypassed the temporary GitHub Pages `/foa-website/` base path.
- The archived or past-event poster in `src/pages/whats-on.astro` had the same root-relative asset-path issue.
- Both references now use the shared `withBase()` helper, preserving compatibility with the repository deployment path and the future custom-domain root.
- The source audit found no other equivalent root-relative asset or internal-route issues.
- Verification passed with `SITE_URL=https://nicholascaplan.github.io BASE_PATH=/foa-website npm run verify`, including Astro diagnostics, static generation and generated-link/asset checks; `git diff --check` also passed.
- The next action remains real-device phone and desktop review, followed by automated accessibility coverage.

### UX refinement pass: 28 September 2026

- Event status pills were removed from event lists and past-event cards; the event date, title and practical details carry the hierarchy without extra status badges.
- Uniform sale rows now link directly to the Uniform page, and uniform prices use small amber price tags for clearer scanning.
- The Uniform page now uses the supplied donation instruction: "If you have any uniform which you would like to donate, please drop it in the green bins by the School Office - no torn items please!"
- The Co-Secretary email actions now open a pre-addressed email with a subject and a short editable message body.
- The decorative circle was removed from the Co-Secretary vacancy card after mobile review feedback.
- Committee names use a stable single-line mobile treatment so names such as Cristy Amponsah do not wrap inconsistently between cards.
- Unconfirmed Fireworks operational caveats were removed from the public event page. Only confirmed event facts remain visible in this review pass.
- The supplied Fireworks image is currently reused as a CSS background on the homepage and event page and can take approximately one second to appear on slower connections. Image loading/performance improvement is recorded as a follow-up before launch; optimise/compress or preload the asset after the visual direction is settled.

### Route and sharing refinement pass: 28 September 2026

- Public-facing copy uses "The Friends of Ashley" on first mention and "The FOA" thereafter, including in titles and labels. Bare "FOA" is not used as the organisation name in copy. Technical identifiers such as the shared email address remain unchanged; this convention is recorded in `docs/STYLE-GUIDE.md`.
- Contact Us is available in the mobile menu and footer, with the shared email address for The FOA and the approved Google Form link.
- The supplied Google Form is available as an unlinked, no-indexed experiment at `/playground.html`; the public Contact Us route continues to offer the shared email address for The FOA and an external Google Form link. Confirm form ownership, access, retention and privacy handling before production launch.
- The public Accessibility page was removed; a public accessibility statement and formal accessibility testing are recorded as lower-priority future work.
- The Community page was removed from the current Astro implementation, including navigation, footer, homepage actions and expected routes. The notice board remains a possible future feature rather than an active MVP route.
- Reps Hub messages now include copy-to-clipboard actions with visible success/failure feedback. The cards use date circles but no longer show draft labels, expiry labels, workflow warnings or secondary fact pills.
- Reps Hub source links are labelled "Learn more" and the page uses class-representative wording rather than prototype/workflow wording.
- The Fireworks quiet display is scheduled for 17:00 across the current production pages, Reps Hub copy and project record.
- Homepage quick-action numbers were removed, and the "See what's coming up" CTA uses a right arrow because it navigates to What's On rather than scrolling.
- The About page's Contribution, Collaboration and Community pillars use compact inline numbers beside their headings, avoiding unnecessary vertical whitespace on mobile while retaining the three-column desktop layout.

### Test strategy: 28 September 2026

- The risk-based automated test strategy is documented in [`TEST-STRATEGY.md`](TEST-STRATEGY.md).
- Existing Astro/TypeScript, build and generated-site link checks remain the fast foundation.
- The first implementation milestone is Playwright coverage for shared mobile navigation plus representative `axe-core` accessibility scans.
- Newsletter-dialog, Reps Hub clipboard, metadata, structured-data, content-ordering and fixed-clock date-label coverage follow in that order.
- Broad screenshot regression is deferred until the generated-site visual design is approved; CMS, ticket-provider, analytics and locale tests remain conditional on those features being introduced.

### JustGiving donations: 28 September 2026

- The confirmed JustGiving charity page is `https://www.justgiving.com/charity/Friends-of-Ashley`.
- A persistent "Donate via JustGiving" external link is available in the site footer.
- The About The FOA page repeats the donation action alongside the fundraising-impact content, where visitors have context for how support is used.
- The task-focused primary navigation and homepage remain unchanged so the donation action does not compete with current events and practical parent tasks.

### Step 2: Confirm brand inputs

**Status:** Partially confirmed

- The approved logo for The FOA is available in `assets/FOA Logo.jpg`.
- Do not use Ashley School branding at this stage.
- `assets/logo-big.png` is better treated as a brand-purpose/three-pillars graphic than as the primary logo. Its strongest potential placement is beside the About The FOA or homepage purpose section.
- Do not add `logo-big.png` to the public prototype until use of its embedded Ashley School mark is approved or a school-mark-free version is supplied.
- If approved, keep its contribution, collaboration and community messages as accessible HTML text rather than relying on small text embedded in the image.
- Obtain any official colour values and brand-use restrictions.
- The prototype leaf mark is replaced by the approved logo for The FOA.
- System fonts remain the default. Future self-hosted typography directions can be reviewed when a final brand refinement is needed.

### Content confirmations: 28 September 2026

- The Christmas Fayre is confirmed for Saturday 5 December 2026; the earlier 28 November calendar entry is superseded.
- Rachel and Sophie are leading the 2026 Christmas Fayre.
- The existing charity wording and registered charity number are confirmed as correct.
- The Fireworks facts in the 28 September newsletter are confirmed: Thursday 5 November, 16:30-18:30, quiet display at 17:00, main display at 18:00, tickets £8.50 per person, under-2s free, and Helen Platt as event lead.
- Confirmed Fireworks attractions are a Ferris wheel, fairground games, food stalls and mulled wine.
- The newsletter confirms Pre-loved Uniform prices as £3 for coats and new-logo items, £1 for all other items, with card-only payment.
- The Welcome Tea is intentionally shown as completed in the review prototype, despite its 3 October 2026 source date, because the chosen review state represents a post-event view.
- Sold-out and cancelled event treatments are private prototype patterns only and must not be presented as real event statuses from The FOA.
- Reps Hub messages are available as shareable copy with copy-to-clipboard actions, subject to final content approval from The FOA.

### Step 3: Confirm content and public-data policy

**Status:** Substantially confirmed; final portrait replacement and biography decisions remain required before launch

- Committee names and roles are confirmed and may be published.
- Confirm final publication consent for the supplied portraits before production launch.
- Concise committee biographies are likely wanted; copy and presentation remain to be confirmed.
- Confirm that child year groups will not be published, or document a different consented decision.
- Define notice-board attribution rules.
- The Committee owns notice review, expiry and takedowns.
- Meeting locations and schedules may be public.
- Confirm the wording of the inclusive membership statement for The FOA against the constitution of The FOA.

### Step 4: Verify remaining operational content

**Status:** Pending and required before launch

- Charity number and current organisation wording are confirmed.
- Core Fireworks date, time, price, under-two policy, attractions and event lead are confirmed; verify remaining capacity, refund, weather and accessibility details.
- Verify Uniform sale dates, prices and the review-provided donation instruction against the latest operational guidance from The FOA before launch.
- Committee membership and roles for 2026/27 are confirmed.
- The supplied Co-Secretary role description confirms a manageable, termly role that can be done solo or shared: agree agendas with the Co-Chairs, send reminders and agendas, take and share meeting minutes roughly once a term, maintain licences and compliance documents, and help organise the shared Google Drive. The shared email for The FOA remains the public contact route; the outgoing secretaries can provide an informal chat before commitment.
- Confirm who is authorised to approve website content.

### Step 5: Select ticketing approach

**Status:** Pending and required before event implementation

- Select the external ticketing provider.
- Confirm provider fees and ownership by The FOA.
- Confirm capacity and whether the confirmed £8.50 standard ticket and free under-two entry require advance reservation by ticket type.
- Confirm refunds, cancellations and bad-weather handling.
- Confirm checkout accessibility and data-processing responsibilities.
- Add the provider's real URL as a normal external link.

### Step 6: Extend the design prototype

**Status:** In progress; first extended content and mobile refinement passes completed

Design and implement higher-fidelity versions of:

Implemented in the current hash-routed review prototype:

1. What's On index with separated upcoming and past events
2. Uniform hub using the latest confirmed newsletter details
3. Get Involved landing page
4. Committee page with all seven confirmed members
5. Reps Hub with shareable class-representative messages and copy-to-clipboard actions
6. Community Notice Board deferred from the current public implementation
7. About The FOA and funding-impact view
8. Contact view
9. Newsletter page with latest and previous newsletter sections
10. Welcome Tea completed-event example
11. Private prototype sold-out, cancelled and completed state patterns

Still to refine after stakeholder review:

- Final Reps Hub copy approval and native-share feedback
- Decide whether to restore a public Community Notice Board route and define approved content and stale-content behavior
- Decide when and how to publish the final privacy notice
- Final biographies and replacement committee portraits
- Final external ticket link and remaining event policies

### Step 7: Test the information architecture

**Status:** Pending extended prototype

Run lightweight user testing of the information architecture with approximately 5–7 parents or carers, including at least one person who uses English as an additional language. This is short task-based usability testing, not a formal research programme: ask participants to find specific information without coaching and record where they hesitate, misinterpret labels or miss content.

Suggested tasks:

1. Find the Fireworks start time and whether tickets are available.
2. Find where to donate uniform.
3. Find the next uniform sale.
4. Copy the Fireworks information for a class WhatsApp group.
5. Understand what the Co-Secretary role involves.
6. Review whether a future Community Notice Board should return.

Record where people hesitate, misinterpret labels or miss information.

### Step 8: Approve production architecture

**Status:** Partially complete; frontend and hosting shape confirmed, CMS and operations pending

- Astro 7 static output is confirmed and implemented.
- GitHub Pages repository ownership is confirmed under `nicholascaplan/foa-website`; the review deployment uses the repository path while the final hostname and DNS remain pending.
- Typed local content collections are confirmed as the interim source.
- Confirm Sanity or select another content-management approach.
- Confirm CMS ownership, editor list and annual handover process.
- Confirm preview and publishing workflow.
- Confirm secure CMS-to-GitHub build triggering.
- Confirm urgent-update and failed-build procedures.
- Confirm the Google Analytics property, measurement ID and reporting requirements.

### Step 9: Build the production site

**Status:** In progress; first full-route static implementation complete

- Astro 7 is initialised.
- Approved prototype components and tokens are migrated.
- All expected routes and initial typed content collections are implemented.
- Integrate the selected CMS.
- Optimise production images and provide final image dimensions once replacement portraits are supplied.
- Canonical and social metadata, Event structured data, sitemap and robots rules are implemented.
- Add privacy and safeguarding content.
- No Privacy route is currently published; approved final wording and publication timing remain pending. A public Accessibility page is deferred.
- Type/build checks, generated-site link validation, a homepage smoke test and a gated GitHub Pages deployment workflow are implemented; automated accessibility checks remain pending.

### Step 10: Verify and launch

**Status:** Future

- Content review by The FOA.
- School/brand approval where required.
- Low-priority accessibility statement and formal accessibility testing.
- Mobile performance testing on a constrained connection.
- RTL testing if a translated locale is included at launch.
- Link and metadata validation.
- Ticket-provider end-to-end testing.
- CMS editor training and handover documentation.
- DNS and GitHub Pages launch.

## 5. Further Clarifications and Design Decisions Needed

### Brand and tone

- Is there an approved logo for The FOA?
- Can the Ashley School logo, name or visual identity be used, and under what restrictions?
- Can the embedded Ashley School mark in `assets/logo-big.png` be published, or can The FOA provide a version without it?
- Should the final tone lean slightly more playful, more formal or remain as currently prototyped?
- Is a serif display typeface acceptable for The FOA?
- Is occasional illustration desired, or should typography and simple graphics remain the main visual language?

### Homepage and navigation

- Should Fireworks remain the dominant homepage event while tickets are on sale?
- What replaces it when the event is completed?
- Is "What's On" preferred to "Events"?
- Is "Get Involved" understood to include Committee and Reps, or should Committee be directly visible?
- Does Uniform deserve a permanent top-level navigation item year-round?
- Should the language control appear in the main header at launch?

### Committee and privacy

- Which names may be published?
- Has each committee member completed the final pre-publication check for their name, role and portrait?
- Are individual biographies useful, and who approves them?
- Should the committee page show elected dates or terms?
- Is the shared Gmail address the permanent public contact route?
- Confirm ownership, retention and access handling for the Google contact form.

### Events and ticketing

- Which ticketing provider will be used?
- Is Fireworks recurring content with a stable URL or a year-specific event URL?
- Are attractions included in the entry price?
- What exactly makes the quiet display quieter?
- Is there a quieter viewing area?
- What step-free, toilet, first-aid and parking information is confirmed?
- What are the event cancellation and refund policies?
- Who is the event-day contact?

### Uniform

- Confirmed prices are £3 for coats and new-logo items and £1 for all other items.
- What items are accepted or rejected as donations?
- Must donations be washed, labelled or bagged?
- How often is the donation bin emptied?
- Are sale dates regular or ad hoc?
- The newsletter confirms card-only payment.
- Can families request particular sizes between sales?

### Reps Hub

- Is the page public or intentionally unlisted?
- Who writes and approves messages?
- Should messages support both clipboard copy and native device sharing?
- Should messages be available in translated versions?
- How should expired messages disappear?
- What canonical production domain will messages use?

### Community Notice Board

- Can parents submit notices, or only contact The FOA by email?
- Which notice categories are permitted?
- Are commercial services allowed?
- Who moderates and approves notices?
- What is the standard expiry period?
- Will author names ever be displayed?
- What is the safeguarding and takedown procedure?

### Languages

- Which languages are genuinely needed at launch?
- Who will translate and review them?
- Which pages require full translation?
- Is English plus browser translation acceptable for MVP?
- Should locale-specific URLs be public and indexed?
- Who owns updates when English source content changes?

### Content management and operations

- The current repository owner is `nicholascaplan`; confirm whether production ownership should later move to an account or organisation managed by The FOA.
- Who owns the Sanity project if selected?
- Which committee members need editing access?
- How are editors added and removed each school year?
- Who responds when a build fails?
- What is the acceptable delay between publishing and the public site updating?
- How are urgent cancellations published if automation fails?

### Analytics and measurement

- Is analytics needed at all for MVP?
- What decisions would analytics support?
- Is counting ticket clicks and popular utility pages sufficient?
- Is a privacy-preserving analytics provider acceptable if it creates a cost?

## 6. Scope

### MVP scope

The MVP is a static, committee-managed public website containing:

- Responsive homepage
- What's On list
- Clearly separated earlier-this-year/past-events section within What's On
- Reusable event detail pages
- Fireworks on the Field 2026 page
- External ticket-provider links
- Pre-loved uniform hub
- Get Involved page
- Committee page
- Co-Secretary vacancy
- Reps Hub with approved share templates
- About The FOA and three pillars
- Shared contact information
- Privacy notice
- Safeguarding/contact guidance where appropriate
- SEO metadata, sitemap and canonical URLs
- GitHub Pages deployment
- CMS-managed time-sensitive content, if Sanity is approved

### Potential later scope

- Accessibility statement and formal accessibility testing
- Additional fully translated locales
- Native device sharing improvements
- Add-to-calendar downloads
- Form-based notice submissions with moderation
- Funding-impact stories
- Meeting minutes or governance document archive
- Additional event types and recurring events
- Privacy-preserving analytics
- Newsletter signup if an approved platform and consent process exist
- FAQs page (low priority)

### Explicitly out of scope for MVP

- Auctions or bidding
- Processing payments directly on the site for The FOA
- Issuing tickets directly from the site for The FOA
- User accounts for parents
- An open, unmoderated community feed
- Public self-service notice publishing
- Internal committee task management
- Storing child information
- Publishing child year groups alongside named adults by default
- Custom authentication on GitHub Pages
- A guarantee of six complete languages at launch
- Real-time dynamic content without a static rebuild
- Dependence on a large professional photography library

## 7. Requirements

### 7.1 Functional requirements

#### Global navigation

- Users must be able to reach Home, What's On, Uniform and Get Involved from every public page.
- Mobile navigation must be an actual menu, not a page-cycling control.
- Browser back, forward, refresh, bookmarks and shared links must work through real URLs.
- The current page must be identifiable in navigation.

#### Homepage

- Show the most important current event or announcement prominently.
- Show direct routes to current events, uniform and Reps Hub.
- Show an upcoming-event preview.
- Show current volunteer needs.
- Explain The FOA's purpose and three pillars without displacing practical information.
- Show public contact and charity information in the footer.

#### What's On

- Show upcoming events in chronological order.
- Each item must include date, name, time, location and status where available.
- Past events must not remain mixed into the upcoming list.
- Show a clearly labelled **Earlier this year** section below upcoming events for selected completed events from the current year.
- Use completed-event styling and wording so past events are clearly distinguished from current opportunities or ticket calls to action.
- Include Welcome Tea in the first past-events content pass, using `assets/welcome tea.png` to verify the poster details.
- Events must support upcoming, on-sale, sold-out, cancelled and completed states.

#### Event pages

- Show event title, date, time, location, schedule and concise summary.
- Show ticket price and external ticket link where relevant.
- Clearly identify external checkout behavior.
- Show accessibility and practical-attendance information.
- Show cancellation/refund information or a link to it.
- Support attractions and FAQs where relevant.
- Display a last-reviewed or last-updated date for operational information.
- Avoid publishing unverified provider or accessibility claims.

#### Uniform

- Explain how and where to donate.
- Show the next confirmed sale date, time and location.
- Show the current price list.
- Explain accepted and rejected items.
- Explain available payment methods.
- Include a contact route for questions or size requests if The FOA supports them.

#### Get Involved and Committee

- Explain that meetings are informal and open to all.
- Show current approved committee names and roles.
- Show active volunteer vacancies.
- Explain expected time commitment and available support.
- Provide a shared contact action for The FOA.
- Do not expose unnecessary information about children.

#### Reps Hub

- Show approved, current share messages.
- Each message must link to the canonical source page.
- Copy actions must show visible success or failure feedback.
- Native sharing may be offered where supported.
- Messages must have review and expiry dates.
- Stale or superseded messages must not remain presented as current.

#### Community Notice Board

- Show only committee-approved notices.
- Each notice must have a category, publication state and expiry date.
- Expired notices must be automatically excluded from public pages.
- The public site must not allow direct unmoderated publishing.
- A takedown/contact route must be available.

#### Language support

- The document language must be set correctly.
- RTL locales must set direction at the document level.
- Locale routes must be shareable if multiple locales launch.
- Missing translations must fall back predictably and honestly.
- Safety-critical and transactional translations require human review.

#### Content management

- Non-technical editors must be able to update events and time-sensitive content without editing code.
- Editors must be able to preview content before public release.
- Content models must validate required fields and dates.
- Time-sensitive content must support publication and expiry.
- Publishing must trigger or schedule a static rebuild.
- Failed publishes/builds must be visible to an identified owner.

### 7.2 Non-functional requirements

#### Mobile and responsive behavior

- Design mobile-first for common phone widths from approximately 320px upward.
- Provide deliberate tablet and desktop layouts rather than stretching mobile cards.
- Essential touch targets should be at least approximately 44 by 44 CSS pixels.
- Important information must not depend on hover.

#### Accessibility

- Target WCAG 2.2 AA.
- Use semantic HTML landmarks, headings, lists, links, buttons and forms.
- Provide a skip link and visible keyboard focus.
- Do not rely on colour, icons or emoji alone to convey meaning.
- Announce asynchronous interaction feedback to assistive technology.
- Respect `prefers-reduced-motion`.
- Support 200% browser zoom and mobile text enlargement.
- Test keyboard navigation and representative screen readers before launch.

#### Performance

- Use static rendering for public content.
- Avoid client-side JavaScript for content that does not require interaction.
- Build CSS locally.
- Do not use runtime Tailwind CDN compilation.
- Prefer system fonts or self-host a minimal font set.
- Optimise any images and declare their dimensions.
- Test the deployed site under representative mobile network conditions.

#### Privacy and safeguarding

- Collect no personal information unless necessary for an approved feature.
- Do not expose CMS write credentials or private data in client-side code.
- Complete the final publication-consent check for portraits and any future personal biographies.
- Avoid publishing child associations or identifying details without a documented requirement and consent.
- Publish a privacy notice describing processors and retention.
- Define moderation, expiry and takedown processes for notices.

#### Security

- Use HTTPS through GitHub Pages/custom-domain configuration.
- Keep secrets only in approved deployment secret stores.
- Do not expose GitHub tokens in Sanity webhook URLs or client code.
- Apply least-privilege CMS roles.
- Add a practical Content Security Policy compatible with required providers.
- Treat external CMS content as untrusted and render it safely.

#### SEO and sharing

- Provide unique page titles and descriptions.
- Define canonical URLs.
- Generate a sitemap and robots rules.
- Add Open Graph metadata.
- Add accurate Organisation and Event structured data where applicable.
- Add `hreflang` only for complete, shareable locale routes.
- Provide a useful 404 page.

#### Maintainability

- Use reusable page layouts and components.
- Keep design values in central tokens.
- Keep event facts in one structured source rather than duplicating strings.
- Document content ownership and annual committee handover.
- Keep build and deployment instructions in the repository.

## 8. Technical Specification

### 8.1 Proposed production architecture

```text
Sanity Studio or approved CMS
        |
        | publish event / notice / committee content
        v
Authenticated build trigger
        |
        v
GitHub Actions
        |
        | Astro static build
        v
GitHub Pages + custom domain
        |
        +--> External ticket provider for payment and ticket issuance
```

### 8.2 Frontend

- Framework: Astro, static output mode.
- Language: TypeScript where JavaScript is required.
- Styling: project CSS tokens and component styles; Tailwind may be considered only if it improves maintainability and is built locally.
- Client JavaScript:
  - Mobile menu
  - Clipboard and native sharing
  - Small accessible disclosures/dialogs
  - Optional consent controls if analytics or embeds require them
- Avoid a client-side single-page application router.
- Produce real static routes for every public page.
- Navigation must use normal links between those routes, not fragment identifiers that swap views within one document.

### 8.3 Expected routes

```text
/
/whats-on/
/events/fireworks-2026/
/uniform/
/get-involved/
/committee/
/reps/
/about/
/contact/
/newsletter/
/404.html
```

Final event URL conventions remain an open decision. Stable recurring URLs can be supported with redirects if year-specific event records are used.

### 8.4 Hosting and deployment

- Host generated static assets on GitHub Pages.
- Configure Astro `site` and `base` for the final custom domain/repository arrangement.
- Deploy using GitHub Actions.
- Use deployment concurrency to prevent older builds overwriting newer ones.
- Configure a custom domain and HTTPS.
- Add build validation before deployment.
- Define a notification route for failed production builds.
- Provide preview builds or a separate preview environment before CMS publication.

### 8.5 CMS

Sanity is the current candidate, not a final dependency.

Required CMS capabilities:

- Friendly editor authentication for non-technical volunteers
- Structured schemas
- Draft preview
- Role-based access
- Validation
- Publication and expiry dates
- Image handling
- API access during static builds
- Secure build-trigger integration
- Clear ownership and yearly access handover

Sanity pricing, editor limits, authentication behavior and webhook/build integration must be revalidated against the current product before adoption.

### 8.6 Minimum content models

#### Site settings

- Site name
- School relationship wording
- Charity number
- Shared contact address
- Social links
- Default locale
- Footer and legal links

#### Event

- Title
- Slug
- Summary
- Start and end date/time
- Timezone
- Location
- Event status
- Schedule items
- Ticket products and prices
- External ticket URL
- Ticket availability
- Past-event display state and whether the event is included in the current-year archive
- Attraction list
- Accessibility information
- Weather/cancellation information
- Refund information
- FAQs
- Publish and expiry dates
- Last reviewed date
- SEO metadata
- Locale and translation review state

#### Committee member

- Public display name
- Role
- Optional approved biography
- Optional consented portrait
- Display order
- Start/end dates
- Visibility status
- Consent/review date

Do not include child information by default.

#### Role vacancy

- Role title
- Summary
- Responsibilities
- Estimated time commitment
- Support/handover details
- Contact action
- Status
- Opening/closing dates

#### Uniform information

- Donation location and instructions
- Accepted/rejected items
- Sale dates
- Price rows
- Payment methods
- Contact/help text
- Last reviewed date

#### Rep message

- Title
- Body
- Related canonical page
- Locale
- Approval status
- Publish and expiry dates
- Last reviewed date

#### Notice

- Title
- Summary/body
- Category
- Activity date/time
- Location
- Approved attribution, if any
- Moderation status
- Publish date
- Expiry date
- Takedown state
- Internal moderation notes

### 8.7 Internationalisation

- Use locale-prefixed routes if multiple languages launch, for example `/ar/` and `/pl/`.
- Set `<html lang>` and `<html dir>` correctly per route.
- Use locale-aware date, time, number and currency formatting.
- Store translation status and source revision.
- Do not silently mix incomplete English and translated content.
- Define fallback behavior for untranslated pages.
- Use `hreflang` for complete equivalents.
- Test layouts with genuine Arabic and Urdu content.

### 8.8 Ticket integration

- Payments and ticket issuance remain with the external provider.
- Prefer a normal external link for MVP.
- Use an embed only if the selected provider officially supports it and it passes accessibility, privacy, cookie and CSP review.
- The FOA site may display ticket availability only if the data source is reliable.
- Never expose ticket-provider secret keys in browser code.

### 8.9 Analytics

- Google Analytics is a confirmed implementation requirement and must remain on the production-site backlog.
- Add Google Analytics only after defining the concrete questions it must answer and confirming the correct property and measurement ID.
- Prefer privacy-preserving aggregate measurement.
- Do not send names, email addresses, ticket identifiers or notice content.
- Implement consent before non-essential cookies or tracking where legally required.
- Document the final consent, retention and event-measurement approach before launch.

### 8.10 Quality gates

Before launch, the implementation should pass:

- Formatting and linting
- Type checking
- Production build
- Broken-link checking (implemented for generated internal links and assets)
- Automated accessibility checks
- Keyboard testing
- Representative screen-reader testing
- Responsive visual checks
- Mobile performance checks
- Metadata and structured-data validation
- CMS draft/publish/expiry testing
- Ticket-provider end-to-end link testing
- GitHub Pages deployment verification (implemented for the review deployment)

The scope, layering, CI cadence and implementation order for these gates are defined in [`TEST-STRATEGY.md`](TEST-STRATEGY.md).

## 9. Known Provisional Content

The following content appears in the current prototype but is not yet considered complete production information:

- Fireworks capacity
- The meaning and accessibility characteristics of the quiet display
- Event access and facilities
- Fireworks refund, cancellation and bad-weather policy
- Final verification of the Uniform donation instruction and accepted/rejected items
- Final wording and publication review for the Co-Secretary recruitment copy
- Production domain
- Arabic translation quality
- Final ticket provider
- Final Privacy wording and Google Form data-handling details
- Reps Hub copy, which remains subject to final content approval from The FOA

These items must not lose their prototype/draft qualification until confirmed by an authorised owner from The FOA.

## 10. How to Resume This Project

When returning in a future session:

1. Read this document.
2. Check **Next Steps** for the first pending item.
3. Check **Further Clarifications and Design Decisions Needed** for blockers.
4. Review recent Git changes and prototype files.
5. Record new confirmed decisions in **Decisions Made**.
6. Update the status and next-step ordering before ending the session.

If asked, "What are the next steps?", answer from Section 4 and identify any decisions in Section 5 that block the next item.

When the user asks to close or end a session, follow the documentation and Git workflow in `AGENTS.md`: record all material session outcomes here before asking whether GitHub-connected changes should be committed.
