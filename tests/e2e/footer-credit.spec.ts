import { expect, test } from "@playwright/test";

for (const width of [320, 390, 820, 1440]) {
  for (const theme of ["day", "night"]) {
    for (const enlarged of [false, true]) {
      test(`footer credit and cookie route at ${width}px ${theme} enlarged=${enlarged}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.addInitScript((theme) => {
          localStorage.setItem("foa-cookie-preferences", "essential");
          localStorage.setItem("foa-theme", theme);
        }, theme);
        await page.goto("/");
        if (enlarged) await page.evaluate(() => {
          const elements = [...document.querySelectorAll<HTMLElement>("footer, footer *")];
          const sizes = elements.map(element => parseFloat(getComputedStyle(element).fontSize));
          elements.forEach((element, index) => element.style.fontSize = `${sizes[index] * 2}px`);
        });
        const footer = page.getByRole("contentinfo");
        const credit = footer.getByRole("link", { name: "Made with love by Nick (opens in a new tab)", exact: true });
        await expect(credit).toHaveAttribute("href", "https://nicholascaplan.github.io/profile/");
        await expect(credit).toHaveAttribute("target", "_blank");
        await expect(credit.locator(".credit-name")).toHaveCSS("text-decoration-line", "underline");
        await expect(credit).toHaveCSS("text-decoration-line", "none");
        expect((await credit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        const utility = page.locator(".footer-bottom");
        const rhythm = await utility.evaluate(element => {
          const items = [...element.children] as HTMLElement[];
          const boxes = items.map(item => item.getBoundingClientRect());
          const stacked = getComputedStyle(element).flexDirection === "column";
          const gaps = boxes.slice(1).map((box, index) => stacked ? box.top - boxes[index].bottom : box.left - boxes[index].right);
          const fonts = [items[0], items[2], items[2].querySelector(".credit-name")!].map(item => {
            const style = getComputedStyle(item);
            return [style.fontFamily, style.fontSize, style.fontWeight, style.fontStyle];
          });
          return { gaps, fonts, stacked };
        });
        expect(rhythm.fonts[1]).toEqual(rhythm.fonts[0]);
        expect(rhythm.fonts[2]).toEqual(rhythm.fonts[0]);
        expect(Math.abs(rhythm.gaps[0] - rhythm.gaps[1])).toBeLessThanOrEqual(1);

        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
        await expect(footer.getByRole("button", { name: "Cookie preferences", exact: true })).toHaveCount(0);
        await footer.getByRole("link", { name: "Privacy & cookies", exact: true }).click();
        await expect(page).toHaveURL(/\/privacy\/#cookie-settings$/);
        const control = page.getByRole("main").getByRole("button", { name: "Cookie preferences", exact: true });
        await control.focus();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("button", { name: "Allow analytics cookies", exact: true })).toBeFocused();
        await page.getByRole("button", { name: "Reject analytics cookies", exact: true }).click();
        await expect(page.locator("[data-cookie-banner]")).toBeHidden();
        await expect(control).toBeFocused();
        expect(await page.evaluate(() => localStorage.getItem("foa-cookie-preferences"))).toBe("essential");
        await expect(page.locator("[data-google-analytics]")).toHaveCount(0);
      });
    }
  }
}
