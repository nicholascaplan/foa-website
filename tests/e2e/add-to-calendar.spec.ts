import { expect, test, type Page } from "@playwright/test";

const calendarLink = (page: Page) => page.getByRole("link", { name: "Add to calendar" });

const fetchIcs = async (page: Page, path: string) => {
  const response = await page.request.get(path);
  expect(response.status(), `Fetching ${path} must succeed`).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/calendar");
  return response.text();
};

test.describe("Add to calendar", () => {
  test("the Fireworks page offers a calendar download with exact times", async ({ page }) => {
    await page.goto("/events/fireworks-2026/");
    const link = calendarLink(page);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /\/calendar\/fireworks-2026\.ics$/);
    await expect(link).toHaveAttribute("download", "fireworks-2026.ics");

    const ics = await fetchIcs(page, "/calendar/fireworks-2026.ics");
    expect(ics).toContain("SUMMARY:Fireworks on the Field");
    expect(ics).toContain("DTSTART:20261105T163000Z");
    expect(ics).toContain("DTEND:20261105T183000Z");
    expect(ics).toContain("LOCATION:Ashley School field\\, Ashley Road\\, Walton-on-Thames KT12 1HX");
    expect(ics).toContain("STATUS:CONFIRMED");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(ics.replace(/\r\n[ \t]/g, "")).toContain(`URL:${canonical}`);
  });

  test("the Christmas Fayre page offers a start-only tentative download while the end time is unconfirmed", async ({ page }) => {
    await page.goto("/events/christmas-fayre-2026/");
    const link = calendarLink(page);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /\/calendar\/christmas-fayre-2026\.ics$/);

    const ics = await fetchIcs(page, "/calendar/christmas-fayre-2026.ics");
    expect(ics).toContain("DTSTART:20261205T120000Z");
    expect(ics).not.toContain("DTEND");
    expect(ics).toContain("STATUS:TENTATIVE");
  });

  test("What's On offers downloads for upcoming events and never for past events", async ({ page }) => {
    await page.goto("/whats-on/");
    const links = calendarLink(page);
    // Fireworks, Santa's Grotto and both Happy Bags dates are upcoming and offer downloads.
    await expect(links).toHaveCount(4);
    const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    expect(hrefs).toEqual([
      "/calendar/fireworks-2026.ics",
      "/calendar/santas-grotto-2026.ics",
      "/calendar/happy-bags-january-2027.ics",
      "/calendar/happy-bags-april-2027.ics",
    ]);
    for (const link of await links.all()) await expect(link).toHaveAttribute("download", /.+\.ics/);
    // Rows that are one whole link (Christmas Fayre, uniform sales) cannot nest a download link.
    await expect(page.locator("a.event-list-item", { hasText: "Christmas Fayre" }).getByRole("link", { name: "Add to calendar" })).toHaveCount(0);
  });

  test("all-day events download a whole-day UK calendar entry", async ({ page }) => {
    const ics = await fetchIcs(page, "/calendar/happy-bags-january-2027.ics");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270113");
    expect(ics).toContain("DTEND;VALUE=DATE:20270114");
  });

  test("timed sales keep their exact minutes", async ({ page }) => {
    const ics = await fetchIcs(page, "/calendar/uniform-november-2026.ics");
    expect(ics).toContain("DTSTART:20261106T152500Z");
    expect(ics).toContain("DTEND:20261106T154500Z");
  });
});
