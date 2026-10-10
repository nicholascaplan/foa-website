import { expect, test } from "@playwright/test";

declare global {
  interface Window { __fwWork: { contexts: number; frames: number }; }
}

async function recordCanvasWork(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.__fwWork = { contexts: 0, frames: 0 };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof getContext>) {
      window.__fwWork.contexts += 1;
      return getContext.apply(this, args);
    } as typeof getContext;
    const requestFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      window.__fwWork.frames += 1;
      return requestFrame.call(window, callback);
    };
  });
}

async function expectStaticEffects(page: import("@playwright/test").Page) {
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(0);
  await expect(page.locator(".fw-flame").first()).toBeVisible();
  await expect(page.locator(".fw-sky")).toBeHidden();
  expect(await page.evaluate(() => {
    const stage = document.querySelector("[data-fw-stage]")!;
    const flame = document.querySelector(".fw-flame")!;
    const halo = document.querySelector(".fw-torch__halo")!;
    return [getComputedStyle(stage, "::before").animationName, getComputedStyle(flame).animationName, getComputedStyle(halo).animationName];
  })).toEqual(["none", "none", "none"]);
  expect(await page.locator(".site-header").evaluate((header) => getComputedStyle(header).backdropFilter)).toBe("none");
  expect(await page.locator("[data-fw-sky]").evaluate((canvas) => ({ width: (canvas as HTMLCanvasElement).width, height: (canvas as HTMLCanvasElement).height }))).toEqual({ width: 0, height: 0 });
}

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
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/events/fireworks-2026/");
  await expect(page.locator("body")).toHaveClass(/fw-theme/);
  await expect(page.locator("[data-fw-mode], [data-fw-mode-bar]")).toHaveCount(0);
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(2);
  await expect(page.locator(".fw-torches")).toBeVisible();
  await expect(page.locator(".fw-ivy")).toHaveCount(0);
  await expect(page.locator(".poster-figure")).toHaveCount(0);
   const headerStyles = () => page.locator(".site-header, .brand, .brand p span, .menu-toggle").evaluateAll((elements) => elements.map((element) => {
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
  await recordCanvasWork(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/events/fireworks-2026/");
  await expect(page.locator("body")).toHaveClass(/fw-theme/);
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  await expect(page.locator(".fw-flame").first()).toBeVisible();
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(0);
  await expect(page.locator(".fw-sky")).toBeHidden();
  expect(await page.evaluate(() => window.__fwWork)).toEqual({ contexts: 0, frames: 0 });
});

test("a narrow non-touch viewport starts no canvas work, including after scrolling", async ({ page }) => {
  await recordCanvasWork(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/events/fireworks-2026/");
  await expectStaticEffects(page);
  await page.locator(".schedule").scrollIntoViewIfNeeded();
  await page.getByRole("heading", { name: "Before you come." }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(800); // Beyond the opening sequence's first scheduled launch.
  expect(await page.evaluate(() => window.__fwWork)).toEqual({ contexts: 0, frames: 0 });
});

test.describe("touch-device safety", () => {
  test.use({ hasTouch: true, deviceScaleFactor: 3 });

  test("portrait, landscape and wider touch screens stay static without canvas work", async ({ page }) => {
    await recordCanvasWork(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/events/fireworks-2026/");
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1194, height: 834 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await expectStaticEffects(page);
      await page.locator(".schedule").scrollIntoViewIfNeeded();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expectStaticEffects(page);
    }
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.__fwWork)).toEqual({ contexts: 0, frames: 0 });
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.getByRole("link", { name: /Buy tickets/ })).toBeVisible();
  });

  test("a direct landscape visit never creates canvas renderers", async ({ page }) => {
    await recordCanvasWork(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/events/fireworks-2026/");
    await expectStaticEffects(page);
    expect(await page.evaluate(() => window.__fwWork)).toEqual({ contexts: 0, frames: 0 });
  });
});

test("switching desktop to narrow or reduced motion stops drawing and releases the sky buffer", async ({ page }) => {
  await recordCanvasWork(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/events/fireworks-2026/");
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  const stopped = await page.evaluate(() => ({ ...window.__fwWork }));
  await page.locator(".schedule").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__fwWork)).toEqual(stopped);
  expect(await page.locator("[data-fw-sky]").evaluate((canvas) => (canvas as HTMLCanvasElement).width)).toBe(0);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("[data-fw-stage]")).not.toHaveAttribute("data-fw-paused", "");
  await expect(page.locator(".fw-torch__flames canvas")).toHaveCount(2);
  await expect.poll(() => page.locator("[data-fw-sky]").evaluate((canvas) => (canvas as HTMLCanvasElement).width)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-fw-stage]")).toHaveAttribute("data-fw-paused", "");
  const reduced = await page.evaluate(() => ({ ...window.__fwWork }));
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__fwWork)).toEqual(reduced);
  await expect(page.locator(".fw-flame").first()).toBeVisible();
  expect(await page.locator("[data-fw-sky]").evaluate((canvas) => (canvas as HTMLCanvasElement).width)).toBe(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the page and guide details remain usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/events/fireworks-2026/");
    await expect(page.locator("body")).toHaveClass(/fw-theme/);
    await expect(page.locator("[data-fw-mode]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Fireworks on the Field" })).toBeVisible();
    await expect(page.getByText("St John Ambulance will be in the Hive throughout the event.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Buy tickets/ })).toBeVisible();
    await expectStaticEffects(page);
  });
});
