import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/whats-on/",
  "/events/fireworks-2026/",
  "/uniform/",
  "/committee/",
  "/newsletter/",
  "/reps/",
  "/contact/",
  "/privacy/",
  "/404.html",
];

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

test("expanded newsletter archive has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/newsletter/");
  await page.getByRole("button", { name: /Read more/ }).click();
  await expect(page.getByRole("button", { name: /Show less/ })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include(".newsletter-summary")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const violations = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical"
  );

  expect(violations).toEqual([]);
});
