# The Friends of Ashley Website Actions

## Content

- Complete a focused mobile and desktop review of all generated Astro routes, checking page order, spacing, heading scale, event/date labels, newsletter formatting and navigation terminology.

- Obtain higher-resolution committee portraits before the production site is launched. The current supplied photos may remain in the design prototype but should not be treated as final production assets.
- Confirm whether concise approved committee biographies will be published. If so, design them as visible, readable content rather than desktop-only tooltips.
- Confirm ownership, retention and access handling for the Google contact form.
- Confirm and record the approved access and retention arrangements for the shared FOA inbox and Google contact form. The Privacy Notice now identifies these as pending operational details.
- Google Analytics is consent-controlled with measurement ID `G-V2X8ZMQ5XZ`: the tag is absent until a visitor allows analytics cookies, and rejecting or withdrawing consent denies analytics storage and removes known Analytics cookies. Keep the existing 2-month event/user retention, disabled reset-on-activity, disabled Google Signals and user-provided-data capabilities, active email redaction, and no advertising, cross-domain or connected-site integrations.

## Brand assets

- Confirm whether the Ashley School mark embedded in `assets/logo-big.png` is approved for public use, or obtain a school-mark-free version.
- Once approved, test `logo-big.png` as a supporting purpose graphic beside the About The FOA or homepage three-pillars section. Keep the three pillar labels and explanations as HTML text so they remain readable and accessible on mobile.

## Pending operational decisions

- Select the external Fireworks ticketing provider and confirm capacity, refunds/cancellations, bad-weather handling, accessibility, data processing and the final checkout URL. The final integration will be a normal link to the provider.
- Reconfirm Pre-loved Uniform donation instructions before launch. Prices and payment are confirmed by the newsletter: £3 for coats and new-logo items, £1 for all other items, card only.
- Confirm final approval from The FOA for the Reps Hub messages before launch.

## Production planning

- Continue the Astro implementation with typed local content collections until the CMS is selected. Keep the models compatible with a later CMS adapter.
- GitHub Pages now serves the production site at `https://www.thefriendsofashley.org` with Enforce HTTPS enabled. Confirm the apex domain redirects to `www` as a final public-site check.
- The separate 123 Reg Standard SSL product is not needed for GitHub Pages. Cancel it or disable renewal after confirming the live site and redirect continue to work; do not change the existing DNS records.
- Select the CMS, then confirm editor ownership, preview workflow and annual access handover before integrating it.
- Implement the first milestone in `docs/TEST-STRATEGY.md`: add Playwright infrastructure, mobile-navigation browser coverage and representative automated accessibility scans. Generated internal-link and asset validation already runs in the deployment gate.
- Follow with newsletter-dialog, Reps Hub clipboard, metadata, structured-data, content-ordering and fixed-clock date-label coverage.
- Add selective screenshot-based visual regression only after the generated-site design has been approved.
- Consider adding a dark mode option as low-priority follow-up work; do not implement it as part of the current launch scope.
