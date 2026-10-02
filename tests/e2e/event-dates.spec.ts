import { expect, test, type Page } from "@playwright/test";

// Welcome Tea archives from 2026-10-04 (UK time); Fireworks is on 2026-11-05.
// BST ends on 2026-10-25, so UK midnight on 4 October is 23:00 UTC on 3 October.
const lastMomentOfWelcomeTea = "2026-10-03T22:59:30Z";
const firstMomentAfterWelcomeTea = "2026-10-03T23:00:00Z";

const openAt = async (page: Page, isoTime: string, path: string) => {
  await page.clock.install({ time: new Date(isoTime) });
  await page.goto(path);
};

const homepageWelcomeTea = (page: Page) =>
  page.getByRole("main").getByRole("heading", { level: 2, name: "Welcome Tea" });
const homepageFireworks = (page: Page) =>
  page.getByRole("main").getByRole("heading", { level: 2, name: "Fireworks on the Field" });

test.describe("Homepage event switch (UK time)", () => {
  test.use({ timezoneId: "Europe/London" });

  test("shows the Welcome Tea poster before the archive date", async ({ page }) => {
    await openAt(page, "2026-09-30T09:00:00Z", "/");

    await expect(homepageWelcomeTea(page)).toBeVisible();
    await expect(homepageFireworks(page)).toBeHidden();
  });

  test("still shows Welcome Tea in the last minute of 3 October", async ({ page }) => {
    await openAt(page, lastMomentOfWelcomeTea, "/");

    await expect(homepageWelcomeTea(page)).toBeVisible();
    await expect(homepageFireworks(page)).toBeHidden();
  });

  test("switches to Fireworks at UK midnight on 4 October", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/");

    await expect(homepageFireworks(page)).toBeVisible();
    await expect(homepageWelcomeTea(page)).toBeHidden();
  });

  test("switches without a reload when midnight passes while the page is open", async ({ page }) => {
    await openAt(page, lastMomentOfWelcomeTea, "/");
    await expect(homepageWelcomeTea(page)).toBeVisible();

    await page.clock.fastForward(90_000);

    await expect(homepageFireworks(page)).toBeVisible();
    await expect(homepageWelcomeTea(page)).toBeHidden();
  });
});

test.describe("Homepage event switch uses UK time, not the visitor's timezone", () => {
  test.use({ timezoneId: "America/Los_Angeles" });

  test("a visitor still on 3 October locally sees Fireworks once it is 4 October in the UK", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/");

    await expect(homepageFireworks(page)).toBeVisible();
    await expect(homepageWelcomeTea(page)).toBeHidden();
  });
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

  test("moves Welcome Tea to past events at UK midnight on 4 October", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/whats-on/");

    await expect(welcomeTeaListItem(page)).toBeHidden();
    await expect(pastEvents(page)).toBeVisible();
    await expect(pastEvents(page).getByRole("heading", { name: "Welcome Tea" })).toBeVisible();
  });

  test("keeps Fireworks upcoming after Welcome Tea has moved", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/whats-on/");

    await expect(page.locator(".event-list-item").filter({ hasText: "Fireworks on the Field" })).toBeVisible();
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

test.describe("Today and Tomorrow date labels", () => {
  test.use({ timezoneId: "Europe/London" });

  const fireworksLabel = (page: Page) =>
    page.locator(".event-list-item").filter({ hasText: "Fireworks on the Field" }).locator(".relative-date");

  for (const { name, time, label } of [
    { name: "two days before shows no label", time: "2026-11-03T12:00:00Z", label: "" },
    { name: "the day before shows Tomorrow", time: "2026-11-04T12:00:00Z", label: "Tomorrow" },
    { name: "late the evening before shows Tomorrow", time: "2026-11-04T23:59:00Z", label: "Tomorrow" },
    { name: "the day itself shows Today", time: "2026-11-05T09:00:00Z", label: "Today" },
    { name: "the day after shows no label", time: "2026-11-06T09:00:00Z", label: "" },
  ]) {
    test(name, async ({ page }) => {
      await openAt(page, time, "/whats-on/");

      if (label) {
        await expect(fireworksLabel(page)).toHaveText(label);
        await expect(fireworksLabel(page)).toBeVisible();
      } else {
        await expect(fireworksLabel(page)).toBeHidden();
        await expect(fireworksLabel(page)).toHaveText("");
      }
    });
  }
});
