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

The dev server watches for changes; stop it with `Ctrl+C`. Interior pages keep the local preview controls in the header: a desktop phone icon opens the current route at 390px, and the mobile phone icon offers Small (360px), Medium (390px) and Large (430px) widths without reloading the page. The homepage has no top header, so its local preview controls are available inside the burger menu. Reset cookie consent remains desktop-only. Allow pop-ups if blocked; browsers may restrict resizing, so device emulation remains the fallback. Controls wrap rather than covering text and are absent from production builds (including `npm run preview`). Public Night Mode is inside the menu on mobile and on the headerless homepage, and in the header on interior desktop pages.

To review the production build:

```sh
npm run build
npm run preview
```

`SITE_URL` sets the canonical origin and is not needed for ordinary local development.

## Verification

```sh
npm run verify                  # full gate used by CI: check, build, site tests, browser tests
npm run test:dev                 # local-only dev tool tests (phone preview, header layout); starts a fresh dev server on port 4348
npx playwright install chromium webkit # first browser-test run only
npm audit                       # dependency advisories
```

Individual steps: `npm run check` (Astro/TypeScript and content schema), `npm run build`, `npm run test:site` (rendered content and every internal link/asset), `npm run test:e2e` (navigation journeys and axe accessibility scans), `npm test` (fresh build, then both test suites). See [`docs/TEST-STRATEGY.md`](docs/TEST-STRATEGY.md) for what the tests protect and what is not covered.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`: it runs `npm run verify` and deploys to GitHub Pages only if all checks pass. Domain, DNS and build configuration are described in [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) → Technical Specification → Hosting, domain and deployment.
