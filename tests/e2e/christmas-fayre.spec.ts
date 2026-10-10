import { expect, test, type Page } from "@playwright/test";

const route = "/events/christmas-fayre-2026/";

const shown = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).display !== "none").length);

test.describe("Christmas Fayre decoration", () => {
  test("shows every bauble and snowflake on a desktop-width screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);

    expect(await shown(page, ".xmas-baubles li")).toBe(20);
    expect(await shown(page, ".xmas-snow i")).toBe(28);
  });

  for (const width of [320, 390, 767]) {
    test(`is reduced to 7 hangers and 14 flakes at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(route);

      expect(await shown(page, ".xmas-baubles li")).toBe(7);
      expect(await shown(page, ".xmas-snow i")).toBe(14);
    });
  }

  test("is hidden from assistive technology and never takes focus", async ({ page }) => {
    await page.goto(route);

    await expect(page.locator(".xmas-baubles")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".xmas-snow")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".xmas-baubles a, .xmas-baubles button, .xmas-snow a, .xmas-snow button")).toHaveCount(0);
  });

  test("animates by default", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);

    await expect(page.locator(".xmas-snow i").first()).not.toHaveCSS("animation-name", "none");
    await expect(page.locator(".xmas-baubles__item").first()).not.toHaveCSS("animation-name", "none");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("snowflakes and baubles stay still", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(route);

      const animated = await page.evaluate(() =>
        [...document.querySelectorAll(".xmas-snow i, .xmas-baubles__item")].filter((node) => {
          const style = getComputedStyle(node);
          const before = getComputedStyle(node, "::before");
          return style.animationName !== "none" || before.animationName !== "none";
        }).length
      );
      expect(animated).toBe(0);
      await expect(page.getByRole("heading", { level: 1, name: "Christmas Fayre" })).toBeVisible();
    });
  });
});

test.describe("Christmas Fayre layout", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("keeps the sign-up button and help areas reachable by keyboard", async ({ page }) => {
    await page.goto(route);

    const button = page.getByRole("link", { name: /Email the Fayre team/ });
    await expect(button).toHaveAttribute("href", /^mailto:.+\?subject=Helping%20at%20the%20Christmas%20Fayre$/);
    await button.focus();
    await expect(button).toBeFocused();
    await expect(page.locator(".xmas-area")).toHaveCount(7);
  });
});

test.describe("Christmas Fayre without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the helper call, help areas and contact route are all present", async ({ page }) => {
    await page.goto(route);

    await expect(page.getByRole("heading", { level: 1, name: "Christmas Fayre" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Where we need friendly faces" })).toBeVisible();
    await expect(page.locator(".xmas-area")).toHaveCount(7);
    await expect(page.getByRole("heading", { name: "Good to know" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Email the Fayre team/ })).toBeVisible();
  });
});
