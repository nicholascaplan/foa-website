import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`homepage selects one appropriately sized image at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const requests: string[] = [];
    page.on("request", (request) => {
      if (/\/events\/fireworks-\d+\.(jpg|webp)$/.test(request.url())) requests.push(request.url());
    });
    await page.goto("/");
    const photo = page.getByRole("img", { name: "Fireworks lighting up the sky over the school field." });
    await expect(photo).toBeVisible();
    const dimensions = await photo.evaluate((element) => {
      const image = element as HTMLImageElement;
      const box = image.getBoundingClientRect();
      return { src: image.currentSrc, complete: image.complete && image.naturalWidth > 0,
        width: box.width, height: box.height, viewport: innerWidth };
    });
    expect(dimensions.complete).toBe(true);
    expect(dimensions.src).toMatch(/\/events\/fireworks-640\.webp$/);
    expect(new Set(requests).size, "preload and image must not request different variants").toBe(1);
    expect(requests.some((url) => url.endsWith(".jpg"))).toBe(false);
    expect(dimensions.width).toBeLessThanOrEqual(viewport.width === 390 ? 390 : 600);
    expect(dimensions.height).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`the compact archive stays readable without loading event posters at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/whats-on/");
    await page.getByText("Earlier this year", { exact: true }).click();
    await expect(page.locator('[data-past="true"]').filter({ hasText: "Welcome Tea" })).toBeVisible();
    await expect(page.locator('[data-yearview-earlier] img')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
