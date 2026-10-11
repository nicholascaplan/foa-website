import { expect, test } from "@playwright/test";

test("Reps Hub actions align across desktop cards", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/reps/");
  const tops = await page.locator(".message-actions").evaluateAll((rows) =>
    rows.map((row) => row.getBoundingClientRect().top),
  );
  expect(tops).toHaveLength(4);
  for (const row of [tops.slice(0, 2), tops.slice(2)]) {
    expect(Math.max(...row) - Math.min(...row)).toBeLessThan(1);
  }
});

test("Fireworks uses a readable ticket link and keeps its URL in copied text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/reps/");
  const card = page.locator(".message-card").first();
  const ticket = card.getByRole("link", { name: /https:\/\/buytickets\.at/ });
  await expect(ticket).toBeVisible();
  const url = await ticket.getAttribute("href");
  expect(url).toBeTruthy();
  expect(await card.getByRole("button", { name: "Copy message" }).getAttribute("data-copy-text"))
    .toContain(`Buy Fireworks tickets: ${url}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("all messages keep their visible website URLs when copied", async ({ page }) => {
  await page.goto("/reps/");
  for (const card of await page.locator(".message-card").all()) {
    const url = await card.getByRole("link", { name: /https:\/\/www\.thefriendsofashley\.org/ }).innerText();
    expect(await card.getByRole("button", { name: "Copy message" }).getAttribute("data-copy-text")).toContain(url);
  }
});

test("expired messages disappear and the empty state becomes visible", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-11T12:00:00Z") });
  await page.goto("/reps/");
  await expect(page.locator(".message-card:visible")).toHaveCount(4);
  await page.clock.setSystemTime(new Date("2026-11-07T12:00:00Z"));
  await page.clock.fastForward(60000);
  await expect(page.locator(".message-card:visible")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Christmas Fayre", exact: true })).toBeVisible();
  await page.clock.setSystemTime(new Date("2026-12-05T12:00:00Z"));
  await page.clock.fastForward(60000);
  await expect(page.locator(".message-card:visible")).toHaveCount(0);
  await expect(page.locator("[data-messages-empty]")).toBeVisible();
});

test.describe("Reps Hub copy actions", () => {
  test("copies the message, confirms it and clears the confirmation", async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__copied = [];
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (text: string) => { (window as any).__copied.push(text); } },
      });
    });
    await page.clock.install();
    await page.goto("/reps/");

    const card = page.locator(".message-card").first();
    const expected = await card.getByRole("button", { name: "Copy message" }).getAttribute("data-copy-text");
    await card.getByRole("button", { name: "Copy message" }).click();

    await expect(card.getByRole("status")).toHaveText("Copied to clipboard.");
    expect(await page.evaluate(() => (window as any).__copied)).toEqual([expected]);

    await page.clock.fastForward(3100);
    await expect(card.getByRole("status")).toHaveText("");
  });

  test("shows manual-copy guidance when the clipboard rejects", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => { throw new Error("denied"); } },
      });
    });
    await page.goto("/reps/");

    const card = page.locator(".message-card").first();
    await card.getByRole("button", { name: "Copy message" }).click();

    await expect(card.getByRole("status")).toContainText("Copy was not available");
  });

  test("shows manual-copy guidance when the clipboard is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    });
    await page.goto("/reps/");

    const card = page.locator(".message-card").first();
    await card.getByRole("button", { name: "Copy message" }).click();

    await expect(card.getByRole("status")).toContainText("Copy was not available");
  });

  test("keeps feedback scoped to the message that was copied", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => {} },
      });
    });
    await page.goto("/reps/");

    const cards = page.locator(".message-card");
    await cards.nth(1).getByRole("button", { name: "Copy message" }).focus();
    await page.keyboard.press("Enter");

    await expect(cards.nth(1).getByRole("status")).toHaveText("Copied to clipboard.");
    await expect(cards.nth(0).getByRole("status")).toHaveText("");
  });
});
