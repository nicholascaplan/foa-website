import { expect, test, type Page } from "@playwright/test";

// Welcome Tea starts at 13:00 BST (12:00 UTC) on 2026-10-03 and archives from then; Fireworks is on 2026-11-05.
const lastMomentOfWelcomeTea = "2026-10-03T11:59:30Z";
const firstMomentAfterWelcomeTea = "2026-10-03T12:00:00Z";

const openAt = async (page: Page, isoTime: string, path: string) => {
  // Only freeze Date: event rules do not need mocked animation or interval timers.
  await page.clock.setFixedTime(new Date(isoTime));
  const response = await page.goto(path);
  expect(response?.status(), `Navigation to ${path} at ${isoTime} must succeed`).toBe(200);
};

const homepageWelcomeTea = (page: Page) =>
  page.getByRole("main").getByRole("heading", { level: 2, name: "Welcome Tea" });
const homepageFireworks = (page: Page) =>
  page.getByRole("main").getByRole("heading", { level: 2, name: "Fireworks on the Field" });

test.describe("Homepage always features Fireworks", () => {
  for (const timezoneId of ["Europe/London", "America/Los_Angeles"]) {
    test.describe(timezoneId, () => {
      test.use({ timezoneId });

      for (const isoTime of [lastMomentOfWelcomeTea, firstMomentAfterWelcomeTea]) {
        test(`shows Fireworks with no Welcome Tea at ${isoTime}`, async ({ page }) => {
          await openAt(page, isoTime, "/");

          await expect(homepageFireworks(page)).toBeVisible();
          await expect(homepageWelcomeTea(page)).toHaveCount(0);
          await expect(page.locator("[data-show-before], [data-show-from]")).toHaveCount(0);
        });
      }
    });
  }
});

test.describe("What's On event sections (UK time)", () => {
  test.use({ timezoneId: "Europe/London" });

  const welcomeTeaListItem = (page: Page) =>
    page.locator(".event-list-item").filter({ hasText: "Welcome Tea" });
  const pastEvents = (page: Page) => page.locator("[data-past-events-section]");

  test("lists Welcome Tea as upcoming and hides the past section before the archive date", async ({ page }) => {
    await openAt(page, lastMomentOfWelcomeTea, "/whats-on/");

    await expect(welcomeTeaListItem(page)).toBeVisible();
    await expect(pastEvents(page)).toBeHidden();
  });

  test("moves Welcome Tea to past events when it starts at 1pm", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/whats-on/");

    await expect(welcomeTeaListItem(page)).toBeHidden();
    await expect(pastEvents(page)).toBeVisible();
    await expect(pastEvents(page).getByRole("heading", { name: "Welcome Tea" })).toBeVisible();
  });

  test("keeps Fireworks upcoming after Welcome Tea has moved", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/whats-on/");

    await expect(page.locator(".event-list-item").filter({ hasText: "Fireworks on the Field" })).toBeVisible();
  });

  test("hides a timed event once its start time has passed", async ({ page }) => {
    const octoberSale = page.locator(".event-list-item").filter({ hasText: "Pre-loved uniform sale" }).first();

    await openAt(page, "2026-10-02T14:24:30Z", "/whats-on/");
    await expect(octoberSale).toBeVisible();

    await openAt(page, "2026-10-02T14:25:00Z", "/whats-on/");
    await expect(page.locator(".event-list-item").filter({ hasText: "2nd October" })).toBeHidden();
  });

  test("lists Santa's Grotto without a time and hides it after 16th December", async ({ page }) => {
    const grotto = page.locator(".event-list-item").filter({ hasText: "Santa's Grotto" });

    await openAt(page, "2026-12-16T23:59:00Z", "/whats-on/");
    await expect(grotto).toBeVisible();
    await expect(grotto).toContainText("Wednesday 16th December · Ashley School");

    await openAt(page, "2026-12-17T00:00:00Z", "/whats-on/");
    await expect(grotto).toBeHidden();
  });
});

test.describe("Today and Tomorrow labels use UK time, not the visitor's timezone", () => {
  const fireworksLabel = (page: Page) =>
    page.locator(".event-list-item").filter({ hasText: "Fireworks on the Field" }).locator(".relative-date");

  test.describe("behind the UK", () => {
    test.use({ timezoneId: "America/Los_Angeles" });

    test("shows Today on the UK event day even though it is still the day before locally", async ({ page }) => {
      await openAt(page, "2026-11-05T01:00:00Z", "/whats-on/");

      await expect(fireworksLabel(page)).toHaveText("Today");
    });
  });

  test.describe("ahead of the UK", () => {
    test.use({ timezoneId: "Pacific/Auckland" });

    test("shows Tomorrow on the UK day before even though it is already the event day locally", async ({ page }) => {
      await openAt(page, "2026-11-04T12:00:00Z", "/whats-on/");

      await expect(fireworksLabel(page)).toHaveText("Tomorrow");
    });
  });
});
