import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Routes are derived from src/pages, so a new page is covered automatically.
// Add a route to `excluded` only with a reason.
const excluded = new Set(["playground.html.ts", "robots.txt.ts"]); // not public pages

const discoverRoutes = (directory = "src/pages", prefix = ""): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return discoverRoutes(join(directory, entry.name), `${prefix}/${entry.name}`);
    if (!entry.name.endsWith(".astro") || excluded.has(entry.name)) return [];
    const name = entry.name.replace(/\.astro$/, "");
    if (name === "index") return [`${prefix}/`];
    return [name === "404" ? "/404.html" : `${prefix}/${name}/`];
  });

const routes = discoverRoutes().sort();

// Colour transitions make computed styles lag behind a theme switch, which skews contrast scans.
const freezeTransitions = (page: Page) => page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" });

const key = "foa-dev-night-mode";
const toggleName = "Night Mode (local preview)";

test("every page in src/pages is covered by the Night Mode scans", () => {
  expect(routes.length).toBeGreaterThanOrEqual(15);
  for (const route of ["/", "/fundraising/", "/fireworks-volunteering/", "/events/christmas-fayre-2026/", "/events/fireworks-2026/", "/about/", "/whats-on/", "/404.html"]) {
    expect(routes).toContain(route);
  }
});

test("manual choice is keyboard accessible, remembered and independent of consent", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  const response = await page.goto("/");
  const html = await response!.text();
  expect(html.indexOf("data-dev-night-initializer")).toBeLessThan(html.indexOf("<body"));
  const toggle = page.getByRole("button", { name: toggleName });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toBeFocused();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("foa-cookie-preferences"))).toBeNull();
  await expect(page.locator("[data-google-analytics]")).toHaveCount(0);

  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Uniform" }).click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe("day");
});

test("blocked storage falls back safely but still allows switching", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: toggleName });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("invalid saved values do not enable Night Mode", async ({ page }) => {
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, "unexpected"), key);
  await page.goto("/");
  await expect(page.getByRole("button", { name: toggleName })).toHaveAttribute("aria-pressed", "false");
});

test("desktop has one phone icon that opens a medium preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

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
  for (const width of [360, 390, 430]) {
    const button = page.getByRole("button", { name: new RegExp(`phone preview \\(${width}px\\)`) });
    await expect(button).toBeVisible();
    await button.focus();
    await page.keyboard.press("Space");
    const expected = await page.evaluate((targetWidth) => `${targetWidth + Math.max(0, outerWidth - innerWidth)},${innerHeight + Math.max(0, outerHeight - innerHeight)}`, width);
    await expect(page.locator("html")).toHaveAttribute("data-preview-resize", expected);
    await page.setViewportSize({ width, height: 844 });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/\/uniform\/$/);
  }
  await page.reload();
  await expect(page.getByRole("button", { name: "Large phone preview (430px)" })).toHaveAttribute("aria-pressed", "true");
});

for (const width of [320, 390, 1440]) {
  test(`${width}px: all routes remain readable and fit in both modes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(route === "/404.html" ? 404 : 200);
      const toggle = page.getByRole("button", { name: toggleName });
      await expect(toggle).toBeVisible();
      // Fireworks and Christmas pages keep their own night-sky theme in both modes.
      const themed = (await page.locator("body.fw-theme, body.xmas-theme").count()) > 0;
      let dayBackground = "";
      for (const night of [false, true]) {
        if (await toggle.getAttribute("aria-pressed") !== String(night)) await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", String(night));
        if (!night) dayBackground = await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);
        const plainBackground = night ? "rgb(23, 36, 29)" : "rgb(246, 241, 231)";
        await expect(page.locator("body")).toHaveCSS("background-color", themed ? dayBackground : plainBackground);
        const sizes = await page.evaluate(() => {
          const header = document.querySelector(".site-header")!.getBoundingClientRect();
          const toggle = [...document.querySelectorAll<HTMLElement>("[data-dev-night-mode]")].find((button) => button.getBoundingClientRect().width > 0)!.getBoundingClientRect();
          const images = [...document.querySelectorAll<HTMLImageElement>("img")];
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            target: Math.min(toggle.width, toggle.height),
            toggleInsideHeader: toggle.top >= header.top && toggle.bottom <= header.bottom,
            alteredImages: images.filter((image) => getComputedStyle(image).filter !== "none").length,
          };
        });
        expect(sizes.overflow, `${route} ${night ? "night" : "day"}`).toBeLessThanOrEqual(0);
        expect(sizes.target).toBeGreaterThanOrEqual(44);
        expect(sizes.toggleInsideHeader).toBe(true);
        expect(sizes.alteredImages).toBe(0);
      }
    }
  });
}

test("desktop tools sit between the home link and navigation without overlaps", async ({ page }) => {
  for (const width of [768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
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
      };
    });
    expect(layout.order).toBe(true);
    expect(layout.overlaps, `${width}px header`).toBe(false);
    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.position).toBe("static");
  }
});

for (const width of [390, 1440]) {
  for (const route of routes) {
    test(`${width}px: ${route} Night Mode accessibility`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((storageKey) => localStorage.setItem(storageKey, "night"), key);
      await page.goto(route);
      await freezeTransitions(page);
      await expect(page.getByRole("button", { name: toggleName })).toHaveAttribute("aria-pressed", "true");
      if (route === "/newsletter/") {
        for (const button of await page.getByRole("button", { name: /Read more/ }).all()) await button.click();
        await page.waitForFunction(() => document.getAnimations().length === 0);
        await expect(page.locator(".newsletter-sheet").first()).toHaveCSS("color", "rgb(25, 49, 39)");
        await expect(page.locator(".newsletter-sheet").first()).toHaveCSS("background-color", "rgb(231, 222, 204)");
      }
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
    });
  }
}

test("mobile menu and cookie controls remain accessible at enlarged scale", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: toggleName }).click();
  await page.getByRole("button", { name: "Reject analytics cookies" }).click();
  await page.getByRole("button", { name: "Open menu" }).click();
  const scan = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect((await scan()).violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Cookie preferences" }).click();
  await expect(page.locator("[data-cookie-banner]")).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  expect((await scan()).violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
});

test("patched amber and heading accents use the Night Mode ink", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, "night"), key);
  await page.goto("/about/");
  await freezeTransitions(page);
  for (const number of await page.locator(".pillar-number").all()) await expect(number).toHaveCSS("color", "rgb(244, 211, 157)");
  await page.goto("/get-involved/");
  await freezeTransitions(page);
  const badge = page.locator(".involved-badge").first();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveCSS("color", "rgb(244, 211, 157)");
  await expect(badge).toHaveCSS("background-color", "rgb(73, 56, 30)");
});

test("pages with their own parchment or night-sky theme look the same in both modes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const snapshot = () => page.evaluate(() => {
    const roots = document.querySelectorAll(".event-feature--poster, .fw-event, .fw-vol, .xmas-frame");
    return [...roots].flatMap((root) => [root, ...root.querySelectorAll("*")]).filter((element) => !element.closest(".visually-hidden")).map((element, index) => {
      const style = getComputedStyle(element);
      const ownText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      return [index, element.tagName, element.className, ownText ? style.color : "", style.backgroundColor, style.backgroundImage, style.borderTopWidth === "0px" ? "" : style.borderColor, style.boxShadow].join("|");
    });
  });
  for (const route of ["/", "/events/fireworks-2026/", "/events/christmas-fayre-2026/", "/fireworks-volunteering/"]) {
    await page.goto(route);
    await freezeTransitions(page);
    const toggle = page.getByRole("button", { name: toggleName });
    const day = await snapshot();
    expect(day.length, route).toBeGreaterThan(10);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await snapshot(), route).toEqual(day);
    await toggle.click();
  }
});

test("mobile menu keeps visible dividers and readable links in Night Mode", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, "night"), key);
  await page.goto("/");
  await freezeTransitions(page);
  await page.getByRole("button", { name: "Reject analytics cookies" }).click();
  await page.getByRole("button", { name: "Open menu" }).click();
  const link = page.locator(".mobile-menu nav a:not(.button)").first();
  await expect(link).toBeVisible();
  await expect(link).toHaveCSS("border-bottom-color", "rgb(101, 120, 107)");
  await expect(link).toHaveCSS("color", "rgb(238, 232, 220)");
});
