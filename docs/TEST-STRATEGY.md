# Test Strategy

## Purpose

The test suite should make routine content and frontend changes safe without making the static site expensive to maintain. Coverage is risk-based: protect what parents rely on, what changes often, and what can fail silently in a generated deployment.

The strategy complements, rather than replaces, stakeholder content review, real-device review and manual accessibility testing.

## Testing Principles

- Test public behaviour and generated output rather than Astro implementation details.
- Keep the default verification path deterministic, headless and suitable for GitHub Actions.
- Prefer a small number of high-value journey tests over exhaustive page-by-page duplication.
- Put assertions at the lowest useful layer: schema rules in content validation, links in generated-site tests, and interactions in a real browser.
- Use roles, accessible names and stable public URLs as browser-test selectors. Add test-specific selectors only when no meaningful accessible selector exists.
- Avoid exact full-page HTML snapshots, broad text dumps and pixel screenshots for content that changes frequently.
- Every production bug should receive a focused regression test at the lowest layer that can reproduce it reliably.
- Tests must support both root hosting and the temporary `/foa-website/` GitHub Pages base path.

## Risk Priorities

### Highest priority

- Users can reach the main task routes and the generated links and assets resolve.
- Mobile navigation opens, closes and exposes the correct state to assistive technology.
- Time-sensitive event and uniform information is rendered from valid structured content in the intended order.
- Reps Hub copy actions and newsletter dialogs work, including keyboard and failure states.
- Pages retain essential accessibility foundations: landmarks, heading structure, names, focusable controls and no detectable WCAG violations in representative routes.
- Canonical URLs, social metadata, robots rules, sitemap entries and Event structured data remain correct across deployment base paths.

### Medium priority

- Responsive layouts remain usable at representative narrow mobile and desktop widths.
- The 404 page, external contact handoff and future ticket-provider handoff behave as intended.
- JavaScript-enhanced features leave the underlying content and navigation usable when JavaScript is unavailable where practical.

### Later or conditional

- Screenshot regression for a small set of stable pages once the visual design is approved.
- CMS preview, publication and expiry tests after a CMS is selected.
- Ticket-provider end-to-end checks after the real provider and URL are confirmed.
- Locale and RTL browser coverage when a translated locale is approved for launch.
- Analytics and consent tests if analytics is introduced.

## Test Layers

### 1. Static checks and content validation

Keep `astro check` as the first, fast gate. Astro content schemas should reject invalid field types and unsupported states during the build.

As the content model grows, add explicit validation for business invariants that a field schema alone cannot express, for example:

- An event end time is later than its start time.
- An archived event is not also featured as current content.
- A linked event has a valid internal path or approved external URL.
- Exactly one newsletter is marked as latest.
- Committee display order values are unique.
- Images that are supplied also have meaningful alternative text where required.

Do not unit-test Astro templates solely to reproduce checks already provided by TypeScript, Astro or the content schema.

### 2. Generated-site contract tests

Continue using Node's built-in test runner against `dist/`. These tests are fast and should cover contracts that do not require a browser:

- Every expected public route is generated.
- Every generated internal link, stylesheet, script and local asset resolves.
- Main navigation destinations are present on public pages.
- Required metadata is present and canonical URLs respect `SITE_URL` and `BASE_PATH`.
- Sitemap, robots output and the no-indexed playground behaviour are correct.
- Event structured data is valid JSON and contains the confirmed source fields.
- Important collection-driven ordering and separation rules hold, such as upcoming versus archived events and latest versus previous newsletters.

Pure logic lives in `src/lib` (event visibility and UK-day labels in `event-visibility.ts`, content rendering in `inline.ts`, and the visual fundraising percentage in `fundraising-progress.ts`) and is unit-tested directly with the same runner, including clock-change, escaping and empty/reached/exceeded-goal edge cases. Browser tests then only need to prove the wiring.

Do not assert on minified CSS, editable prose or facts the link crawler already covers. Where a test needs an event date, derive it from the content file rather than hard-coding it.

Prefer structural parsing over increasingly broad regular expressions when these tests expand. Keep content assertions focused on critical facts and ordering; do not freeze every sentence of editable copy.

### 3. Browser end-to-end tests

Use Playwright for interactions and complete parent journeys. Run against a production build served locally so routing, built scripts and base-path behaviour match deployment closely. The production suite starts a dedicated preview server on port 4347 with `--ignore-lock` and does not reuse an existing server, keeping it separate from normal development/preview sessions and the development suite.

Initial browser scenarios:

1. Navigate from Home to What's On, Fundraising, Uniform and Get Involved using normal links; verify the destination and current-page indication.
2. At a mobile viewport, open the menu, verify `aria-expanded` and visibility, close it with the close button, backdrop and Escape key, and verify sensible focus behaviour.
3. Open a previous newsletter, verify its title and content, close it by button and backdrop, and verify page-scroll locking is removed.
4. Copy a Reps Hub message with a mocked clipboard, verify success feedback, and verify the feedback clears. Simulate an unavailable or rejected clipboard and verify failure feedback.
5. Follow a key parent journey to find the Fireworks time and uniform donation information.
6. Verify Today/Tomorrow labels using a fixed browser clock near a date boundary rather than depending on the day the test runs.
7. Confirm the development-only mobile-preview control is absent from the production build.

Generated-site contracts in `tests/site.test.mjs` cover the homepage Welcome Tea poster and Fireworks hero-switch boundary attributes. Browser coverage for the UK-time date transition remains required in CI.

Further browser scenarios now covered: clicking through from What's On opens the Fireworks page without a return breadcrumb; key event information stays reachable with JavaScript disabled (the footer is the mobile navigation fallback); and axe plus a no-horizontal-scroll check run at a 390px viewport, including the open mobile menu.

The Fireworks suite also runs in a focused `webkit-fireworks` project alongside Chromium. It checks static narrow/touch views (including direct landscape visits, orientation changes and wider touch screens), no initial canvas contexts or animation-frame requests, no new drawing work after scrolling or preference changes, and cancellation/buffer release when desktop switches into static mode. `tests/fireworks-motion.test.mjs` exercises the real initializer against a minimal browser harness to verify lazy canvas creation, cancellation and buffer release without launching a browser. The no-JavaScript page is static from its initial HTML. These are behavioural and compatibility checks, not physical-iPhone performance benchmarks; real-device follow-up is tracked in `ACTIONS.md`.

Keep browser coverage concentrated on shared navigation and unique interactions. Static pages with no distinct behaviour should be covered by generated-site and accessibility checks rather than repetitive end-to-end tests.

Fundraising coverage is defined in `tests/e2e/fundraising.spec.ts`: the shared Home/Fundraising animation runs once and reaches the real amount; the modest visual fill does not alter accessible progress values; reduced-motion and no-JavaScript modes retain final figures; responsive columns, previous-year alignment and enlarged text do not overflow. Generated-site tests cover shared financial content, both menu orders/current-page indication and the absence of a donation CTA in the homepage band. Browser execution blockers and manual-review follow-ups belong in `ACTIONS.md`.

Development-only Night Mode is covered separately by `tests/dev/night-mode.spec.ts` and `playwright.dev.config.ts` (`npm run test:dev`). This starts its own fresh development server without replacing an existing one. It checks keyboard state, preference persistence, blocked storage, responsive sizing, unchanged images, expanded newsletters, mobile navigation, enlarged text and representative axe scans. The production suite and generated-output tests independently assert that preview code/styles are absent and saved local preferences have no effect. Keep dev-server tests out of the production-preview suite so the normal deployment gate still exercises the deployed output.

### 4. Automated accessibility checks

`tests/e2e/accessibility.spec.ts` runs `@axe-core/playwright` against **every page in the production build** (discovered from `dist/`, at desktop and 390px mobile widths), so a new route is scanned with no test edit. Only `/playground.html` is excluded, in an explicit `excluded` list. Interactive states (expanded newsletters, the open mobile menu) are scanned separately. The page types this must always cover include:

- Home
- What's On
- Fireworks event detail
- Uniform
- Committee
- Newsletter with its dialog both closed and open
- Reps Hub
- Contact
- 404

Fail on serious and critical violations initially. Review all reported violations and tighten the threshold when the baseline is clean; do not create broad rule exclusions. Any narrow exception must include a reason and a follow-up action.

Automated checks do not establish WCAG 2.2 AA conformance. Before launch, manually verify keyboard-only use, visible focus, 200% zoom, mobile text enlargement, reduced motion and representative screen-reader journeys.

### 5. Visual and performance checks

Do not start with broad screenshot regression while page content and spacing are still being refined. After visual approval, add a small baseline set at approximately 390px mobile and one desktop width for Home, What's On, an event page and one dense content page. Mask only genuinely dynamic date labels and keep review of changed baselines explicit.

Use Lighthouse or an equivalent deployed-site check as a scheduled or pre-launch diagnostic rather than a blocking check on every change at first. Track mobile performance, image weight, layout shift and accessibility; set blocking budgets only after measuring a stable baseline.

## Manual Testing

Automation cannot approve facts, tone or usability. Retain these manual activities:

- Real-device checks on a small phone, a current iPhone or Android device, and desktop.
- Keyboard navigation through every interactive control.
- VoiceOver or NVDA checks of navigation, menu, dialog and clipboard feedback.
- Content approval for dates, prices, roles, contact routes and provisional operational information.
- Lightweight task-based information-architecture testing with parents and carers.
- External-provider checkout and privacy review when ticketing or forms change.

Record reusable manual checks in a short release checklist once launch preparation begins.

## Execution And CI

The intended commands are:

```sh
npm run check          # Astro, TypeScript and content validation
npm run build          # Static generation
npm run test:site      # Generated-output contract tests
npm run test:e2e       # Playwright journeys and accessibility checks
npm run verify         # Required pull-request and deployment gate
```

Local runs use installed Chrome on macOS, while CI uses bundled Chromium on Linux with different fallback fonts. Narrow-width and enlarged-text layout tests can therefore pass locally and fail in CI. To reproduce, temporarily set `--font-body` to a wide font such as `Verdana, sans-serif` in `src/styles/global.css`, then run the affected specs with `--retries=0`.

During the first implementation phase, keep `npm test` as the convenient aggregate command. It creates a fresh production build before running tests that consume `dist/`. `npm run verify` remains the authoritative CI gate and adds Astro and TypeScript diagnostics before `npm test`.

Recommended cadence:

- Every pull request and push to `main`: check, build, generated-site tests, Chromium browser journeys and automated accessibility scans.
- Before launch and after changes to shared CSS, navigation or interactions: Chromium plus WebKit, Firefox and manual mobile review.
- Scheduled or pre-launch: dependency audit, deployed-site link check and mobile performance run.

Pin the Node version used locally and in CI when project tooling is formalised. Cache Playwright browser downloads in CI only if it materially improves build time without obscuring failures.

## Coverage And Maintenance

Line coverage is not a useful primary target for this mostly static Astro site. Track confidence through requirement and journey coverage instead:

- Each client-side interaction has a successful-path and important failure-path browser test.
- Each public route is generated and reachable by the link crawler or expected-route test.
- Each distinct page template is represented in automated accessibility scans.
- Each confirmed high-risk business rule has one focused contract test.

Tests should fail with a message that identifies the broken route, reference or behaviour. Quarantine is not the default response to a flaky test: fix nondeterministic clocks, animation, network access and selectors. Tests must not depend on live third-party services.

## Implementation Order

Build in this order, so the broadest protection and the riskiest bespoke behaviour come first:

1. Playwright and `@axe-core/playwright` with production-preview configuration.
2. Mobile-menu browser tests and representative accessibility scans.
3. Newsletter dialog, Reps Hub clipboard success/failure and fixed-clock event-transition coverage.
4. Generated-site contracts for expected routes, metadata, structured data, sitemap/robots and collection ordering.
5. Fixed-clock date-label tests and key parent journeys.
6. Cross-browser CI coverage once the Chromium suite is stable and fast.
7. Selective visual regression and performance baselines after design approval.
8. Extensions when CMS, ticketing, analytics or translated locales are introduced.

Steps 3–4 take priority because they protect interactions and output that can fail without breaking static route generation. Defer visual regression, cross-browser expansion and conditional CMS/ticketing/analytics tests until the Chromium baseline and operational content are stable. Which steps are complete, and what remains, is tracked in [`ACTIONS.md`](ACTIONS.md).
