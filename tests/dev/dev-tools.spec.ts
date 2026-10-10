import { expect, test } from "@playwright/test";

test("homepage phone preview sits beside the burger outside the menu and stays fixed", async ({ page }) => {
  for (const width of [320, 390, 768, 1023]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const phone = page.getByRole("button", { name: "Phone preview size" });
    const burger = page.getByRole("button", { name: "Open menu" });
    await expect(phone).toBeVisible();
    await expect(page.locator(".mobile-menu .dev-tools")).toHaveCount(0);
    const before = await phone.boundingBox();
    const menuBox = await burger.boundingBox();
    expect(before!.x + before!.width).toBeLessThan(menuBox!.x);
    expect(Math.abs(before!.y + before!.height / 2 - menuBox!.y - menuBox!.height / 2)).toBeLessThan(1);
    const layout = await page.evaluate(() => {
      const copy = document.querySelector(".home-introduction p")!.getBoundingClientRect();
      const tools = document.querySelector(".home-preview-tools")!.getBoundingClientRect();
      return { copyRight: copy.right, toolsLeft: tools.left, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect(layout.copyRight).toBeLessThanOrEqual(layout.toolsLeft);
    expect(layout.overflow).toBeLessThanOrEqual(0);
    await phone.click();
    await expect(page.getByRole("button", { name: "Small phone (360px)" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(phone).toBeInViewport();
    await expect(burger).toBeInViewport();
    expect((await phone.boundingBox())!.y).toBe(before!.y);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Phone preview size" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Mobile preview", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset cookie consent" })).toHaveCount(0);
});

test("desktop has one phone icon that opens a medium preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/uniform/");

  await expect(page.getByRole("group", { name: "Phone preview size" })).toBeHidden();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Mobile preview", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/127\.0\.0\.1:4348\//);
  await expect.poll(() => popup.evaluate(() => window.innerWidth)).toBe(390);
  await popup.close();
});

test("phone size controls resize the preview itself and follow its viewport", async ({ page }) => {
  await page.addInitScript(() => {
    window.name = "foa-mobile-preview";
    // Capture resizing without relying on headless Chrome's native window support.
    window.resizeTo = (width, height) => {
      document.documentElement.dataset.previewResize = `${width},${height}`;
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/uniform/");
  const menuToggle = page.getByRole("button", { name: "Phone preview size" });
  const sizes = page.getByRole("group", { name: "Phone preview size" });
  await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  await expect(sizes).toBeHidden();
  for (const width of [360, 390, 430]) {
    const button = page.getByRole("button", { name: new RegExp(`phone \\(${width}px\\)`) });
    await menuToggle.focus();
    await page.keyboard.press("Space");
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    await expect(button).toBeVisible();
    await button.focus();
    await page.keyboard.press("Space");
    await expect(sizes).toBeHidden();
    const expected = await page.evaluate((targetWidth) => `${targetWidth + Math.max(0, outerWidth - innerWidth)},${innerHeight + Math.max(0, outerHeight - innerHeight)}`, width);
    await expect(page.locator("html")).toHaveAttribute("data-preview-resize", expected);
    await page.setViewportSize({ width, height: 844 });
    await menuToggle.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(sizes).toBeHidden();
    await expect(menuToggle).toBeFocused();
    await expect(page).toHaveURL(/\/uniform\/$/);
  }
  await page.reload();
  await menuToggle.click();
  await expect(page.getByRole("button", { name: "Large phone (430px)" })).toHaveAttribute("aria-pressed", "true");
});

test("desktop tools sit between the home link and navigation without overlaps", async ({ page }) => {
  for (const width of [768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/uniform/");
    const layout = await page.evaluate(() => {
      const brand = document.querySelector(".brand")!;
      const tools = document.querySelector(".dev-tools")!;
      const nav = document.querySelector(".desktop-nav")!;
      const rectangles = [brand, tools, nav].map((element) => element.getBoundingClientRect()).filter((r) => r.width && r.height);
      return {
        order: Boolean(brand.compareDocumentPosition(tools) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(tools.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING),
        overlaps: rectangles.some((a, i) => rectangles.slice(i + 1).some((b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        position: getComputedStyle(tools).position,
        themeToggleCount: document.querySelectorAll("[data-theme-toggle]").length,
        headerToggleOnBrandRow: (() => {
          const toggle = document.querySelector(".site-header .header-theme-toggle [data-theme-toggle]")!.getBoundingClientRect();
          const home = brand.getBoundingClientRect();
          return toggle.top < home.bottom && toggle.bottom > home.top;
        })(),
      };
    });
    expect(layout.order).toBe(true);
    expect(layout.overlaps, `${width}px header`).toBe(false);
    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.themeToggleCount).toBe(2);
    expect(layout.headerToggleOnBrandRow, `${width}px header theme toggle row`).toBe(true);
    expect(layout.position).toBe("static");
  }
});
