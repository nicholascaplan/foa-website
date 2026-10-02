import { expect, test } from "@playwright/test";

test.describe("Newsletter expansion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/newsletter/");
  });

  test("the latest newsletter preview shows the opening sections", async ({ page }) => {
    await expect(page.getByText("A Heartfelt Thank You to Sarah and Katy")).toBeVisible();
  });

  for (const [name, bodyId, hiddenText] of [
    ["latest", "newsletter-latest-more", "Fireworks on the Field"],
    ["archive", "newsletter-back-to-school-2026-more", "Call for Event Leads"],
  ]) {
    test(`${name} newsletter hides the rest until Read more is used`, async ({ page }) => {
      await expect(page.locator(`#${bodyId}`)).toBeHidden();
      await expect(page.locator(`[aria-controls="${bodyId}"]`)).toHaveAttribute("aria-expanded", "false");
    });

    test(`${name} newsletter expands and collapses in place`, async ({ page }) => {
      const more = page.locator(`#${bodyId}`);
      const trigger = page.locator(`[aria-controls="${bodyId}"]`);
      await trigger.click();

      await expect(more.getByText(hiddenText).first()).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(trigger).toContainText("Show less");

      await trigger.click();
      await expect(more).toBeHidden();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toContainText("Read more");
    });
  }
});
