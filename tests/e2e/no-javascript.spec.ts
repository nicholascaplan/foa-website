import { expect, test } from "@playwright/test";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a parent can still find the Fireworks details from What's On", async ({ page }) => {
    await page.goto("/whats-on/");

    const fireworks = page.getByRole("link", { name: /Fireworks on the Field/ });
    await expect(fireworks).toBeVisible();
    await fireworks.click();

    await expect(page.getByRole("heading", { level: 1, name: "Fireworks on the Field" })).toBeVisible();
    await expect(page.getByText("16:30-18:30")).toBeVisible();
  });

  test("the homepage still shows a featured event and links to the task routes", async ({ page }) => {
    await page.goto("/");

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 2, name: "Fireworks on the Field" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Welcome Tea" })).toHaveCount(0);
    await expect(main.getByRole("link", { name: "Buy or donate uniform" })).toBeVisible();
    await expect(main.getByRole("link", { name: "Get involved Roles, meetings" })).toBeVisible();
  });

  test("the primary routes are reachable at a mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const footer = page.getByRole("navigation", { name: "Footer navigation" });
    for (const name of ["What's On", "Get Involved", "Uniform"]) {
      await expect(footer.getByRole("link", { name })).toBeVisible();
    }
  });
});
