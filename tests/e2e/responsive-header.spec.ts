import { expect, test } from "@playwright/test";

test("enlarged homepage text keeps the menu and hero actions inside a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });

  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  expect(await page.locator(".home-introduction, .home-introduction img, .home-introduction p, .home-introduction strong, .home-introduction span").evaluateAll((elements) =>
    elements.map((element) => {
      const { left, right } = element.getBoundingClientRect();
      return { element: element.className || element.tagName, left, right, viewport: window.innerWidth, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
    }).filter(({ left, right, viewport, scrollWidth, clientWidth }) =>
      left < 0 || right > viewport || scrollWidth > clientWidth),
  ), "Homepage branding must reflow beside the menu when text is enlarged").toEqual([]);
  expect(await page.locator(".footer-brand-home, .footer-brand-home img, .footer-brand-home h2").evaluateAll((elements) =>
    elements.map((element) => {
      const { left, right } = element.getBoundingClientRect();
      return { element: element.tagName, left, right, viewport: window.innerWidth };
    }).filter(({ left, right, viewport }) => left < 0 || right > viewport),
  ), "Footer branding must reflow when text is enlarged").toEqual([]);
  const layout = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const outside = (rect: DOMRect) => rect.width > 0 && (rect.left < 0 || rect.right > viewport);
    const elements = Array.from(document.body.querySelectorAll<HTMLElement>("*")).flatMap((element) => {
      if (element.closest(".visually-hidden") || getComputedStyle(element).visibility === "hidden" || !element.getClientRects().length) return [];
      const rect = element.getBoundingClientRect();
      const text = Array.from(element.childNodes).flatMap((node) => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return [];
        const range = document.createRange();
        range.selectNodeContents(node);
        return Array.from(range.getClientRects()).filter(outside).map(({ left, right }) => ({ text: node.textContent!.trim().slice(0, 100), left, right }));
      });
      if (!outside(rect) && !text.length) return [];
      return [{ element: element.tagName, className: element.getAttribute("class"), left: rect.left, right: rect.right, text }];
    });
    return { overflow: document.documentElement.scrollWidth - viewport, elements };
  });
  expect(layout.overflow, `Out-of-viewport content: ${JSON.stringify(layout.elements, null, 2)}`).toBeLessThanOrEqual(0);
  // The hero clips overflow, so document width alone cannot catch spilling actions.
  expect(await page.locator(".menu-toggle, .hero-actions .button").evaluateAll((elements) =>
    elements.every((element) => {
      const { left, right, width, height } = element.getBoundingClientRect();
      return left >= 0 && right <= window.innerWidth && width >= 44 && height >= 44;
    }),
  )).toBe(true);
});
