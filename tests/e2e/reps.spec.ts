import { expect, test } from "@playwright/test";

test("Reps Hub actions align across desktop cards", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/reps/");
  const tops = await page.locator(".message-actions").evaluateAll((rows) =>
    rows.map((row) => row.getBoundingClientRect().top),
  );
  expect(tops).toHaveLength(3);
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
});

test("Fireworks uses a readable ticket link and keeps its URL in copied text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/reps/");
  const card = page.locator(".message-card").first();
  const ticket = card.getByRole("link", { name: "Buy Fireworks tickets" });
  await expect(ticket).toBeVisible();
  const url = await ticket.getAttribute("href");
  expect(url).toBeTruthy();
  expect(await card.getByRole("button", { name: "Copy message" }).getAttribute("data-copy-text"))
    .toContain(`Tickets: ${url}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
