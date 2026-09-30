import { expect, test } from "@playwright/test";

test("main task routes are reachable through normal navigation", async ({ page }) => {
  await page.goto("/");

  for (const destination of [
    { name: "What's On", path: "/whats-on/" },
    { name: "Uniform", path: "/uniform/" },
    { name: "Get Involved", path: "/get-involved/" },
  ]) {
    await page.getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: destination.name })
      .click();
    await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
    await expect(page.getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: destination.name }))
      .toHaveAttribute("aria-current", "page");
  }
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens with accessible state and closes by button, Escape and backdrop", async ({ page }) => {
    await page.goto("/");

    const openButton = page.getByRole("button", { name: "Open menu" });
    const closeButton = page.getByRole("button", { name: "Close menu" });
    const menu = page.locator("[data-mobile-menu]");

    await openButton.click();
    await expect(openButton).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toHaveAttribute("aria-hidden", "false");
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeEnabled();

    await closeButton.click();
    await expect(openButton).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveAttribute("aria-hidden", "true");
    await expect(openButton).toBeFocused();

    await openButton.click();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-hidden", "true");
    await expect(openButton).toBeFocused();

    await openButton.click();
    await menu.click({ position: { x: 10, y: 400 } });
    await expect(menu).toHaveAttribute("aria-hidden", "true");
    await expect(openButton).toBeFocused();
  });

  test("exposes the task routes and closes after following a link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();

    const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(navigation.getByRole("link"))
      .toHaveText(["Home", "What's On", "Get Involved", "Uniform", "Contact Us"]);

    await navigation.getByRole("link", { name: "Uniform" }).click();
    await expect(page).toHaveURL(/\/uniform\/$/);
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("aria-hidden", "true");

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Uniform" }))
      .toHaveAttribute("aria-current", "page");
  });
});
