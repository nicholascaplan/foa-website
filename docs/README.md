# Documentation Guide

How the project documentation is organised, why, and how to keep it that way. Read this before creating, moving or heavily editing any documentation.

## Where to Find Things

| Question | File |
|---|---|
| What is this repo and how do I run it? | [`../README.md`](../README.md) |
| How should an AI agent behave here? What must it never do? | [`../AGENTS.md`](../AGENTS.md) |
| What are we building, what has been decided, and how is it built? | [`PROJECT-BRIEF.md`](PROJECT-BRIEF.md) |
| What is outstanding, who owns it and what blocks it? | [`ACTIONS.md`](ACTIONS.md) |
| How do we test, and what do the tests protect? | [`TEST-STRATEGY.md`](TEST-STRATEGY.md) |

## Design Principles

1. **One job per file.** Each file answers one question from the table above. If content answers a different question, it belongs in a different file.
2. **One home per fact.** Every fact lives in exactly one file. Everywhere else, link to it rather than restating it. Duplicated facts drift apart, and a reader cannot tell which copy is right.
3. **Separate what changes slowly from what changes quickly.**
   - Slow: purpose, decisions, requirements, architecture (`PROJECT-BRIEF.md`, `TEST-STRATEGY.md`, `AGENTS.md`).
   - Fast: the backlog, open questions, provisional content (`ACTIONS.md`).
   - Fast-changing information must not be embedded in slow-changing files, because it makes them stale.
4. **Current state, not history.** Docs describe how things are now. Git history is the changelog; do not add dated session logs. Record the *outcome* of a decision in the brief, not the story of the session that made it.
5. **Few files, short files.** Prefer extending an existing file over adding a new one. Add a new file only when a new question needs answering that no existing file owns.

## Where Content Goes

| Type of content | Home |
|---|---|
| Confirmed product, design, content-policy or technical decisions | `PROJECT-BRIEF.md` → Decisions |
| Scope and requirements | `PROJECT-BRIEF.md` → Scope, Requirements |
| Architecture, hosting, deployment, analytics configuration, content models | `PROJECT-BRIEF.md` → Technical Specification |
| Anything not yet done or not yet confirmed (tasks, open questions, unverified facts) | `ACTIONS.md` |
| Rules for agent behaviour, content safety and copy conventions | `AGENTS.md` |
| Commands to install, run, build and verify | `README.md` |
| Test philosophy, layers, cadence | `TEST-STRATEGY.md` |

Lifecycle of an item: it starts in `ACTIONS.md` (a task, question or provisional fact); when it is resolved, move the outcome into `PROJECT-BRIEF.md` as a decision or spec and delete it from `ACTIONS.md`.

## Maintenance Rules

- **Do not create a second backlog.** Open work, open questions and provisional content appear only in `ACTIONS.md`.
- **Do not put status in the README or brief.** No "current state" narratives, "next step" paragraphs or "last session" notes. They go stale immediately. Use `ACTIONS.md`.
- **Keep `AGENTS.md` about behaviour.** Product detail belongs in the brief.
- **Replace, don't append.** When a decision changes, edit the existing decision; do not add a later entry that contradicts it.
- **Update `Last updated` in the brief** only when decisions, scope, requirements or architecture change.
- **Link, don't copy.** Use relative links to sections or files.
- **Check before finishing:** search for duplicated facts and for references to files that have moved or been removed.

## Rationale for This Structure

The earlier documentation put the product spec, decision register, backlog, open-question list, provisional-content list and a dated session log in one 1,200-line brief, and repeated the backlog in three more places. Agents and humans could not tell which list was authoritative, the resume instructions disagreed, and the session-closure rule (update the brief every session) made the file grow without bound.

The current structure fixes this by:

- giving every question a single obvious file (the table above);
- keeping the stable brief small enough to read in full before substantial work;
- isolating all volatile information in `ACTIONS.md`, which is cheap to update and easy to scan;
- relying on Git history instead of in-file changelogs;
- making session closure a small, bounded task (see `AGENTS.md`).

If this structure stops serving the project, change it deliberately and update this file; do not let it erode by accumulation. The superseded long-form brief, including its dated session logs and prototype-era step plan, remains available in Git history (commit `c2caebd` and earlier).
