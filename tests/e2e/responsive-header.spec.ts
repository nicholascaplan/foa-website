import { expect, test } from "@playwright/test";

test("enlarged homepage text keeps the menu and hero actions inside a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });

  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )).toBeLessThanOrEqual(0);
  // The hero clips overflow, so document width alone cannot catch spilling actions.
  expect(await page.locator(".menu-toggle, .hero-actions .button").evaluateAll((elements) =>
    elements.every((element) => {
      const { left, right, width, height } = element.getBoundingClientRect();
      return left >= 0 && right <= window.innerWidth && width >= 44 && height >= 44;
    }),
  )).toBe(true);
});
