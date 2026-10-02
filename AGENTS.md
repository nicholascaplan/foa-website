# Agent Instructions

Durable working rules for AI agents contributing to The Friends of Ashley website. Read this first, then follow the pointers below. This file is about **how to behave**; product detail lives in the brief.

## Start Here

| You need | Read |
|---|---|
| Product, decisions, requirements, architecture | [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) |
| What is outstanding, who owns it, what blocks it | [`docs/ACTIONS.md`](docs/ACTIONS.md) |
| Testing approach | [`docs/TEST-STRATEGY.md`](docs/TEST-STRATEGY.md) |
| Where documentation belongs, and why it is structured this way | [`docs/README.md`](docs/README.md) |
| Commands to run, build and verify | [`README.md`](README.md) |

Read the brief before substantial design, content or architecture work.

## Project Context

- Website for The Friends of Ashley (FOA), the PTA for Ashley C of E Primary School, Walton-on-Thames.
- Astro 7, static output, typed local content collections, locally built CSS, deployed to GitHub Pages at `www.thefriendsofashley.org`. The site is live; work is operational follow-up, quality and later scope.
- The earlier hash-routed prototype in `prototype/` is archived for reference only.
- Do not select or integrate a CMS until content ownership, editor access, preview and publishing workflows are confirmed.

## Confirmed Direction

- Warm modern editorial community noticeboard; mobile-first with deliberate desktop layouts.
- Prioritise current events and practical parent tasks. Do not make the public site feel like a SaaS dashboard.
- Primary navigation: Home, What's On, Get Involved, Uniform.
- Heritage green is primary; amber is mainly for events and celebration.
- Ticket purchases use an external provider. Auctions, parent accounts and unmoderated publishing are out of scope.

The full decision list is in the brief.

## Content and Safety Rules

- Do not invent event, accessibility, ticketing, uniform, committee or legal facts. Label unknown or provisional information clearly; the provisional list is in `docs/ACTIONS.md`.
- Committee presentation uses names and roles (plus approved portraits) only.
- Do not publish child year groups or other unnecessary child-related information.
- Do not add personal contact details; use the shared FOA contact route.
- Safety-critical and transactional translations require human review.
- A final pre-publication check is still required for committee names, roles and portrait consent.

### Naming convention for public copy

Applies to site copy, metadata, navigation labels, structured data, prototypes and documentation. It does not apply to filenames, URLs, email addresses or code identifiers.

- Full name: **The Friends of Ashley**. Shortened form after introduction: **The FOA**.
- On first mention in longer copy, use **The Friends of Ashley (FOA)** if the abbreviation is used later.
- Never write "Friends of Ashley" without **The**, and never use bare "FOA" as the organisation name in copy or titles.
- Keep `thefriendsofashley@gmail.com` and other technical identifiers unchanged.
- Correct: "Contact The FOA about volunteering." Incorrect: "Contact FOA about volunteering."

## Implementation Expectations

- Preserve semantic HTML, keyboard access, visible focus and reduced-motion support.
- Keep important body copy comfortably readable.
- Use real links and buttons, not clickable generic elements.
- Keep design values in central CSS tokens.
- Keep event facts in one structured source (the content collections); do not duplicate them in page copy.
- Use `withBase()` for asset and internal URLs so the site works at the root and at `/foa-website/`.
- Avoid new external runtime dependencies or optional tracking unless explicitly approved. Analytics is consent-controlled; extend the Privacy Notice and consent control before adding anything optional.
- Verify with the commands in [`README.md`](README.md) (`npm run verify` is the full gate), and check whitespace after edits.
- After changing Astro content schemas, collection loaders, content-driven route filters or Astro configuration, start a **fresh** development server and make an HTTP request to every affected route. Confirm a successful response and the expected content. Do not rely only on `astro check`, a production build or an already-running dev server: Astro's dev content store can retain stale collection state after schema changes.

## Documentation Rules

Full rules and rationale are in [`docs/README.md`](docs/README.md). The essentials:

- **One home per fact; link, don't copy.**
- Open tasks, questions and provisional content go in `docs/ACTIONS.md` only. Do not create other backlogs or put status or "next step" text in the README or brief.
- Confirmed decisions, scope, requirements and architecture go in `docs/PROJECT-BRIEF.md`. Edit entries in place; do not append dated session logs. Git history is the changelog.
- When an action is resolved, move its outcome into the brief and delete it from `ACTIONS.md`.
- Do not add new documentation files without a clear question that no existing file answers.
- Update `README.md` only if commands, entry points or the file layout change.

## Session Closure

When the user says "close session", "end session" or clearly wraps up:

1. Update `docs/ACTIONS.md` (new, resolved or re-prioritised items).
2. Update `docs/PROJECT-BRIEF.md` only if a decision, scope, requirement or architecture changed (and its `Last updated` date).
3. Update `README.md` or this file only if commands, structure or agent rules changed.
4. Run verification appropriate to the files changed.
5. Inspect Git status. Summarise what was completed, what remains and the first recommended next action.
6. If the repository is connected to GitHub, commit and push the completed session changes after documentation and verification. Do not commit or push unrelated changes, or if the user asks you not to.

Material decisions must not exist only in the conversation.

## Resuming Work

When asked "What are the next steps?":

1. Read `docs/ACTIONS.md`: Launch-blocking first, then Soon.
2. Check each item's **Blocked by** column and the Open Questions section.
3. Check the current worktree (`git status`) rather than assuming the docs match exactly.
4. Answer with the first actionable steps in priority order, separating unblocked **Dev** work from decisions needed from the user.
