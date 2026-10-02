import { expect, test } from "@playwright/test";

test.describe("Newsletter archive dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/newsletter/");
  });

  test("opens with the previous newsletter and locks page scroll", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /Read more/ });
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText("Welcome Back from The FOA");
    await expect(page.locator("body")).toHaveClass(/dialog-open/);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  });

  test("closes with the close button, releases scroll lock and restores focus", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /Read more/ });
    await trigger.click();
    await page.getByRole("button", { name: /^Close / }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("body")).not.toHaveClass(/dialog-open/);
    await expect(trigger).toBeFocused();
  });

  test("closes when the backdrop is clicked", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /Read more/ });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.mouse.click(2, 2);

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("body")).not.toHaveClass(/dialog-open/);
    await expect(trigger).toBeFocused();
  });

  test("stays open when the dialog content is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /Read more/ }).click();
    await page.getByRole("dialog").getByRole("heading", { level: 2 }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("closes with Escape, releases scroll lock and restores focus", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /Read more/ });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("body")).not.toHaveClass(/dialog-open/);
    await expect(trigger).toBeFocused();
  });

  test("moves focus into the dialog and keeps page content behind it unreachable", async ({ page }) => {
    await page.getByRole("button", { name: /Read more/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const describeFocus = () => page.evaluate(() => {
      const active = document.activeElement;
      return {
        inDialog: Boolean(active?.closest("dialog[open]")),
        isBody: active === document.body,
        description: active ? `${active.tagName.toLowerCase()}.${active.className}` : "none",
      };
    });

    const initial = await describeFocus();
    expect(initial.inDialog, `focus should start inside the dialog, but was on ${initial.description}`).toBe(true);

    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      const focus = await describeFocus();
      expect(
        focus.inDialog || focus.isBody,
        `Tab ${i + 1} moved focus to page content behind the dialog: ${focus.description}`,
      ).toBe(true);
    }
  });
});
