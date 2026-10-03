import { expect, test } from "@playwright/test";

test.describe("Fireworks return link", () => {
  test("appears when the visitor arrives from What's On", async ({ page }) => {
    await page.goto("/whats-on/");
    await page.getByRole("link", { name: /Fireworks on the Field/ }).click();

    await expect(page).toHaveURL(/\/events\/fireworks-2026\/$/);
    const back = page.getByRole("link", { name: /Back to What's On/ });
    await expect(back).toBeVisible();

    await back.click();
    await expect(page).toHaveURL(/\/whats-on\/$/);
  });

  test("stays hidden when the visitor arrives directly", async ({ page }) => {
    await page.goto("/events/fireworks-2026/");

    await expect(page.getByRole("heading", { level: 1, name: "Fireworks on the Field" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to What's On/ })).toBeHidden();
  });

  test("stays hidden when the visitor arrives from another page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Plan for Fireworks" }).click();

    await expect(page).toHaveURL(/\/events\/fireworks-2026\/$/);
    await expect(page.getByRole("link", { name: /Back to What's On/ })).toBeHidden();
  });
});
