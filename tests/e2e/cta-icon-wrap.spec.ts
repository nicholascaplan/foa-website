import { expect, test, type Page } from "@playwright/test";

// Nick's rule (24 Oct 2026): a CTA's trailing icon (arrow, external-link
// marker, calendar glyph) must stay on the same line as the final word of
// its label - it may never wrap onto a line of its own. Detects recurrence
// by comparing the icon's box with the label's last text line.
//
// A compliant CTA keeps its whole label (including the icon) in a single
// .cta-label span, with no whitespace between the final word and the icon.

const ctas = "a.button, .event-list-cta, a.event-list-calendar, .add-calendar a, a.text-link, a.designer-credit, .member-vacancy a, .newsletter-sign-off a";

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

// Every public route is covered: the rule is site-wide.
import { routes } from "./routes";
const pages = routes;
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

test.describe("Wrapping stays inside the neighbouring content column", () => {
  for (const width of [320, 768, 1440]) {
    for (const night of [false, true]) {
      for (const textSize of ["normal", "200% per-element", "200% root"]) {
        for (const path of ["/newsletter/", "/fireworks-volunteering/", "/uniform/"]) {
          test(`${path} ${width}px ${night ? "Night" : "Day"} ${textSize}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ reducedMotion: "reduce" });
            await page.addInitScript((theme) => localStorage.setItem("foa-theme", theme), night ? "night" : "day");
            await page.goto(path === "/newsletter/" ? `${path}#newsletter-issue-autumn-term-2026` : path);
            if (textSize === "200% per-element") await useLargeText(page);
            if (textSize === "200% root") await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
            // Reproduce the wider fallback fonts used by Linux CI, not only macOS fonts.
            await page.addStyleTag({ content: ".cta-label, .newsletter-more a { font-family: Verdana, sans-serif !important; }" });
            await page.evaluate(() => document.fonts.ready);
            if (path === "/fireworks-volunteering/") {
              // Emulating reduced motion triggers a media-change style recalc that can
              // leave the root percentage font size unsettled for a few hundred ms;
              // wait until the enlargement has actually taken effect before measuring.
              if (textSize !== "normal") await expect(page.locator(".fw-vol .content-section").first()).toHaveCSS("font-size", "32px");
              const columns = await page.locator(".vol-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length);
              if (textSize === "normal") expect(columns).toBe(width === 1440 ? 3 : width === 768 ? 2 : 1);
              else if (width <= 768) expect(columns, "enlarged narrow columns must stack").toBe(1);
            }
            if (path === "/newsletter/") {
              await page.locator("#newsletter-issue-autumn-term-2026 .newsletter-read-more").click();
              await expect(page.locator('.newsletter-more a[href="https://ashleyschool.org.uk/calendar"]')).toBeVisible();
            }
            expect(await strandedIcons(page)).toEqual([]);
            expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
            const overflow = await page.locator(".newsletter-more a:visible, .vol-card__action, .uniform-action").evaluateAll((links) => links.flatMap((link) => {
              const column = link.closest("p, li, .newsletter-more, .vol-card, .view-hero-action")!.getBoundingClientRect();
              const range = document.createRange();
              const rects = [...link.querySelectorAll(".cta-icon, .external-link-icon")].map((icon) => icon.getBoundingClientRect());
              const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
              let node = walker.nextNode();
              while (node) {
                if (node.textContent?.trim() && !node.parentElement?.closest('.visually-hidden, [aria-hidden="true"]')) {
                  range.selectNodeContents(node);
                  rects.push(...range.getClientRects());
                }
                node = walker.nextNode();
              }
              const outside = rects.filter((rect) => rect.width > 1 && (rect.left < column.left - 1 || rect.right > column.right + 1));
              return outside.length ? [{ text: link.textContent, column: { left: column.left, right: column.right }, outside: outside.map(({ left, right }) => ({ left, right })) }] : [];
            }));
            expect(overflow, "link text and icon must stay inside their own column").toEqual([]);
          });
        }
      }
    }
  }
});
