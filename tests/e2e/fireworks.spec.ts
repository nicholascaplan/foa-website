import { expect, test } from "@playwright/test";

test("clicking through from What's On does not show a return breadcrumb", async ({ page }) => {
  await page.goto("/whats-on/");
  await page.getByRole("link", { name: /Fireworks on the Field/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Fireworks on the Field" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to What's On/i })).toHaveCount(0);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`the Fireworks experience fits without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/events/fireworks-2026/");
    await expect(page.locator("body")).toHaveClass(/fw-theme/);
    const layout = await page.evaluate(async () => {
      await document.fonts.ready;
      const summary = document.querySelector(".event-summary")!.getBoundingClientRect();
      const sponsor = document.querySelector(".event-hero-sponsor")!.getBoundingClientRect();
      const kicker = document.querySelector(".fw-kicker")!;
      const poles = [...document.querySelectorAll(".fw-torch__pole")].map((pole) => {
        const rect = pole.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      });
      const introBottom = document.querySelector(".event-hero-intro")!.getBoundingClientRect().bottom;
      const flameTop = document.querySelector(".fw-torch__flames")!.getBoundingClientRect().top;
      return {
        summary: { x: summary.x, y: summary.y, width: summary.width, height: summary.height },
        sponsor: { x: sponsor.x, y: sponsor.y, width: sponsor.width },
        kicker: { width: kicker.getBoundingClientRect().width, scrollWidth: kicker.scrollWidth, fontSize: getComputedStyle(kicker).fontSize },
        poles,
        introBottom,
        flameTop,
        noOverflow: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    if (width < 768) {
      expect(layout.sponsor.y).toBeGreaterThanOrEqual(layout.summary.y + layout.summary.height + 10);
      expect(Math.abs(layout.sponsor.width - layout.summary.width)).toBeLessThanOrEqual(1);
      expect(layout.kicker.scrollWidth).toBeLessThanOrEqual(layout.kicker.width);
      expect(layout.summary.x - 6).toBeGreaterThan(layout.poles[0].right);
      expect(layout.summary.x + layout.summary.width + 6).toBeLessThan(layout.poles[1].left);
      expect(layout.flameTop).toBeGreaterThan(layout.introBottom);
    }
    expect(layout.noOverflow).toBe(true);
  });
}

test("Fireworks uses the immersive design by default without a mode control", async ({ page }) => {
  await page.goto("/events/fireworks-2026/");
  await expect(page.locator("body")).toHaveClass(/fw-theme/);
  await expect(page.locator("[data-fw-mode], [data-fw-mode-bar]")).toHaveCount(0);
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(2);
  await expect(page.locator(".fw-torches")).toBeVisible();
  await expect(page.locator(".fw-ivy")).toHaveCount(0);
  await expect(page.locator(".poster-figure")).toHaveCount(0);
  const headerStyles = () => page.locator(".site-header, .brand, .brand-copy span, .menu-toggle").evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, background: style.backgroundColor, border: style.borderBottomColor };
  }));
  const header = await headerStyles();
  expect(await page.locator(".event-summary").evaluate((element) => getComputedStyle(element, "::before").height)).toBe("24px");
  await expect(page.locator(".event-summary .fw-date")).toHaveText("Thursday 5th November");
  await page.goto("/whats-on/");
  expect(await headerStyles()).toEqual(header);
});

test("reduced motion keeps the default design but uses static flames", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/events/fireworks-2026/");
  await expect(page.locator("body")).toHaveClass(/fw-theme/);
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  await expect(page.locator(".fw-flame").first()).toBeVisible();
  await expect(page.locator(".fw-torch__flames canvas").first()).toBeHidden();
  await expect(page.locator(".fw-sky")).toBeHidden();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the page and guide details remain usable", async ({ page }) => {
    await page.goto("/events/fireworks-2026/");
    await expect(page.locator("body")).toHaveClass(/fw-theme/);
    await expect(page.locator("[data-fw-mode]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Fireworks on the Field" })).toBeVisible();
    await expect(page.getByText("St John Ambulance will be in the Hive throughout the event.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Buy tickets/ })).toBeVisible();
  });
});
