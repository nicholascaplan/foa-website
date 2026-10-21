import { expect, test } from "@playwright/test";

for (const route of ["/about/", "/committee/", "/contact/", "/meeting-minutes/", "/privacy/", "/get-involved/"]) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const night of [false, true]) {
      for (const enlarged of [false, true]) {
        test(`${route} section spacing at ${width}px, ${night ? "Night" : "Day"}, ${enlarged ? "200%" : "normal"} text`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(route);
          await page.evaluate(({ night, enlarged }) => {
            document.documentElement.dataset.theme = night ? "night" : "day";
            document.documentElement.style.fontSize = enlarged ? "200%" : "100%";
          }, { night, enlarged });
          const rootSize = enlarged ? 32 : 16;
          await expect(page.locator("html")).toHaveCSS("font-size", `${rootSize}px`);
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const spacing = await page.evaluate(() => {
            const hero = document.querySelector(".view-hero")!.getBoundingClientRect();
            const section = document.querySelector(".content-section--desktop-snug")!;
            const content = section.firstElementChild!.getBoundingClientRect();
            const footer = document.querySelector(".site-footer")!.getBoundingClientRect();
            return {
              above: content.top - hero.bottom,
              below: footer.top - content.bottom,
              overflow: document.documentElement.scrollWidth - innerWidth,
              overflowing: [...document.querySelectorAll("main *")].filter(element => element.getBoundingClientRect().right > innerWidth + 1).map(element => `${element.tagName}.${element.className}: ${element.textContent?.slice(0, 40)}`),
            };
          });
          const expected = width < 768 || width >= 1024 ? 2.25 * rootSize : Math.max(2.5 * rootSize, Math.min(width * 0.06, 4.5 * rootSize));
          const topMargin = width < 1024 && ["/about/", "/meeting-minutes/"].includes(route) ? rootSize : 0;
          const bottomMargin = width < 1024 && route === "/privacy/" ? rootSize : 0;
          expect(spacing.above, "title-to-content gap").toBeCloseTo(expected + topMargin, 0);
          expect(spacing.below, "content-to-footer gap").toBeCloseTo(expected + bottomMargin, 0);
          expect(spacing.overflow, `no horizontal overflow: ${spacing.overflowing.join("; ")}`).toBeLessThanOrEqual(1);
          if (route === "/contact/") {
            const columns = page.locator(".split-layout > *");
            const first = (await columns.nth(0).boundingBox())!;
            const second = (await columns.nth(1).boundingBox())!;
            if (width < (enlarged ? 1536 : 768)) {
              expect(second.x).toBeCloseTo(first.x, 0);
              expect(second.y).toBeGreaterThan(first.y + first.height);
            } else {
              expect(second.y).toBeCloseTo(first.y, 0);
              expect(second.x).toBeGreaterThan(first.x + first.width);
            }
          }
          if (route === "/about/") {
            // Exercise long body words independently of the platform's font metrics.
            if (enlarged) await page.locator(".impact-callout > p:not(.eyebrow)").first().evaluate(element => {
              element.textContent = "Community opportunities and contributions.";
              (element as HTMLElement).style.letterSpacing = "0.06em";
            });
            for (const paragraph of await page.locator(".impact-callout > p:not(:has(a))").all()) {
              const bounds = await paragraph.evaluate(element => {
                const range = document.createRange();
                range.selectNodeContents(element);
                const column = element.getBoundingClientRect();
                return { textRight: range.getBoundingClientRect().right, columnRight: column.right };
              });
              expect(bounds.textRight, "impact copy wraps inside its own column").toBeLessThanOrEqual(bounds.columnRight + 1);
            }
            for (const heading of await page.locator(".pillar h3").all()) {
              const bounds = await heading.evaluate(element => {
                const range = document.createRange();
                range.selectNodeContents(element);
                return { textRight: range.getBoundingClientRect().right, columnRight: element.getBoundingClientRect().right };
              });
              expect(bounds.textRight).toBeLessThanOrEqual(bounds.columnRight + 1);
            }
          }
        });
      }
    }
  }
}

test("What's On retains its existing desktop section spacing", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/whats-on/");
  await expect(page.locator(".content-section--desktop-snug")).toHaveCount(0);
  for (const section of await page.locator(".content-section:visible").all()) {
    await expect(section).toHaveCSS("padding-top", "72px");
    await expect(section).toHaveCSS("padding-bottom", "72px");
  }
});
