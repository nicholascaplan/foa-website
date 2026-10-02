import { expect, test, type Page } from "@playwright/test";

// Welcome Tea starts at 13:00 BST (12:00 UTC) on 2026-10-03 and archives from then; Fireworks is on 2026-11-05.
const lastMomentOfWelcomeTea = "2026-10-03T11:59:30Z";
const firstMomentAfterWelcomeTea = "2026-10-03T12:00:00Z";

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

  test("still shows Welcome Tea until it starts at 1pm", async ({ page }) => {
    await openAt(page, lastMomentOfWelcomeTea, "/");

    await expect(homepageWelcomeTea(page)).toBeVisible();
    await expect(homepageFireworks(page)).toBeHidden();
  });

  test("switches to Fireworks when Welcome Tea starts at 1pm", async ({ page }) => {
    await openAt(page, firstMomentAfterWelcomeTea, "/");

    await expect(homepageFireworks(page)).toBeVisible();
    await expect(homepageWelcomeTea(page)).toBeHidden();
  });

  test("switches without a reload when Welcome Tea starts while the page is open", async ({ page }) => {
    await openAt(page, lastMomentOfWelcomeTea, "/");
    await expect(homepageWelcomeTea(page)).toBeVisible();

    await page.clock.fastForward(90_000);

    await expect(homepageFireworks(page)).toBeVisible();
    await expect(homepageWelcomeTea(page)).toBeHidden();
  });
});

test.describe("Homepage event switch uses UK time, not the visitor's timezone", () => {
  test.use({ timezoneId: "America/Los_Angeles" });

  test("a visitor in another timezone sees Fireworks once Welcome Tea has started", async ({ page }) => {
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
    await expect(page.locator(".event-list-item").filter({ hasText: "2 October" })).toBeHidden();
  });

  test("lists Santa's Grotto without a time and hides it after 16 December", async ({ page }) => {
    const grotto = page.locator(".event-list-item").filter({ hasText: "Santa's Grotto" });

    await openAt(page, "2026-12-16T23:59:00Z", "/whats-on/");
    await expect(grotto).toBeVisible();
    await expect(grotto).toContainText("Wednesday 16 December · Ashley School");

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
