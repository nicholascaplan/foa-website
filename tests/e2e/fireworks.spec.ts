import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`the immersive switch stays clear of the summary at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/events/fireworks-2026/");
    const toggle = page.getByRole("switch", { name: "Immersive", exact: true });
    for (const immersive of [false, true]) {
      if (immersive) await toggle.click();
      const layout = await page.evaluate(async (immersive) => {
        // Resolve the new theme first so its lazily loaded font is included in ready.
        document.querySelector("h1")!.getBoundingClientRect();
        await document.fonts.ready;
        // Read all boxes together: separate RPCs can straddle a font-swap layout.
        const box = (selector: string) => {
          const rect = document.querySelector(selector)!.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        };
        return {
          button: box("[data-fw-mode]"),
          summary: box(".event-summary"),
          title: box("h1"),
          sponsor: box(".event-hero-sponsor"),
          rollTop: immersive ? parseFloat(getComputedStyle(document.querySelector(".event-summary")!, "::before").top) : 0,
          noOverflow: document.documentElement.scrollWidth <= innerWidth,
        };
      }, immersive);
      const { button, summary, title, sponsor, rollTop } = layout;
      expect(button.y + button.height).toBeLessThanOrEqual(summary.y + rollTop);
      if (width < 768) {
        expect(title.x + title.width).toBeLessThanOrEqual(button.x);
        expect(button.y).toBeLessThan(title.y + title.height);
        expect(sponsor.y).toBeGreaterThanOrEqual(summary.y + summary.height + (immersive ? 10 : 0));
        expect(Math.abs(sponsor.width - summary.width)).toBeLessThanOrEqual(1);
      }
      expect(layout.noOverflow).toBe(true);
    }
  });
}

test("immersive mode is opt-in, uses canvas flames and resets on reload", async ({ page }) => {
  await page.goto("/events/fireworks-2026/");
  const toggle = page.getByRole("switch", { name: "Immersive", exact: true });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("body")).not.toHaveClass(/fw-theme/);
  await expect(page.locator(".fw-torches")).toBeHidden();
  await expect(page.locator(".fw-ivy")).toHaveCount(6);
  await expect(page.locator(".fw-ivy").first()).toBeHidden();
  await expect(page.locator(".poster-figure")).toHaveCount(0);
  const headerStyles = () => page.locator(".site-header, .brand, .brand-copy span, .desktop-nav a, .menu-toggle").evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, border: style.borderBottomColor };
  }));
  const standardHeader = await headerStyles();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("body")).toHaveClass(/fw-theme/);
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(2);
  await expect(page.locator(".fw-torches")).toBeVisible();
  await expect(page.locator(".fw-ivy").first()).toBeVisible();
  expect(await headerStyles()).toEqual(standardHeader);
  expect(await page.locator(".event-summary").evaluate((element) => getComputedStyle(element, "::before").height)).toBe("24px");
  await toggle.click();
  await expect(page.locator(".fw-torches")).toBeHidden();
  await expect(page.locator(".fw-ivy").first()).toBeHidden();
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  await toggle.click();
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(2);
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
});

test("reduced motion keeps the immersive design but uses static flames", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/events/fireworks-2026/");
  await page.getByRole("switch", { name: "Immersive", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/fw-theme/);
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  await expect(page.locator(".fw-flame").first()).toBeVisible();
  await expect(page.locator(".fw-torch__flames canvas").first()).toBeHidden();
  await expect(page.locator(".fw-sky")).toBeHidden();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the standard page and guide details remain usable", async ({ page }) => {
    await page.goto("/events/fireworks-2026/");
    await expect(page.locator("[data-fw-mode-bar]")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Fireworks on the Field" })).toBeVisible();
    await expect(page.getByText("St John Ambulance will be in the Hive throughout the event.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Buy tickets/ })).toBeVisible();
  });
});
