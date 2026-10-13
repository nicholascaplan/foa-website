import { expect, test } from "@playwright/test";

for (const width of [320, 390, 554, 768, 1024, 1200, 1440]) {
  for (const enlargedText of [false, true]) {
    test(`uniform action icons stay beside their labels at ${width}px${enlargedText ? " with enlarged text" : ""}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/uniform/");
      if (enlargedText) {
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      }
      await page.evaluate(() => document.fonts.ready);

      const buttons = [
        page.getByRole("link", { name: "Email the Preloved team", exact: true }),
        page.getByRole("link", { name: "Reserve via Google Form (opens in a new tab)", exact: true }),
      ];
      await expect(buttons[0]).toHaveClass(/\bbutton--primary\b/);
      await expect(buttons[1]).toHaveClass(/\bbutton--amber\b/);
      const heights: number[] = [];
      for (const button of buttons) {
        await expect(button).toBeVisible();
        const layout = await button.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const label = element.querySelector("span")!.getBoundingClientRect();
          const icon = element.querySelector('[aria-hidden="true"]')!.getBoundingClientRect();
          const container = element.closest(".view-hero-inner")!.getBoundingClientRect();
          const containerStyle = getComputedStyle(element.closest(".view-hero-inner")!);
          return {
            labelRight: label.right,
            iconLeft: icon.left,
            centreDifference: Math.abs((label.top + label.height / 2) - (icon.top + icon.height / 2)),
            iconRight: icon.right,
            buttonRight: bounds.right,
            height: bounds.height,
            width: bounds.width,
            availableWidth: container.width - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight),
            labelHeight: label.height,
            lineHeight: parseFloat(getComputedStyle(element).lineHeight),
          };
        });
        expect(layout.iconLeft).toBeGreaterThan(layout.labelRight);
        expect(layout.centreDifference).toBeLessThan(1);
        expect(layout.iconRight).toBeLessThan(layout.buttonRight);
        expect(layout.height).toBeGreaterThanOrEqual(44);
        heights.push(layout.height);
        if (width < (enlargedText ? 2048 : 1024)) {
          expect(Math.abs(layout.width - layout.availableWidth)).toBeLessThan(1);
        }
        if (!enlargedText && width >= 390) {
          expect(layout.labelHeight).toBeLessThanOrEqual(layout.lineHeight + 1);
        }
      }
      expect(Math.abs(heights[0] - heights[1])).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
