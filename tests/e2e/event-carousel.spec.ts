import { expect, test } from "@playwright/test";

test.describe("homepage event carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-03T09:00:00Z") });
    await page.goto("/");
    await page.clock.runFor(0);
  });

  test("rotates every five seconds and can be paused", async ({ page }) => {
    const carousel = page.getByRole("region", { name: "Featured events" });
    await expect(carousel.locator('[data-carousel-slide][data-active="true"]')).toHaveClass(/event-feature--poster/);

    await page.clock.fastForward(5000);
    await expect(carousel.locator('[data-carousel-slide][data-active="true"] h2')).toHaveText("Fireworks on the Field");

    await carousel.getByRole("button", { name: "Pause automatic event rotation" }).click();
    await page.clock.fastForward(10000);
    await expect(carousel.locator('[data-carousel-slide][data-active="true"] h2')).toHaveText("Fireworks on the Field");
    await expect(carousel.getByRole("button", { name: "Resume automatic event rotation" })).toBeVisible();
  });

  test("supports manual previous and next controls", async ({ page }) => {
    const carousel = page.getByRole("region", { name: "Featured events" });
    await carousel.getByRole("button", { name: "Show next event" }).click();
    await expect(carousel.getByRole("heading", { name: "Fireworks on the Field" })).toBeVisible();
    await carousel.getByRole("button", { name: "Show previous event" }).click();
    await expect(carousel.locator('[data-carousel-slide][data-active="true"]')).toHaveClass(/event-feature--poster/);
  });
});

test("Welcome Tea moves to Past events on Sunday", async ({ page }) => {
  await page.goto("/whats-on/");
  // Set the clock after navigation, then exercise the same refresh path used at midnight.
  await page.clock.install({ time: new Date("2026-10-04T01:00:00Z") });
  await page.evaluate(() => window.dispatchEvent(new Event("foa:refresh-events")));
  await expect(page.locator("html")).toHaveAttribute("data-events-ready", "true");
  const upcoming = page.locator("section").filter({ has: page.getByRole("heading", { name: "Upcoming events" }) });
  await expect(upcoming.getByText("Reception Welcome Tea")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Past events" })).toBeVisible();
  await expect(page.locator(".past-event").getByRole("heading", { name: "Reception Welcome Tea" })).toBeVisible();

  await page.goto("/");
  await page.clock.install({ time: new Date("2026-10-04T01:00:00Z") });
  await page.evaluate(() => window.dispatchEvent(new Event("foa:refresh-events")));
  await expect(page.getByRole("heading", { name: "Reception Welcome Tea" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Fireworks on the Field" })).toBeVisible();
  await expect(page.locator("[data-carousel-controls]")).toBeHidden();
});
