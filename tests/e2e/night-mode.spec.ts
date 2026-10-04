import { expect, test } from "@playwright/test";

test("production ignores a local Night Mode preference and a dark OS preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("foa-dev-night-mode", "night"));
  for (const route of ["/", "/newsletter/", "/uniform/"]) {
    await page.goto(route);
    await expect(page.locator("[data-dev-night-mode], [data-dev-night-initializer], [data-dev-night-styles]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-dev-theme", "night");
    await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(246, 241, 231)");
  }
});
