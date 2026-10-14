import { expect, test } from "@playwright/test";

test.describe("Newsletter envelope logo", () => {
  test.use({ javaScriptEnabled: false });

  for (const width of [320, 390, 1440]) {
    test(`the complete artwork is present without JavaScript at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/newsletter/");
      const logo = page.locator(width < 1024 ? ".mobile-page-logo img" : ".site-header .brand-logo");
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute("src", /\/brand\/foa-logo-newsletter-ivory\.svg$/);
      await expect(logo).toHaveCSS("border-radius", "0px");
      await expect(logo).toHaveCSS("object-fit", "contain");
      await expect(logo).toHaveCSS("transform-origin", "0px 0px");
      const bounds = await logo.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBeCloseTo(bounds!.height, 0);
      const circle = {
        x: bounds!.x + bounds!.width * 85 / 550,
        y: bounds!.y + bounds!.height * 29 / 550,
        width: bounds!.width * 380 / 550,
      };
      if (width < 1024) {
        expect(circle.width).toBeCloseTo(128, 0);
        const envelopeLeft = bounds!.x + bounds!.width * 96 / 550;
        const envelopeRight = bounds!.x + bounds!.width * 454 / 550;
        expect(envelopeLeft).toBeGreaterThan(circle.x);
        expect(envelopeRight).toBeLessThan(circle.x + circle.width);
        const intro = await page.locator(".view-hero-copy > p").boundingBox();
        expect(intro!.y).toBeGreaterThanOrEqual(circle.y + circle.width * 483 / 380);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      await page.goto("/uniform/");
      const standard = await page.locator(width < 1024 ? ".mobile-page-logo img" : ".site-header .brand-logo").boundingBox();
      expect(circle.width).toBeCloseTo(standard!.width, 0);
      if (width < 1024) {
        expect(circle.x).toBeCloseTo(standard!.x, 0);
        expect(circle.y).toBeCloseTo(standard!.y, 0);
      }
    });
  }
});

test("the newsletter mobile menu also contains the unclipped envelope logo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/newsletter/");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  const logo = page.locator(".mobile-menu-logo");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", /\/brand\/foa-logo-newsletter-ivory\.svg$/);
  await expect(logo).toHaveCSS("border-radius", "0px");
  await expect(logo).toHaveCSS("object-fit", "contain");
  await expect(logo).toHaveCSS("transform-origin", "0px 0px");
  const bounds = await logo.boundingBox();
  expect(bounds!.width * 380 / 550).toBeCloseTo(104, 0);
});

for (const width of [1024, 1440]) {
  test(`desktop branding and navigation stay aligned when opening Newsletter at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const measure = async () => {
      await page.evaluate(() => document.fonts.ready);
      return page.locator(".site-header").evaluate((header) => {
        const bounds = (selector: string) => {
          const { x, y, width, height } = header.querySelector(selector)!.getBoundingClientRect();
          return { x, y, width, height };
        };
        return {
          branding: bounds(".home-introduction p"),
          navigation: bounds(".desktop-nav"),
          firstLink: bounds(".desktop-nav a"),
          theme: bounds(".header-theme-toggle"),
          row: bounds(".header-inner"),
        };
      });
    };
    await page.goto("/uniform/");
    const standard = await measure();
    await page.locator(".desktop-nav").getByRole("link", { name: "Newsletter", exact: true }).click();
    await expect(page).toHaveURL(/\/newsletter\/$/);
    const newsletter = await measure();
    for (const key of ["branding", "navigation", "firstLink", "theme", "row"] as const) {
      for (const dimension of ["x", "y", "width", "height"] as const) {
        expect(newsletter[key][dimension], `${key} ${dimension}`).toBeCloseTo(standard[key][dimension], 1);
      }
    }
    const logo = await page.locator(".site-header .brand-logo").boundingBox();
    // Artwork extends beyond the square image box but fits in the shared header.
    const envelopeBottom = logo!.y + logo!.height * 512 / 550;
    expect(envelopeBottom).toBeLessThanOrEqual(newsletter.row.y + newsletter.row.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await page.locator(".desktop-nav").getByRole("link", { name: "Uniform", exact: true }).click();
    expect(await measure()).toEqual(standard);
  });
}
