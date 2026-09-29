# The Friends of Ashley Website

Design and implementation workspace for The Friends of Ashley (FOA), the parent teacher association for Ashley C of E Primary School in Walton-on-Thames.

## Current State

The repository now contains the first static Astro implementation of the currently approved public routes:

- `src/pages/`: separate generated pages with normal path-based links
- `src/layouts/` and `src/components/`: shared page shell, navigation, event and content components
- `src/content/`: typed local collections for events, newsletters and committee members
- `src/styles/global.css`: central design tokens and responsive component styles
- `assets/`: public brand assets for The FOA, event images, committee portraits and source documents
- `prototype/`: archived single-file, hash-routed design review prototype
- `.github/workflows/deploy.yml`: GitHub Pages build and deployment workflow
- `tests/site.test.mjs`: generated-site smoke and internal-link tests

The site includes canonical and social metadata, Event structured data, a sitemap, robots rules and a useful 404 page. Contact Us includes the approved Google Form, and Reps Hub includes copy-to-clipboard actions. Production routes avoid internal draft/readiness warnings; unresolved operational decisions remain tracked in `docs/ACTIONS.md`. The Community Notice Board, privacy notice and public accessibility statement are deferred to later scope.

## Local Development

Install dependencies once:

```sh
npm install
```

Start the Astro development server:

```sh
npm run dev
```

Open the local URL printed by Astro, normally `http://localhost:4321/`. The development server watches the source files and refreshes the site after changes. Stop it with `Ctrl+C`.

On desktop, use the **Mobile preview** button in the bottom-right corner to open the current route in a 390px-wide browser window. The button is available only under `npm run dev` and is omitted from production builds. If the browser blocks the new window, allow pop-ups for the local Astro address.

To review the production build locally:

```sh
npm run build
npm run preview
```

The canonical production origin is configured through `SITE_URL`. It is not required for ordinary local development.

The current mobile-review deployment is published at <https://nicholascaplan.github.io/foa-website/>. The build uses a repository base path for that temporary URL while retaining support for a future custom-domain root. The public pre-launch holding page is deliberately deployed from the separate `nicholascaplan/foa-holding-page` repository, so the in-progress full site remains available at this review URL.

## Automated Verification

Run the current automated checks with:

```sh
npm run check
npm run build
npm test
npm audit
```

- `npm run check` performs Astro and TypeScript diagnostics, including content-collection schema validation.
- `npm run build` verifies that every static route and production asset can be generated.
- `npm test` checks key rendered homepage content and verifies that every generated internal link and asset resolves, including repository-base-path asset URLs.
- `npm run verify` runs the type, build and test gates in the same order used by GitHub Actions.
- `npm audit` checks installed dependencies against published security advisories.

These are initial deployment gates, not a complete automated test suite. Browser end-to-end tests, automated accessibility tests and visual regression tests have not yet been added.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`. The workflow installs locked dependencies, runs `npm run verify`, uploads `dist/` only after those checks pass, and then deploys the artifact through GitHub Pages. Failed checks prevent the deployment job from starting.

The planned public domain is `thefriendsofashley.org`. It remains attached to the holding-page repository until launch, when its GitHub Pages custom-domain assignment will move to this repository and this workflow will be updated for the root-domain build.

## Project Record

[`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) is the canonical project record. It contains:

- Current progress
- Decisions made
- Ordered next steps
- Open clarifications and design decisions
- Technical specification
- Scope and exclusions
- Functional and non-functional requirements

When resuming work, read that document first and begin with **Next Steps** and **Further Clarifications and Design Decisions Needed**.

[`AGENTS.md`](AGENTS.md) contains durable instructions for AI agents, including the required session-closure and documentation workflow.

[`docs/STYLE-GUIDE.md`](docs/STYLE-GUIDE.md) contains the public copy convention for the organisation name and related usage.

[`docs/TEST-STRATEGY.md`](docs/TEST-STRATEGY.md) defines the risk-based automated and manual test layers, CI cadence and phased implementation order.

## Immediate Next Step

Review the deployed Astro site on phone and desktop, then resolve the content and operational blockers in `docs/ACTIONS.md` before the production-domain launch. Formal accessibility testing, a public accessibility statement and a future Community Notice Board decision are lower-priority follow-up work.
