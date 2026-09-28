# Agent Instructions

This file contains durable working instructions for AI agents contributing to the Friends of Ashley website. Read it before making changes.

## Project Context

- This is the website for Friends of Ashley (FOA), the PTA for Ashley C of E Primary School in Walton-on-Thames.
- The canonical product and engineering record is [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md).
- Read the project brief before substantial design, content or architecture work.
- Use [`README.md`](README.md) for a short repository orientation.
- Treat repository documentation as part of the deliverable, not as optional supporting material.

## Current Phase

- The project is now in first-pass production frontend implementation and generated-site review.
- The active implementation is Astro 7 with static output, typed local content collections and locally built CSS.
- The earlier dependency-free HTML, CSS and JavaScript review prototype is archived in `prototype/`.
- Do not select or integrate a CMS until content ownership, editor access, preview and publishing workflows are confirmed.

## Confirmed Direction

- Design character: warm modern editorial community noticeboard.
- Mobile-first, but with deliberate desktop layouts.
- Prioritise current events and practical parent tasks.
- Avoid making the public site feel like a SaaS dashboard.
- Primary navigation: Home, What's On, Uniform, Get Involved and Community.
- Heritage green is the primary brand colour; amber is mainly for events and celebration.
- Use restrained cards, large legible typography and minimal dependence on photography.
- English is the current primary language; one Arabic RTL example demonstrates layout support.
- Ticket purchases will use an external provider rather than an FOA-built checkout.
- The Community Notice Board is editorial and committee-managed for MVP.
- Auctions, parent accounts and unmoderated publishing are out of scope for MVP.

## Content and Safety Rules

- Do not invent event, accessibility, ticketing, uniform, committee or legal facts.
- Clearly label unknown or provisional operational information.
- The supplied Fireworks image may be used on the site.
- The supplied committee portraits may be used in the prototype.
- Committee presentation should use names and roles only unless additional approved content is provided.
- Do not publish child year groups or other unnecessary child-related information.
- Do not add personal contact details; use the shared FOA contact route.
- A final pre-publication check is still required for committee names, roles and portrait consent.
- Safety-critical and transactional translations require human review.

## Implementation Expectations

- Preserve semantic HTML, keyboard access, visible focus and reduced-motion support.
- Keep important body copy comfortably readable; do not reproduce the tiny text from the original sandbox prototype.
- Use real links and buttons rather than clickable generic elements.
- Keep design values centralised in CSS tokens.
- Keep event facts in one future structured source rather than duplicating them once production implementation begins.
- Avoid external runtime dependencies during the current prototype phase unless explicitly approved.
- Verify local links, referenced assets, JavaScript syntax and whitespace after edits.

## Documentation Workflow

Update [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) whenever work changes any of the following:

- Current implementation status
- Confirmed product or design decisions
- Requirements or scope
- Open questions or blockers
- Ordered next steps
- Technical architecture
- Known provisional content

Keep [`README.md`](README.md) accurate when files, entry points or the immediate next step change.

Avoid duplicating the complete project brief in this file. This file should contain agent behavior and high-value constraints; the project brief should contain detailed product state and specifications.

## Session Closure Protocol

When the user says **"close session"**, **"end session"**, or clearly asks to wrap up the current work:

1. Review the work completed during the session.
2. Update `docs/PROJECT-BRIEF.md` with all confirmed decisions, implementation progress, changed requirements, unresolved questions and reordered next steps.
3. Update `README.md` and `AGENTS.md` if their guidance or current-state summary has changed.
4. Run appropriate verification for the files changed during the session.
5. Summarise what was completed, what remains unresolved and the first recommended next action.
6. Inspect Git status so the summary accurately identifies outstanding changes.
7. If the repository has been connected to GitHub, commit and push the completed session changes after documentation and verification. Do not commit or push unrelated changes, and do not commit or push if the user explicitly asks not to.

Documentation updates happen before asking about a commit. A session should not be considered closed while material decisions exist only in the conversation.

## Resuming Work

When asked **"What are the next steps?"**:

1. Read Section 4 of `docs/PROJECT-BRIEF.md`.
2. Check Section 5 for decisions that block the first pending step.
3. Check the current worktree before assuming the documented implementation state is exact.
4. Answer with the first actionable steps in priority order, distinguishing unblocked work from decisions needed from the user.
