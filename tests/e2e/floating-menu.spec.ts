import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const focusDiagnostic = async (page: import("@playwright/test").Page) => {
  const state = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    const menu = document.querySelector<HTMLElement>("[data-mobile-menu]");
    const close = document.querySelector<HTMLButtonElement>("[data-menu-close]");
    return {
      activeElement: active && {
        tag: active.tagName,
        className: typeof active.className === "string" ? active.className : "",
        label: active.getAttribute("aria-label"),
      },
      menu: menu && {
        inert: menu.inert,
        ariaHidden: menu.getAttribute("aria-hidden"),
        visibility: getComputedStyle(menu).visibility,
      },
      closeButton: close && {
        disabled: close.disabled,
        tabIndex: close.tabIndex,
      },
    };
  });
  return `Menu open focus diagnostics: ${JSON.stringify(state)}`;
};

for (const viewport of viewports) {
  test(`${viewport.name}: the homepage starts without a header or recruitment strip and has a fixed menu`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator(".site-header")).toHaveCount(0);
    await expect(page.locator(".notice-strip")).toHaveCount(0);
    await expect(page.locator(".menu-toggle")).toHaveCount(1);
    const trigger = page.locator(".menu-toggle");
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveCSS("position", "fixed");

    const triggerStyle = await trigger.evaluate((element) => {
      const { width, height, top, left, right } = element.getBoundingClientRect();
      const background = getComputedStyle(element).backgroundColor;
      const alpha = background.match(/rgba\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/)?.[1];
      return { width, height, top, left, right, opaque: alpha === undefined || Number(alpha) === 1 };
    });
    expect(triggerStyle.width).toBe(48);
    expect(triggerStyle.height).toBe(48);
    expect(triggerStyle.top).toBeGreaterThanOrEqual(0);
    expect(triggerStyle.top).toBeLessThan(96);
    expect(triggerStyle.left).toBeGreaterThan(viewport.width / 2);
    expect(triggerStyle.right).toBeLessThanOrEqual(viewport.width);
    expect(triggerStyle.opaque).toBe(true);
    await expect(page.locator(".footer-brand-home")).toHaveAttribute("href", "/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await trigger.click();
    await expect(page.getByRole("button", { name: "Close menu" }), await focusDiagnostic(page)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test(`${viewport.name}: an interior page header scrolls away while the menu remains fixed`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/get-involved/");

    const header = page.locator(".site-header");
    const trigger = page.locator(".menu-toggle");
    const headerThemeToggle = page.locator(".site-header [data-theme-toggle]");
    const menuThemeToggle = page.locator(".mobile-menu [data-theme-toggle]");
    await expect(trigger).toHaveCount(1);
    await expect(page.locator("[data-theme-toggle]")).toHaveCount(2);
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS("backdrop-filter", "none");
    if (viewport.width < 768) {
      await expect(headerThemeToggle).toBeHidden();
    } else {
      await expect(headerThemeToggle).toBeVisible();
    }
    await expect(menuThemeToggle).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 800));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
    await expect.poll(() => header.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    if (viewport.width >= 768) {
      await expect.poll(() => headerThemeToggle.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    }
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveCSS("position", "fixed");

    const triggerStyle = await trigger.evaluate((element) => {
      const { width, height, top, left, right } = element.getBoundingClientRect();
      const background = getComputedStyle(element).backgroundColor;
      const alpha = background.match(/rgba\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/)?.[1];
      return { width, height, top, left, right, opaque: alpha === undefined || Number(alpha) === 1 };
    });
    expect(triggerStyle.width).toBe(48);
    expect(triggerStyle.height).toBe(48);
    expect(triggerStyle.top).toBeGreaterThanOrEqual(0);
    expect(triggerStyle.top).toBeLessThan(96);
    expect(triggerStyle.left).toBeGreaterThan(viewport.width / 2);
    expect(triggerStyle.right).toBeLessThanOrEqual(viewport.width);
    expect(triggerStyle.opaque).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

    await page.evaluate(() => window.scrollTo(0, window.scrollY - 40));
    await expect.poll(() => header.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    await expect(trigger).toHaveCSS("position", "fixed");

    const retainedScroll = await page.evaluate(() => window.scrollY);
    await trigger.click();
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("aria-hidden", "false");
    if (viewport.width < 768) {
      await expect(menuThemeToggle).toBeVisible();
      await expect(headerThemeToggle).toBeHidden();
    } else {
      await expect(menuThemeToggle).toBeHidden();
      await expect(headerThemeToggle).toBeVisible();
    }
    expect(await page.evaluate(() => window.scrollY)).toBe(retainedScroll);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("aria-hidden", "true");
    expect(await page.evaluate(() => window.scrollY)).toBe(retainedScroll);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect.poll(() => header.evaluate((element) => element.getBoundingClientRect().top)).toBe(0);
    await expect(header).toBeVisible();
  });

  test(`${viewport.name}: menu opening moves focus inside, traps Tab and Escape restores the trigger`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/get-involved/");

    const trigger = page.locator(".menu-toggle");
    const closeButton = page.getByRole("button", { name: "Close menu" });
    const focusable = page.locator("[data-mobile-menu] a[href], [data-mobile-menu] button:not([disabled])");
    await page.evaluate(() => window.scrollTo(0, 800));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
    await trigger.click();
    await expect(closeButton, await focusDiagnostic(page)).toBeFocused();
    expect(await focusable.count()).toBeGreaterThan(1);

    await focusable.last().focus();
    await page.keyboard.press("Tab");
    await expect(focusable.first()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(focusable.last()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("aria-hidden", "true");
    await expect(trigger).toBeFocused();
  });
}
