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
| Browser-check the homepage Fireworks card at narrow phone and mid desktop widths: the container-query timeline scaling, one-word-per-line labels, stacked two-line Buy tickets button and location line. Restyled without a browser view. | Dev | None |
| Browser-check the Fireworks ticket CTAs and "Good to know" block at mobile and desktop widths: homepage hero and Fireworks card buttons, the What's On Fireworks row (Buy tickets beside View event details; the row is no longer fully clickable), the event-page summary panel and Tip note, and spacing between event-page sections. Added without a browser view; the Playwright suite could not run in the agent sandbox. | Dev | None |
| Update the autumn newsletter line "Online ticket link will be shared shortly" now that tickets are on sale. | FOA | FOA decision |
| Confirm how school families buy tokens in advance (the ticket page says "for school community" without a route), and whether the Ferris wheel and mulled wine in the event intro still match the ticket page ("fairground ride"). | FOA | FOA decision |
| Complete a focused mobile and desktop review of all routes: page order, spacing, heading scale, event/date labels, newsletter formatting and navigation terminology. | Owner | None |

## Soon

| Item | Owner | Blocked by |
|---|---|---|
| Get Involved page was restructured (compact Co-Secretary banner, event-lead section, three task tiles) without a browser view. Check it at 320px, 390px and 1440px for spacing and balance, and confirm the About tile's "where the money goes" matches the About page. | Dev | None |
| Committee page: decide whether the routes to Reps Hub and About The FOA are clear enough; if not, use more explicit task-focused labels. | Owner | None |
| Decide whether About The FOA should carry a concise committee summary. The Committee page remains the canonical source; avoid duplicating member details. | Owner | None |
| Decide whether to publish short committee biographies. If so, present them as visible readable content, not desktop-only tooltips. | FOA | FOA decision |
| Run the 5–7 parent/carer task-based information-architecture test (see *Suggested IA test tasks* below). | Owner | Participants |
| Set up uptime monitoring for the `www` domain with an agreed alert recipient and response owner. | Owner | Tool choice |
| Upload more past FOA newsletters to the site. Obtain the source newsletters, confirm they are approved for public release (check for personal details, child-related information and committee names before publishing), and add them to the newsletter content collection. | Owner | Supplied newsletters, FOA approval to publish |
| Once more newsletters are published, consider a year filter on the newsletters listing. It must work as a real, keyboard-accessible control and degrade gracefully without JavaScript (for example, year links or anchors). | Dev | More newsletters uploaded |
| Agree who updates the homepage fundraising totals and how often (`src/content/fundraising/current-appeal.json`), and what the band shows once the 2026/27 goal is reached or the campaign ends. Decide whether a fuller "where it has come from" breakdown belongs on About The FOA. | FOA | FOA decisions |
| Add future open house meetings to the website. Confirm the dates, times, location and audience with The FOA, then add them as events in the content collection (single structured source; do not duplicate in page copy). | Dev | FOA confirming meeting details |
| Pin Node to 22.18+ (or later) in CI: the unit tests import `src/lib/*.ts` directly and rely on default type stripping. | Dev | None |
| Make the homepage and event-date e2e tests independent of live content: the homepage throws if `welcome-tea-2026` is removed, and `event-dates.spec.ts` hard-codes Welcome Tea and Fireworks dates. Decide how to retire past events first. | Dev | Decision on retiring past events |
| Without JavaScript the mobile menu button does nothing, so the footer is the only mobile navigation. Decide whether that fallback is acceptable or the nav should render by default and collapse once JS runs. | Owner | None |
| Review the local Night Mode preview visually: forest-charcoal palette, muted light newsletter sheets, darker cork and desktop/mobile toggle placement. Check real-device zoom and keyboard focus before considering public rollout. | Owner | None |
| Run `npm run test:dev` and the browser stage of `npm run verify` outside the sandbox or with an approved Chrome-launch override. The sandbox blocks Chrome; the new dev suite and production Night Mode isolation browser test have not passed as Playwright suites. Connected desktop-browser checks cover all public routes at 320px, 390px and 1440px, non-overlapping header controls at 768px–1440px, and representative Night Mode axe scans. | Dev | Browser-capable environment |

## Later

- Select and integrate a CMS, only after editor ownership, preview/publish workflow, annual access handover, urgent-update and failed-build procedures are confirmed (see *Open questions → Content management*).
- Formal manual accessibility testing (keyboard, zoom, screen reader), then publish a public accessibility statement.
- Moderated Community Notice Board (deferred; no public route). Needs the decisions listed under *Open questions → Notice Board*.
- Additional reviewed translations and RTL testing; FAQs page; native share; add-to-calendar downloads.
- Low-priority "Inspiration" archive of past event posters (standalone page or within What's On).
- Selective screenshot visual regression, after the visual design is approved.
- Public Night Mode rollout (low priority; separate approval after the local preview is reviewed).
- AI support bot for common parent/carer questions. Needs approved knowledge sources, committee ownership, privacy/safeguarding boundaries, human escalation, accessibility, cost and failure handling. Must not answer safety-critical, transactional or sensitive queries without reviewed safeguards.
- Confirm the wording of the inclusive membership statement against the FOA constitution.
- Confirm who is authorised to approve website content.

## Provisional Content

These facts appear on the site or in drafts but are not confirmed by an authorised FOA owner. Keep them labelled as provisional or absent from public pages until confirmed.

- Fireworks: capacity; what the quiet display involves and its accessibility characteristics; access and facilities (step-free, toilets, first aid, parking); refund, cancellation and bad-weather policy; event-day contact.
- Uniform: accepted and rejected items; donation conditions (washed, labelled, bagged); bin-emptying frequency; whether sale dates are regular or ad hoc; size requests between sales.
- Privacy Notice details about shared-inbox and Google Form access/retention.
- Reps Hub copy (pending FOA approval).
- Co-Secretary recruitment copy (final wording and publication review).
- Arabic translation quality (demonstration only; human review required).
- Santa's Grotto (16 December 2026): the start time, location wording and whether to list it publicly (it is usually a secret from the children) are unconfirmed. It is listed as an all-day event at Ashley School.
- Christmas Fayre date: Saturday 5 December 2026 is confirmed by the project owner; the supplied calendar's 28 November is superseded. Verify the final public date.

## Open Questions

Resolve these as part of the related items above, then record outcomes in the brief.

### Brand and tone

- Are there official colour values and brand-use restrictions?
- Is occasional illustration wanted, or should typography and simple graphics remain the visual language?
- Once the logo-big.png question is settled, where should the purpose graphic go? (Keep the three pillars as HTML text.)

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
