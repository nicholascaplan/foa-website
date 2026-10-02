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
| Select the external Fireworks ticketing provider and supply the final checkout URL. Until then the event page shows "Ticket link to follow." Add it as a normal external link. | FOA | Provider decision |
| Confirm Fireworks capacity, refund/cancellation and bad-weather policy, accessibility details and provider data-processing responsibilities. | FOA | Provider decision |
| Confirm access and retention arrangements for the shared FOA inbox and the Google contact form (ownership, who has access, retention). The Privacy Notice currently records these as pending. | FOA | FOA decision |
| Reconfirm Pre-loved Uniform donation instructions and accepted/rejected items. Prices (£3 coats and new-logo items, £1 other items, card only) are confirmed. | FOA | FOA confirmation |
| Approve the Reps Hub messages. | FOA | FOA approval |
| Obtain higher-resolution committee portraits (Nick Caplan's replacement is already in use) and complete the final publication-consent check for all names, roles and portraits. | FOA / Owner | Supplied photos, consent |
| Confirm the Ashley School mark in `assets/logo-big.png` is approved for public use, or obtain a school-mark-free version. | FOA | School/FOA approval |
| Confirm the apex domain `thefriendsofashley.org` redirects to `www`. | Owner | None |
| Cancel the 123 Reg Standard SSL product (£59.99/year) or disable renewal; it is not needed for GitHub Pages. Do not change the existing DNS records. | Owner | Confirm live site and redirect first |
| Run a constrained-connection mobile performance test, including the Fireworks image load. | Dev | None |
| Complete a focused mobile and desktop review of all routes: page order, spacing, heading scale, event/date labels, newsletter formatting and navigation terminology. | Owner | None |

## Soon

| Item | Owner | Blocked by |
|---|---|---|
| Test coverage: Reps Hub clipboard success and failure (mocked clipboard). See [`TEST-STRATEGY.md`](TEST-STRATEGY.md). | Dev | None |
| Test coverage: newsletter dialog open, close by button and backdrop, scroll-lock release and focus. | Dev | None |
| Test coverage: fixed-clock browser tests for the Welcome Tea → Fireworks switch (UK midnight and BST) and Today/Tomorrow labels, run in CI. | Dev | None |
| Test coverage: generated-site contracts for expected routes, canonical/social metadata, sitemap/robots, Fireworks JSON-LD, absence of the dev mobile preview, and a `/foa-website/` base-path build. | Dev | None |
| Test coverage: content invariants (event end after start, exactly one latest newsletter, unique committee order, required image alt text). | Dev | None |
| Test coverage: consent-controlled Google Analytics journey in the browser suite; add a pull-request trigger to CI. | Dev | None |
| Committee page: decide whether the routes to Reps Hub and About The FOA are clear enough; if not, use more explicit task-focused labels. | Owner | None |
| Decide whether About The FOA should carry a concise committee summary. The Committee page remains the canonical source; avoid duplicating member details. | Owner | None |
| Decide whether to publish short committee biographies. If so, present them as visible readable content, not desktop-only tooltips. | FOA | FOA decision |
| Run the 5–7 parent/carer task-based information-architecture test (see *Suggested IA test tasks* below). | Owner | Participants |
| Set up uptime monitoring for the `www` domain with an agreed alert recipient and response owner. | Owner | Tool choice |
| Decide whether to add fundraising progress (see `fundraising-progress-options.html`): confirm fundraising purpose, approved target, data owner, update process, donation action, homepage placement and end-of-campaign treatment before implementing anything. | FOA | FOA decisions |

## Later

- Select and integrate a CMS, only after editor ownership, preview/publish workflow, annual access handover, urgent-update and failed-build procedures are confirmed (see *Open questions → Content management*).
- Formal manual accessibility testing (keyboard, zoom, screen reader), then publish a public accessibility statement.
- Moderated Community Notice Board (deferred; no public route). Needs the decisions listed under *Open questions → Notice Board*.
- Additional reviewed translations and RTL testing; FAQs page; native share; add-to-calendar downloads.
- Low-priority "Inspiration" archive of past event posters (standalone page or within What's On).
- Selective screenshot visual regression, after the visual design is approved.
- Dark mode (low priority; do not implement as part of launch work).
- AI support bot for common parent/carer questions. Needs approved knowledge sources, committee ownership, privacy/safeguarding boundaries, human escalation, accessibility, cost and failure handling. Must not answer safety-critical, transactional or sensitive queries without reviewed safeguards.
- Confirm the wording of the inclusive membership statement against the FOA constitution.
- Confirm who is authorised to approve website content.

## Provisional Content

These facts appear on the site or in drafts but are not confirmed by an authorised FOA owner. Keep them labelled as provisional or absent from public pages until confirmed.

- Fireworks: capacity; what the quiet display involves and its accessibility characteristics; access and facilities (step-free, toilets, first aid, parking); refund, cancellation and bad-weather policy; event-day contact.
- Uniform: accepted and rejected items; donation conditions (washed, labelled, bagged); bin-emptying frequency; whether sale dates are regular or ad hoc; size requests between sales.
- Final ticket provider and URL.
- Privacy Notice details about shared-inbox and Google Form access/retention.
- Reps Hub copy (pending FOA approval).
- Co-Secretary recruitment copy (final wording and publication review).
- Arabic translation quality (demonstration only; human review required).
- Fundraising-progress target (the £25,000 in `fundraising-progress-options.html` is illustrative only).
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
- Should native device sharing and translated versions be offered?

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
