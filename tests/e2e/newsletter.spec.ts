import { expect, test } from "@playwright/test";

test.describe("Newsletter expansion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/newsletter/");
  });

  test("the latest newsletter preview shows the opening sections", async ({ page }) => {
    await expect(page.locator(".newsletter-issue").getByText("Fireworks on the Field: Thursday 5th November")).toBeVisible();
    await expect(page.locator(".newsletter-issue").getByText("Christmas Fayre: Saturday 5th December")).toBeVisible();
  });

  test("reduced motion expands immediately and restores the peek on collapse", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const more = page.locator("#newsletter-latest-more");
    const peek = page.locator(".newsletter-issue [data-newsletter-peek]");
    const trigger = page.locator('[aria-controls="newsletter-latest-more"]');
    await trigger.click();
    await expect(more).toBeVisible();
    await expect(peek).toBeHidden();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await trigger.click();
    await expect(more).toBeHidden();
    await expect(peek).toBeVisible();
    await expect(trigger).toBeFocused();
  });

  for (const width of [390, 1440]) {
    test(`newsletter peeks fill a five-line fade at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const peek of await page.locator("[data-newsletter-peek]").all()) {
        const sizes = await peek.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            height: element.getBoundingClientRect().height,
            contentHeight: element.scrollHeight,
            expectedHeight: 5 * parseFloat(style.lineHeight) + 3 * parseFloat(getComputedStyle(document.documentElement).fontSize),
          };
        });
        expect(sizes.height).toBeCloseTo(sizes.expectedHeight, 0);
        expect(sizes.contentHeight).toBeGreaterThan(sizes.height);
      }
    });

    test(`newsletter introductions match body text size at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const sheet of await page.locator(".newsletter-sheet").all()) {
        const introSize = await sheet.locator(".newsletter-intro").evaluate((element) => getComputedStyle(element).fontSize);
        const bodySize = await sheet.locator(".newsletter-summary-section p:not(.newsletter-intro)").first().evaluate((element) => getComputedStyle(element).fontSize);
        expect(introSize).toBe(bodySize);
      }
    });

    test(`archived newsletter sheets have a visible gap at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const sheets = page.locator(".newsletter-summary.newsletter-sheet");
      const first = await sheets.nth(0).boundingBox();
      const second = await sheets.nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.y - (first!.y + first!.height)).toBeGreaterThanOrEqual(24);
    });
  }

  for (const [name, bodyId, hiddenText] of [
    ["latest", "newsletter-latest-more", "Santa’s Grotto"],
    ["previous issue", "newsletter-autumn-term-2026-more", "A Heartfelt Thank You to Sarah and Katy"],
    ["archive", "newsletter-back-to-school-2026-more", "Call for Event Leads"],
  ]) {
    test(`${name} newsletter hides the rest until Read more is used`, async ({ page }) => {
      await expect(page.locator(`#${bodyId}`)).toBeHidden();
      const trigger = page.locator(`[aria-controls="${bodyId}"]`);
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toContainText("Read the full newsletter");
      const peek = page.locator(`#${bodyId}`).locator("xpath=preceding-sibling::div[@data-newsletter-peek]");
      await expect(peek).toBeVisible();
      await expect(peek).toHaveAttribute("aria-hidden", "true");
      await expect(peek).toHaveAttribute("inert", "");
    });

    test(`${name} newsletter expands and collapses in place`, async ({ page }) => {
      const more = page.locator(`#${bodyId}`);
      const trigger = page.locator(`[aria-controls="${bodyId}"]`);
      const peek = more.locator("xpath=preceding-sibling::div[@data-newsletter-peek]");
      await trigger.click();

      await expect(more.getByText(hiddenText).first()).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(trigger).toContainText("Show less");
      await expect(peek).toBeHidden();

      await trigger.click();
      await expect(more).toBeHidden();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toContainText("Read the full newsletter");
      await expect(peek).toBeVisible();
    });
  }
});
