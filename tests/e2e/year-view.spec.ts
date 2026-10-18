import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const event = JSON.parse(readFileSync(new URL("../../src/content/events/welcome-tea-2026.json", import.meta.url), "utf8"));
const eventEnd = Date.parse(event.end);
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(new Date(event.start));

for (const width of [390, 1440]) {
  test(`year-view archive keeps its events and month headings through repeated refreshes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install({ time: new Date(eventEnd + 60_000) });
    await page.goto("/prototype/year-view/");
    const archive = page.locator("[data-yearview-earlier]");
    const archivedEvent = archive.locator("[data-yearview-event]").filter({ hasText: event.title });
    await expect(archivedEvent).toHaveCount(1);
    await expect(archive.locator("[data-earlier-month]").filter({ hasText: event.title }).locator(".term-month-heading")).toHaveText(monthLabel);

    const inventory = () => page.locator("[data-yearview-event]").evaluateAll((items) => items.map((item) => ({
      text: item.textContent?.replace(/\s+/g, " ").trim(),
      archived: Boolean(item.closest("[data-yearview-earlier]")),
    })));
    const before = await inventory();
    const headings = await archive.locator(".term-month-heading").allTextContents();
    expect(headings.every((heading) => heading.trim().length > 0)).toBe(true);

    for (let refresh = 0; refresh < 2; refresh++) {
      await page.clock.runFor(60_000);
      expect(await inventory()).toEqual(before);
      expect(await archive.locator(".term-month-heading").allTextContents()).toEqual(headings);
      await expect(page.locator("[data-yearview-earlier-section]")).toBeVisible();
    }
  });
}

test("an event crossing its end time is archived once and survives later refreshes", async ({ page }) => {
  await page.clock.install({ time: new Date(eventEnd - 30_000) });
  await page.goto("/prototype/year-view/");
  const upcoming = page.locator("[data-month-key] [data-yearview-event]").filter({ hasText: event.title });
  const archived = page.locator("[data-yearview-earlier] [data-yearview-event]").filter({ hasText: event.title });
  await expect(upcoming).toHaveCount(1);
  await expect(archived).toHaveCount(0);
  const count = await page.locator("[data-yearview-event]").count();

  await page.clock.runFor(60_000);
  await expect(upcoming).toHaveCount(0);
  await expect(archived).toHaveCount(1);
  await page.clock.runFor(60_000);
  await expect(archived).toHaveCount(1);
  await expect(page.locator("[data-yearview-event]")).toHaveCount(count);
});
