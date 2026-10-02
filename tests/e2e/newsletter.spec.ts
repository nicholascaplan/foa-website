import { expect, test } from "@playwright/test";

test.describe("Newsletter archive expansion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/newsletter/");
  });

  test("shows a preview and hides the rest until Read more is used", async ({ page }) => {
    await expect(page.getByText("Welcome back! We hope you’ve all had a wonderful summer")).toBeVisible();
    await expect(page.getByText("Call for Event Leads")).toBeHidden();
    await expect(page.getByRole("button", { name: /Read more/ })).toHaveAttribute("aria-expanded", "false");
  });

  test("expands and collapses the full newsletter in place", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /Read more/ });
    await trigger.click();

    await expect(page.getByText("Call for Event Leads")).toBeVisible();
    const expanded = page.getByRole("button", { name: /Show less/ });
    await expect(expanded).toHaveAttribute("aria-expanded", "true");

    await expanded.click();
    await expect(page.getByText("Call for Event Leads")).toBeHidden();
    await expect(page.getByRole("button", { name: /Read more/ })).toHaveAttribute("aria-expanded", "false");
  });
});
