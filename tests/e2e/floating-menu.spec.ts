import { expect, test } from "@playwright/test";
import { routes } from "./routes";

for (const width of [320, 390, 768, 1023]) {
  test(`${width}px: every page has no header and a clear, fixed mobile burger`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of routes) {
      await page.goto(route);
      const header = page.locator(".site-header");
      const trigger = page.getByRole("button", { name: "Open menu" });
      await expect(header, route).toBeHidden();
      await expect(trigger, route).toBeVisible();
      await expect(trigger).toHaveCSS("position", "fixed");
      const before = await trigger.boundingBox();
      expect(before!.width).toBe(48);
      expect(before!.height).toBe(48);
      expect(before!.x + before!.width).toBeLessThanOrEqual(width);
      if (route === "/") {
        await expect(page.locator(".mobile-home-introduction")).toBeVisible();
        expect((await page.locator(".mobile-home-introduction img").boundingBox())!.width).toBeGreaterThanOrEqual(84);
      }
      const panel = page.locator(".view-hero");
      if (await panel.count()) {
        expect((await panel.boundingBox())!.y, route).toBe(16);
        const eyebrow = await panel.locator(".eyebrow").boundingBox();
        expect(eyebrow!.y, `${route}: eyebrow should use the space beside the controls`).toBe(40);
      }
      const stage = page.locator(".fw-stage, .xmas-stage");
      if (await stage.count()) {
        expect((await stage.boundingBox())!.y, `${route}: event artwork must reach the page top`).toBe(0);
        await expect(page.locator("#main-content")).toHaveCSS("padding-top", "0px");
        await expect(stage).toHaveCSS("padding-top", route === "/fireworks-volunteering/" ? "64px" : "0px");
      }
      const overlapping = await page.locator("main h1, main h2, main p, main a, main button").evaluateAll((elements) => {
        const burger = document.querySelector(".menu-toggle")!.getBoundingClientRect();
        return elements.filter((element) => {
          const r = element.getBoundingClientRect();
          const right = r.right - parseFloat(getComputedStyle(element).paddingRight);
          return r.width && r.height && r.left < burger.right && right > burger.left && r.top < burger.bottom && r.bottom > burger.top;
        }).map((element) => element.textContent?.trim());
      });
      expect(overlapping, `${route}: opening copy must not sit beneath the burger`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), route).toBeLessThanOrEqual(0);
      await page.evaluate(() => window.scrollTo(0, 800));
      await expect(trigger).toBeInViewport();
      expect((await trigger.boundingBox())!.y, route).toBe(before!.y);
      const scroll = await page.evaluate(() => scrollY);
      await trigger.click();
      await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
      await expect(page.locator(".mobile-menu [data-theme-toggle]")).toBeVisible();
      const focusable = page.locator("[data-mobile-menu] a[href], [data-mobile-menu] button:not([disabled])");
      await focusable.last().focus();
      await page.keyboard.press("Tab");
      await expect(focusable.first()).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(focusable.last()).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => scrollY), route).toBe(scroll);
      await trigger.click();
      await page.locator(".mobile-menu-home").click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("body")).toHaveClass("homepage");
    }
  });
}

for (const width of [1024, 1440]) {
  test(`${width}px: all pages use the homepage desktop navigation, with no burger after scrolling`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator(".site-header"), route).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" }), route).toBeVisible();
      await expect(page.locator(".menu-toggle"), route).toBeHidden();
      const introduction = await page.locator(".site-header .home-introduction").boundingBox();
      const navigation = await page.locator(".desktop-nav").boundingBox();
      expect(navigation!.x, route).toBeGreaterThanOrEqual(introduction!.x + introduction!.width);
      expect(navigation!.y, route).toBeGreaterThanOrEqual(introduction!.y);
      expect(navigation!.y + navigation!.height, route).toBeLessThanOrEqual(introduction!.y + introduction!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), route).toBeLessThanOrEqual(0);
      await page.evaluate(() => window.scrollTo(0, 800));
      await expect(page.locator(".menu-toggle"), route).toBeHidden();
    }
  });
}
