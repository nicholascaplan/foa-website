# Actions

The single backlog for the project: outstanding tasks, open questions and provisional content. When an item is resolved, move the outcome into [`PROJECT-BRIEF.md`](PROJECT-BRIEF.md) as a decision or specification and delete it here. See [`README.md`](README.md) for the documentation rules.

**Owners:** **FOA** = The FOA committee (decision or approval needed); **Owner** = project owner (Nick Caplan); **Dev** = implementation work.

## How to Use This File

- "What are the next steps?" Start with **Launch-blocking**, then **Soon**. Separate unblocked **Dev** work from items needing a decision from **FOA** or **Owner**.
- Before starting an item, check its **Blocked by** column and the *Open questions* section.

## Launch-Blocking

The site is live at `https://www.thefriendsofashley.org`. These items must be resolved before the site is treated as fully launched.

| Item | Owner | Blocked by |
|---|---|---|
| Confirm Fireworks capacity, refund/cancellation and bad-weather policy, accessibility details and provider data-processing responsibilities (provider is Buy Tickets). | FOA | FOA decision |
| Confirm access and retention arrangements for the shared FOA inbox and the Google contact form (ownership, who has access, retention). The Privacy Notice currently records these as pending. | FOA | FOA decision |
| Obtain higher-resolution committee portraits (Nick Caplan's replacement is already in use) and complete the final publication-consent check for all names, roles and portraits. | FOA / Owner | Supplied photos, consent |
| Run a constrained-connection mobile performance test, including the Fireworks image load. | Dev | None |
| Complete the final visual review of the homepage Fireworks card (now the parchment scroll with blackletter kicker) at narrow phone and mid desktop widths: timeline labels (about 9px, consider enlarging), and location line. Also check the compacted desktop card (cropped image, centred, single Event details button) at common laptop heights such as 720px, 768px and 900px, since it was only measured in a 700px-tall pane; the whole card above the fold is not yet confirmed. DOM checks passed with no overlap down to a 280px card, but 320px/200% zoom, forced-colours mode and a real-device look are still outstanding. Decide how the card (including the fixed 5 November kicker) changes after the event. | Owner | None |
| Complete the final mobile/desktop visual review of the Fireworks ticket CTAs: homepage hero (the card no longer has a ticket button) and the What's On row. The event-page summary, Tip, "Good to know", scroll edges and mobile sponsor placement were DOM-checked, including enlarged text; real-device review is still needed. | Owner | None |
| Check the Fireworks volunteering page (`/fireworks-volunteering/`) against the Volunteer Sign Up sheets: shift times, helper counts and the presales dates (the screenshot ended at Thursday 5th drop-off, so confirm whether a Thursday pick-up slot exists). Do a real-device visual check of the Fireworks-themed page (parchment cards, date chips and card headers at 320px and 390px, torches hidden on mobile), and of the new Volunteer buttons on the homepage hero and the Fireworks summary box. | Owner | None |
| Christmas Fayre page (`/events/christmas-fayre-2026/`): confirm with Rachel and Sophie the end time, whether there will be a sign-up sheet or link (only the Fayre email is published), what each area involves, and that the email address (read from the poster image) is exactly right. Do a real-device review of the baubles, snowfall (straight fall, spinning flakes) and the page length at 320px and 390px, plus reduced-motion and enlarged text. Decide how the page changes after the event. | Owner / FOA | Organiser confirmation |
| Confirm the browser suite passes in CI after the latest changes: the new `tests/e2e/christmas-fayre.spec.ts` (including its two-button "Email the Fayre team" assertions, fixed after a strict-mode failure; not re-run locally because Chrome launch is blocked by the sandbox), the About pillar-number and Christmas cookie-banner contrast fixes, and the accessibility spec now discovering routes from `dist/`. Delete this item once CI is green. | Dev | CI run |
| Review the Christmas logo (wreath and bow, header at 68px and on mobile; it is now scaled to match the standard logo's circle, so confirm there is no size jump between pages and the wreath is not clipped) and the yellow "Help at the Fayre" button on What's On at mobile width. After deploy, check the link preview for `/events/christmas-fayre-2026/` in a real share (for example WhatsApp), which may cache the old image. The SVG redraw of the logo (`assets/brand/foa-logo.svg`) is not used elsewhere yet; decide whether it should replace the JPG. | Dev / Owner | Deploy |
| Review the Fireworks logo (`assets/brand/foa-logo-fireworks.svg`, header on `/events/fireworks-2026/`) at 68px and on mobile: it is scaled so its circle matches the standard logo, so confirm there is no size jump between pages and the bursts are not clipped (not checked in a rendered browser; Chrome launch was blocked). Decide whether a logo link-preview image is wanted (the page still shares the fireworks photograph). | Dev / Owner | Deploy |
| Update the autumn newsletter line "Online ticket link will be shared shortly" now that tickets are on sale. | FOA | FOA decision |
| Confirm how school families buy tokens in advance (the guide says the week before, but gives no route). Reconcile the guide's fairground cash/card label with its token FAQ and the existing token-only ticket-page advice; confirm current token prices, bag sizes and non-refundable/reusable conditions before changing that copy. | FOA | FOA decision |
| Complete a focused mobile and desktop review of all routes: page order, spacing, heading scale, event/date labels, newsletter formatting and navigation terminology. The Get Involved vacancy-to-volunteering gap has been reduced and DOM-checked at 390px and 1440px with no horizontal overflow. | Owner | None |

## Soon

- **Owner:** Ask both iPhone reporters to repeat their Fireworks scrolling journey after the static-mobile fix is deployed; also review Android, portrait/landscape, Reduce Motion on/off, battery/performance and enlarged text. Confirm smooth scrolling, static flames and no fireworks covering the practical information. Use a real-device testing service if physical devices are unavailable; WebKit automation is compatibility coverage, not proof of iPhone performance. Do not restore mobile effects without real-device evidence and a separate decision. Local Playwright launches remain blocked by macOS sandbox permissions; CI runs the production browser suite.

- **Owner:** Complete a final visual/content review of the redesigned Get Involved and Reps Hub pages, including volunteer vacancy status and the charter-based role summary. Reps Hub messages come first, actions align across desktop cards, and mobile cards are compact. Responsive DOM checks passed; local automated browser tests remain blocked by Chrome-launch sandbox permissions (see the browser-suite task below).

| Item | Owner | Blocked by |
|---|---|---|
| Browser-check the Fundraising annual-support groups (icons, three-column layout from 64rem, single column below) and the ways-to-help cards with buttons at mobile and mid widths (only one desktop width was measured), then run the Fundraising Playwright spec outside the sandbox. Also confirm the `.info-card h2` weight change on Contact and Uniform. | Dev | Browser-capable environment |
| Review fundraising animation smoothness on real devices. Focused regression coverage is in `tests/e2e/fundraising.spec.ts` (one-time trigger, final amounts, visual fill, reduced motion, no JavaScript, responsive sizing and enlarged text); execution is covered by the browser-suite task below. Connected-browser sampling on Home and Fundraising at 390px showed stable figure/track widths through count-up to the correct final amount; desktop layouts have also been DOM-checked. | Owner | Real-device review |
| Review the redesigned 404 page (crying logo, tear/ripple timing, puddle growth stopping at 30s, ruled link rows) in a rendered browser at mobile and desktop widths, including spacing above and below the content and reduced-motion behaviour. | Dev | None |
| Committee page: decide whether the routes to Reps Hub and About The FOA are clear enough; if not, use more explicit task-focused labels. | Owner | None |
| Decide whether About The FOA should carry a concise committee summary. The Committee page remains the canonical source; avoid duplicating member details. | Owner | None |
| Decide whether to publish short committee biographies. If so, present them as visible readable content, not desktop-only tooltips. | FOA | FOA decision |
| Run the 5–7 parent/carer task-based information-architecture test (see *Suggested IA test tasks* below). | Owner | Participants |
| Set up uptime monitoring for the `www` domain with an agreed alert recipient and response owner. | Owner | Tool choice |
| Upload more past FOA newsletters to the site. Obtain the source newsletters, confirm they are approved for public release (check for personal details, child-related information and committee names before publishing), and add them to the newsletter content collection. | Owner | Supplied newsletters, FOA approval to publish |
| Once more newsletters are published, consider a year filter on the newsletters listing. It must work as a real, keyboard-accessible control and degrade gracefully without JavaScript (for example, year links or anchors). | Dev | More newsletters uploaded |
| Agree who updates the fundraising totals and content-update date and how often (`src/content/fundraising/current-appeal.json`), and what the homepage band and Fundraising page show once the 2026/27 goal is reached or the campaign ends. | FOA | FOA decisions |
| Confirm delivery of the KS1 playground equipment after October half term, then update the shared fundraising impact summary. Confirm final quotes and purchase/funding status before adding project-completion labels to spending priorities. | FOA / Dev | School / FOA confirmation |
| Add future open house meetings to the website. Confirm the dates, times, location and audience with The FOA, then add them as events in the content collection (single structured source; do not duplicate in page copy). | Dev | FOA confirming meeting details |
| Make the expected-routes list in `tests/metadata.test.mjs` automatic (discover routes from `dist/`, as the accessibility spec does) so new pages also get metadata, canonical and sitemap checks. | Dev | None |
| Remaining test gaps from the coverage review: base-path (`/foa-website/`) browser tests; 404 animation and reduced-motion tests; run `npm run test:dev` in CI; `EventDate`, `EventList` and `FundraisingSummary` client scripts; a primary-navigation order test; make `event-dates.spec.ts` independent of live content (see below). Decide whether a year-group scan is wanted (the site legitimately shows year groups on Fireworks volunteering, Fundraising and newsletters). | Dev | Decision on year-group rule |
| Pin Node to 22.18+ (or later) in CI: the unit tests import `src/lib/*.ts` directly and rely on default type stripping. | Dev | None |
| Make event-date e2e tests independent of live content: `event-dates.spec.ts` still hard-codes Welcome Tea and Fireworks dates for What's On. Decide how to retire past events first. | Dev | Decision on retiring past events |
| Without JavaScript the mobile menu button does nothing, so the footer is the only mobile navigation. Decide whether that fallback is acceptable or the nav should render by default and collapse once JS runs. | Owner | None |
| Check public Night Mode on real devices (iOS Safari and Android Chrome): zoom, keyboard focus, flash on load, and device-setting changes. The production Night Mode e2e suite passes locally. | Owner | None |
| Run `npm run test:dev` outside the sandbox or with an approved Chrome-launch override. Local Chrome launch remains blocked, so the development-only suite (phone preview and header layout with dev controls) is still unverified. Production browser tests, including Night Mode, run in the GitHub Actions deployment gate (`npm run verify`). | Dev | Browser-capable environment |

## Later

- Select and integrate a CMS, only after editor ownership, preview/publish workflow, annual access handover, urgent-update and failed-build procedures are confirmed (see *Open questions → Content management*).
- Formal manual accessibility testing (keyboard, zoom, screen reader), then publish a public accessibility statement.
- Moderated Community Notice Board (deferred; no public route). Needs the decisions listed under *Open questions → Notice Board*.
- Additional reviewed translations and RTL testing; FAQs page; native share; add-to-calendar downloads.
- Optional homepage fundraising enhancement: milestone ticks (25%, 50%, 75%, 100%) that light up amber as the bar passes them, with short labels such as "Halfway!". Needs FOA-approved wording. Other ideas considered: moving end-marker, progress-based message under the bar.
- Low-priority "Inspiration" archive of past event posters (standalone page or within What's On).
- Selective screenshot visual regression, after the visual design is approved.
- AI support bot for common parent/carer questions. Needs approved knowledge sources, committee ownership, privacy/safeguarding boundaries, human escalation, accessibility, cost and failure handling. Must not answer safety-critical, transactional or sensitive queries without reviewed safeguards.
- Confirm the wording of the inclusive membership statement against the FOA constitution.
- Confirm who is authorised to approve website content.

## Provisional Content

These facts appear on the site or in drafts but are not confirmed by an authorised FOA owner. Keep them labelled as provisional or absent from public pages until confirmed.

- Fireworks: capacity; what the quiet display involves and its accessibility characteristics; step-free access and toilets; refund, cancellation and bad-weather policy; event-day contact. Parking, first aid and lost-child help are now sourced from the supplied 2026 Event Guide.
- Uniform: accepted and rejected items; donation conditions (washed, labelled, bagged); bin-emptying frequency; whether sale dates are regular or ad hoc; size requests between sales.
- Privacy Notice details about shared-inbox and Google Form access/retention.
- Reps Hub copy (pending FOA approval).
- Confirm whether the November uniform sale's 15:45 finish also applies to December; December currently retains only its confirmed 15:25 start.
- Co-Secretary recruitment copy (final wording and publication review).
- AGM volunteer recruitment: reconfirm whether the Eco Stall lead and Summer Fete/Big Picnic organiser opportunities remain open, and confirm those events' plans and dates before listing them as confirmed events. Get Involved labels the event plans as unconfirmed and routes enquiries to the committee.
- Arabic translation quality (demonstration only; human review required).
- Santa's Grotto (16 December 2026): the start time, location wording and whether to list it publicly (it is usually a secret from the children) are unconfirmed. It is listed as an all-day event at Ashley School.

## Open Questions

Resolve these as part of the related items above, then record outcomes in the brief.

### Brand and tone

- Are there official colour values and brand-use restrictions?
- Is occasional illustration wanted, or should typography and simple graphics remain the visual language?
- Should the retained school logo (`assets/brand/school-logo-big.png`) be displayed anywhere? Retention is approved, but public use and placement need separate approval. Keep the purpose's three pillars as HTML text.

### Homepage and navigation

- Should Fireworks remain the dominant homepage event while tickets are on sale, and what replaces it afterwards?
- Does Uniform deserve a permanent top-level navigation item year-round?
- Is "Get Involved" understood to include Committee and Reps?
- Should a language control appear in the header at launch?

### Committee

- Should the Committee page show elected dates or terms?
- Is the shared Gmail address the permanent public contact route?
- Who approves any biographies?

### Events

- Is Fireworks recurring content with a stable URL, or year-specific?
- Are attractions included in the entry price?
- Does the £8.50 ticket and free under-2 entry need advance reservation by ticket type?

### Reps Hub

- Is the page intentionally unlisted or public?
- Who writes and approves messages? How do expired messages disappear?
- Should native device sharing and translated versions be offered? (Dev view: keep Copy as the primary action. If sharing is added, make it a feature-detected `navigator.share` enhancement alongside Copy, not a replacement.)
- Should copied messages include the absolute "Learn more" URL so recipients can follow it to the canonical page?

### Notice Board

- Can parents submit notices, or only email The FOA?
- Which categories are allowed; are commercial services allowed?
- Who moderates; what is the standard expiry; will author names ever be shown; what is the takedown procedure?
- (Already decided: if restored, the Committee owns review, expiry and takedowns.)

### Languages

- Which languages are genuinely needed at launch, who translates and reviews, and which pages need full translation?
- Is English plus browser translation acceptable for MVP?
- Should locale-specific URLs be public and indexed? Who updates translations when English changes?

### Content management and operations

- Should repository ownership move from `nicholascaplan` to an account or organisation managed by The FOA?
- If Sanity is selected, who owns the project? Which committee members need editing access; how are editors added and removed each year?
- Who responds when a build fails? What delay between publishing and the site updating is acceptable? How are urgent cancellations published if automation fails?

### Analytics

- Is current analytics coverage enough, or are further decisions it should support needed? Do not add other optional technologies without extending the Privacy Notice and consent control.

## Suggested IA Test Tasks

For the parent/carer testing session (include at least one participant who uses English as an additional language). Do not coach; record hesitation, misread labels and missed content.

1. Find the Fireworks start time and whether tickets are available.
2. Find where to donate uniform.
3. Find the next uniform sale.
4. Copy the Fireworks information for a class WhatsApp group.
5. Understand what the Co-Secretary role involves.
6. Say whether a Community Notice Board would be useful.
