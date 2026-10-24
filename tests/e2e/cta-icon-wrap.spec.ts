import { expect, test, type Page } from "@playwright/test";

// Nick's rule (24 Oct 2026): a CTA's trailing icon (arrow, external-link
// marker, calendar glyph) must stay on the same line as the final word of
// its label - it may never wrap onto a line of its own. Detects recurrence
// by comparing the icon's box with the label's last text line.
//
// A compliant CTA keeps its whole label (including the icon) in a single
// .cta-label span, with no whitespace between the final word and the icon.

const ctas = "a.button, .event-list-cta, a.event-list-calendar";

// Returns a description of every CTA whose trailing icon sits on a different
// line from the end of its label.
const strandedIcons = (page: Page) =>
  page.evaluate((selector) => {
    const failures: string[] = [];
    const range = document.createRange();
    for (const cta of document.querySelectorAll<HTMLElement>(selector)) {
      const icon = [...cta.querySelectorAll<HTMLElement>("[aria-hidden='true']")]
        .filter((el) => el.getBoundingClientRect().width > 0)
        .pop();
      if (!icon) continue;
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(cta, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (node.textContent?.trim() && !(node.parentElement?.closest(".visually-hidden, [aria-hidden='true']"))) textNodes.push(node as Text);
        node = walker.nextNode();
      }
      if (textNodes.length === 0) continue;
      range.selectNodeContents(textNodes[textNodes.length - 1]);
      const lines = [...range.getClientRects()];
      if (lines.length === 0) continue;
      const lastLine = lines.reduce((lowest, rect) => (rect.top > lowest.top ? rect : lowest));
      const iconBox = icon.getBoundingClientRect();
      const sameLine = iconBox.top < lastLine.bottom - 1 && iconBox.bottom > lastLine.top + 1;
      if (!sameLine) {
        failures.push(`${cta.textContent?.trim().replace(/\s+/g, " ").slice(0, 40)}: icon line y=${Math.round(iconBox.top)} but label's last line y=${Math.round(lastLine.top)}`);
      }
    }
    return failures;
  }, ctas);

// Emulates 200% text by doubling every computed font size (same approach as large-text-narrow.spec.ts).
const useLargeText = (page: Page) =>
  page.evaluate(() => {
    const elements = [...document.querySelectorAll<HTMLElement>("body *")];
    const sizes = elements.map((element) => parseFloat(getComputedStyle(element).fontSize));
    elements.forEach((element, index) => element.style.setProperty("font-size", `${sizes[index] * 2}px`, "important"));
  });

const pages = ["/events/fireworks-2026/", "/events/christmas-fayre-2026/", "/whats-on/"];
const widths = [320, 390, 1440];

test.describe("CTA trailing icons stay with the label", () => {
  for (const width of widths) {
    for (const path of pages) {
      test(`${path} at ${width}px`, async ({ page }) => {
        // Set each test's viewport explicitly: test.use() inside this loop
        // would overwrite the shared suite's viewport for every width.
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        expect(await page.evaluate(() => innerWidth)).toBe(width);
        expect(await strandedIcons(page)).toEqual([]);
      });
    }
  }

  test.describe("200% text at 390px", () => {
    test.use({ viewport: { width: 390, height: 900 } });
    for (const path of pages) {
      test(`${path} (per-element fonts)`, async ({ page }) => {
        await page.goto(path);
        await useLargeText(page);
        expect(await strandedIcons(page)).toEqual([]);
      });
      test(`${path} (root font size)`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
        expect(await strandedIcons(page)).toEqual([]);
      });
    }
  });
});
