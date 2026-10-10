import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { routes } from "./routes";

test("every public page in the build is covered by the accessibility scans", () => {
  expect(routes.length).toBeGreaterThanOrEqual(15);
  expect(routes).toContain("/");
  expect(routes).toContain("/404.html");
});

for (const route of routes) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const violations = results.violations.filter(({ impact }) =>
      impact === "serious" || impact === "critical"
    );

    expect(violations).toEqual([]);
  });
}

test("expanded newsletters have no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/newsletter/");
  for (const id of ["newsletter-latest-more", "newsletter-back-to-school-2026-more"]) {
    await page.locator(`[aria-controls="${id}"]`).click();
  }
  await expect(page.getByRole("button", { name: /Show less/ })).toHaveCount(2);
  await page.waitForFunction(() => document.getAnimations().length === 0);

  const results = await new AxeBuilder({ page })
    .include(".newsletter-board")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const violations = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical"
  );

  expect(violations).toEqual([]);
});

test.describe("mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const scan = (page: Page) =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
  const seriousOrCritical = (results: Awaited<ReturnType<typeof scan>>) =>
    results.violations.filter(({ impact }) => impact === "serious" || impact === "critical");

  for (const route of routes) {
    test(`${route} has no serious or critical violations and does not scroll sideways`, async ({ page }) => {
      await page.goto(route);

      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
      const menuButton = page.getByRole("button", { name: "Open menu" });
      await expect(menuButton).toBeVisible();
      const target = await menuButton.boundingBox();
      expect(target).not.toBeNull();
      expect(target!.width).toBeGreaterThanOrEqual(44);
      expect(target!.height).toBeGreaterThanOrEqual(44);
      expect(seriousOrCritical(await scan(page))).toEqual([]);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("the open mobile menu has no serious or critical violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

    expect(seriousOrCritical(await scan(page))).toEqual([]);
  });
});
