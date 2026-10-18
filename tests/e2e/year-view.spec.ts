import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const load = (name: string) => JSON.parse(readFileSync(new URL(`../../src/content/events/${name}.json`, import.meta.url), "utf8"));
const event = load("fireworks-2026");
const boundary = Date.parse(event.end);
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(new Date(event.start));

for (const width of [390, 1440]) {
  test(`archive keeps events, month headings and focus through refreshes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install({ time: new Date(boundary + 60_000) });
    await page.goto("/whats-on/");
    await page.getByText("Earlier this year", { exact: true }).click();
    const archive = page.locator("[data-yearview-earlier]");
    const archivedEvent = archive.locator(".event-list-item:not([hidden])").filter({ hasText: event.title });
    await expect(archivedEvent).toHaveCount(1);
    await expect(archive.locator("[data-earlier-month]").filter({ hasText: event.title }).locator(".term-month-heading")).toHaveText(monthLabel);
    const link = archivedEvent.getByRole("link", { name: event.title });
    await link.focus();
    const inventory = () => archive.locator(".event-list-item:not([hidden])").allTextContents();
    const before = await inventory();
    const headings = await archive.locator(".term-month-heading").allTextContents();
    for (let refresh = 0; refresh < 2; refresh++) {
      await page.clock.runFor(60_000);
      expect(await inventory()).toEqual(before);
      expect(await archive.locator(".term-month-heading").allTextContents()).toEqual(headings);
      await expect(link).toBeFocused();
      await expect(page.locator(".term-earlier")).toHaveAttribute("open", "");
    }
    expect((await new AxeBuilder({ page }).analyze()).violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
  });
}

test("an event crossing its end switches once without dropping or duplicating visible events", async ({ page }) => {
  await page.clock.install({ time: new Date(boundary - 30_000) });
  await page.goto("/whats-on/");
  const upcoming = page.locator('[data-past="false"]').filter({ hasText: event.title });
  const archived = page.locator('[data-past="true"]').filter({ hasText: event.title });
  await expect(upcoming).toHaveJSProperty("hidden", false);
  await expect(archived).toHaveJSProperty("hidden", true);
  const count = await page.locator(".event-list-item:not([hidden])").count();
  await page.clock.runFor(60_000);
  await expect(upcoming).toHaveJSProperty("hidden", true);
  await expect(archived).toHaveJSProperty("hidden", false);
  await page.clock.runFor(60_000);
  expect(await page.locator(".event-list-item:not([hidden])").count()).toBe(count);
});

for (const date of ["2026-08-01T12:00:00Z", "2027-02-01T12:00:00Z", "2027-07-01T12:00:00Z", "2027-09-01T12:00:00Z"]) {
  test(`year view has honest month and empty states at ${date}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(date));
    await page.goto("/whats-on/");
    const current = page.locator("[data-current-chip]:visible");
    if (date.startsWith("2027-02") || date.startsWith("2027-07")) {
      await expect(current).toHaveCount(1);
      await expect(page.locator("[data-empty-note]:visible")).toHaveText("No more events listed this month.");
    } else await expect(current).toHaveCount(0);
    if (date.startsWith("2027-09")) {
      await expect(page.locator("[data-yearview-term]:visible")).toHaveCount(0);
      await expect(page.locator("[data-yearview-empty]")).toBeVisible();
    }
  });
}

test("upcoming actions and information survive refreshes and narrow enlarged text", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-18T12:00:00Z") });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/whats-on/");
  await expect(page.getByRole("link", { name: /Help at the Fayre/ })).toBeVisible();
  await page.getByText("What are Happy Bags?", { exact: true }).first().click();
  const info = page.locator(".event-list-info").first();
  await page.clock.runFor(60_000);
  await expect(info).toHaveAttribute("open", "");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => document.documentElement.dataset.theme = "night");
  expect((await new AxeBuilder({ page }).analyze()).violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
});
