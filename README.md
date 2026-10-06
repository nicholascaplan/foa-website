# The Friends of Ashley Website

Website for The Friends of Ashley (FOA), the parent teacher association for Ashley C of E Primary School in Walton-on-Thames. Live at <https://www.thefriendsofashley.org/>.

Built with Astro 7 (static output), typed local content collections and locally built CSS; deployed to GitHub Pages.

## Documentation

| File | Purpose |
|---|---|
| [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) | What we are building, confirmed decisions, requirements, architecture and deployment |
| [`docs/ACTIONS.md`](docs/ACTIONS.md) | Outstanding tasks, open questions and provisional content: **start here for next steps** |
| [`docs/TEST-STRATEGY.md`](docs/TEST-STRATEGY.md) | Testing layers, cadence and priorities |
| [`docs/README.md`](docs/README.md) | How the docs are organised and why; rules for maintaining them |
| [`AGENTS.md`](AGENTS.md) | Rules for AI agents, including content safety and the naming convention |

## Repository Layout

- `src/pages/`: one file per route
- `src/layouts/`, `src/components/`: shared shell and components
- `src/content/`: typed collections for events, newsletters and committee members
- `src/styles/global.css`: design tokens and component styles
- `src/scripts/`: Fireworks canvas effects and experience initialization
- `src/fonts/`: self-hosted Fireworks display font and its licence
- `assets/`: static files served from the site root, in sub-folders: `brand/`, `committee/`, `events/`, `sponsors/` and `documents/` (the paths used in content JSON and pages are relative to it)
- `tests/`: generated-site and unit tests (`*.test.mjs`), production Playwright/axe tests (`e2e/`) and local preview tests (`dev/`)
- `fundraising-progress-options.html`: unlinked design review page
- [`assets/documents/key-events-2026-27.md`](assets/documents/key-events-2026-27.md): editable calendar summary that follows the published website; public event listings use the structured event collection
- `.github/workflows/deploy.yml`: verify and deploy

## Local Development

```sh
npm install      # once
npm run dev      # opens http://localhost:4321/
```

The dev server watches for changes; stop it with `Ctrl+C`. On desktop, dev-only controls sit in the header between the logo/name home link and navigation: Night Mode, one mobile-preview icon (opens the current route at 390px), and reset cookie consent. Allow pop-ups if blocked. In the mobile top navigation, three growing phone icons labelled S / M / L (Small 360px, Medium 390px, Large 430px) resize the existing preview in place without reloading the page; its current size is highlighted. Local mobile branding uses the logo alone to fit the size controls beside Night Mode and the menu button. Browsers may restrict window resizing; browser device emulation remains the fallback. The header wraps when needed rather than covering text. The Night Mode choice is remembered locally; it defaults to Day Mode regardless of the system preference. These controls and the Night Mode preview are absent from production builds (including `npm run preview`).

To review the production build:

```sh
npm run build
npm run preview
```

`SITE_URL` sets the canonical origin and is not needed for ordinary local development.

## Verification

```sh
npm run verify                  # full gate used by CI: check, build, site tests, browser tests
npm run test:dev                 # local-only Night Mode tests; starts a fresh dev server on port 4348
npx playwright install chromium webkit # first browser-test run only
npm audit                       # dependency advisories
```

Individual steps: `npm run check` (Astro/TypeScript and content schema), `npm run build`, `npm run test:site` (rendered content and every internal link/asset), `npm run test:e2e` (navigation journeys and axe accessibility scans), `npm test` (fresh build, then both test suites). See [`docs/TEST-STRATEGY.md`](docs/TEST-STRATEGY.md) for what the tests protect and what is not covered.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`: it runs `npm run verify` and deploys to GitHub Pages only if all checks pass. Domain, DNS and build configuration are described in [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) → Technical Specification → Hosting, domain and deployment.
