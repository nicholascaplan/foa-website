import { expect, test, type Page } from "@playwright/test";

const storageKey = "foa-cookie-preferences";
const measurementId = "G-V2X8ZMQ5XZ";

// Never contact Google from tests: every analytics request is stubbed and recorded.
const trackAnalyticsRequests = async (page: Page) => {
  const requests: string[] = [];
  await page.route(/(googletagmanager|google-analytics|analytics\.google)\.com/, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ contentType: "application/javascript", body: "" });
  });
  return requests;
};

const storedPreference = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), storageKey);

const dataLayer = (page: Page) =>
  page.evaluate(() => ((window as any).dataLayer ?? []) as unknown[][]);

test.describe("Analytics consent", () => {
  test("loads nothing from Google before a choice is made", async ({ page }) => {
    const requests = await trackAnalyticsRequests(page);
    await page.goto("/");

    await expect(page.locator("[data-cookie-banner]")).toBeVisible();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("[data-google-analytics]")).toHaveCount(0);
    expect(requests).toEqual([]);
    expect(await storedPreference(page)).toBeNull();
  });

  test("rejecting stores the choice, loads nothing and is remembered across pages", async ({ page }) => {
    const requests = await trackAnalyticsRequests(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Reject analytics cookies" }).click();

    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    expect(await storedPreference(page)).toBe("essential");

    await page.goto("/whats-on/");
    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-google-analytics]")).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test("allowing loads Google Analytics for the configured property and is remembered", async ({ page }) => {
    const requests = await trackAnalyticsRequests(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Allow analytics cookies" }).click();

    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    expect(await storedPreference(page)).toBe("analytics");
    await expect(page.locator("[data-google-analytics]")).toHaveCount(1);
    await expect.poll(() => requests.length).toBeGreaterThan(0);
    expect(requests[0]).toContain(`googletagmanager.com/gtag/js?id=${measurementId}`);
    await expect.poll(async () =>
      (await dataLayer(page)).some(([command, id]) => command === "config" && id === measurementId)
    ).toBe(true);

    await page.goto("/whats-on/");
    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    await expect(page.locator("[data-google-analytics]")).toHaveCount(1);
  });

  test("withdrawing consent denies analytics storage and removes Analytics cookies only", async ({ page }) => {
    await trackAnalyticsRequests(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Allow analytics cookies" }).click();
    await expect(page.locator("[data-google-analytics]")).toHaveCount(1);

    await page.evaluate((id) => {
      document.cookie = "_ga=GA1.1.123.456; path=/";
      document.cookie = `_ga_${id.replace("G-", "")}=GS1.1.123; path=/`;
      document.cookie = "unrelated=keep; path=/";
    }, measurementId);

    await page.getByRole("button", { name: "Cookie preferences" }).click();
    await expect(page.locator("[data-cookie-banner]")).toBeVisible();
    await page.getByRole("button", { name: "Reject analytics cookies" }).click();

    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies).not.toContain("_ga");
    expect(cookies).toContain("unrelated=keep");
    expect(await storedPreference(page)).toBe("essential");
    const layer = await dataLayer(page);
    expect(layer.some(([command, action, detail]) =>
      command === "consent" && action === "update" && (detail as any)?.analytics_storage === "denied"
    )).toBe(true);
  });

  test("a previously stored allow choice reloads analytics without asking again", async ({ page }) => {
    const requests = await trackAnalyticsRequests(page);
    await page.addInitScript((key) => window.localStorage.setItem(key, "analytics"), storageKey);
    await page.goto("/");

    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    await expect(page.locator("[data-google-analytics]")).toHaveCount(1);
    await expect.poll(() => requests.length).toBeGreaterThan(0);
  });

  test("the banner choices are reachable by keyboard", async ({ page }) => {
    await trackAnalyticsRequests(page);
    await page.goto("/");

    await page.getByRole("button", { name: "Reject analytics cookies" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    expect(await storedPreference(page)).toBe("essential");
  });

  test("the site stays usable when browser storage is blocked", async ({ page }) => {
    const requests = await trackAnalyticsRequests(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() { throw new DOMException("blocked", "SecurityError"); },
      });
    });
    await page.goto("/");

    await expect(page.locator("[data-cookie-banner]")).toBeVisible();
    await page.getByRole("button", { name: "Reject analytics cookies" }).click();

    await expect(page.locator("[data-cookie-banner]")).toBeHidden();
    await page.waitForLoadState("networkidle");
    expect(requests).toEqual([]);
  });
});
