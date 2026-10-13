import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1023]) {
  test(`${width}px: homepage heading grows as far as possible without changing Option C wrapping`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-fit-heading]")).toHaveAttribute("data-heading-fit", "ready");
    const leading = await page.locator("[data-fit-heading]").evaluate((heading) => {
      const style = getComputedStyle(heading);
      return parseFloat(style.lineHeight) / parseFloat(style.fontSize);
    });
    expect(leading).toBeCloseTo(1.2, 2);
    const result = await page.locator("[data-fit-heading]").evaluate((heading) => {
      const ranges: Range[] = [];
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        for (const word of walker.currentNode.textContent!.matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(walker.currentNode, word.index);
          range.setEnd(walker.currentNode, word.index + word[0].length);
          ranges.push(range);
        }
      }
      const lines = () => {
        const top = heading.getBoundingClientRect().top;
        const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
        return ranges.map((range) => [...range.getClientRects()].map((rect) => Math.round((rect.top - top) / lineHeight)).join(",")).join("|");
      };
      const fittedStyle = heading.style.fontSize;
      const fitted = parseFloat(getComputedStyle(heading).fontSize);
      const fittedLines = lines();
      heading.style.fontSize = "";
      const baseline = parseFloat(getComputedStyle(heading).fontSize);
      const baselineLines = lines();
      heading.style.fontSize = "var(--home-heading-fit-max)";
      const maximum = parseFloat(getComputedStyle(heading).fontSize);
      heading.style.fontSize = `${fitted + 0.2}px`;
      const bounds = heading.getBoundingClientRect();
      const nextFits = lines() === baselineLines && ranges.every((range) => [...range.getClientRects()].every((rect) => rect.left >= bounds.left - 0.5 && rect.right <= bounds.right + 0.5));
      heading.style.fontSize = fittedStyle;
      return { fitted, baseline, fittedLines, baselineLines, atLimit: fitted + 0.2 > maximum, nextFits };
    });
    expect(result.fitted).toBeGreaterThanOrEqual(result.baseline);
    expect(result.fittedLines).toBe(result.baselineLines);
    expect(result.atLimit || !result.nextFits, "Another 0.2px would change the wrapping or overflow").toBe(true);
  });
}

test("heading fitting resets to desktop styling when the viewport crosses 64rem", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const title = page.locator("[data-fit-heading]");
  await expect(title).toHaveAttribute("data-heading-fit", "ready");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(() => title.evaluate((heading) => heading.style.fontSize)).toBe("");
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(title).toHaveAttribute("data-heading-fit", "ready");
});

test.describe("homepage heading without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  test("retains Option C's readable fallback", async ({ page }) => {
    await page.goto("/");
    const title = page.locator("[data-fit-heading]");
    await expect(title).toBeVisible();
    expect(await title.evaluate((heading) => parseFloat(getComputedStyle(heading).fontSize))).toBeGreaterThanOrEqual(24);
    expect(await title.evaluate((heading) => heading.style.fontSize)).toBe("");
  });
});

for (const route of ["/", "/newsletter/", "/uniform/", "/events/christmas-fayre-2026/", "/fireworks-volunteering/"]) {
  test(`${route}: mobile logos stay beside headings and reflow with enlarged text`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(route);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await expect(page.locator(".page-logo-home"), route).toBeVisible();
    const layout = await page.locator(".mobile-page-heading").evaluate((element) => {
      const logo = element.querySelector(".page-logo-home")!.getBoundingClientRect();
      const copy = element.querySelector(".mobile-page-heading-copy")!.getBoundingClientRect();
      return { logoRight: logo.right, copyLeft: copy.left, copyRight: copy.right, viewport: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect(layout.copyLeft, route).toBeGreaterThanOrEqual(layout.logoRight);
    expect(layout.copyRight, route).toBeLessThanOrEqual(layout.viewport);
    expect(layout.overflow, route).toBeLessThanOrEqual(0);
  });
}

test("enlarged homepage text keeps the menu and hero actions inside a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });

  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(page.locator(".hero-copy .page-logo-home")).toBeVisible();
  expect(await page.locator(".hero-copy .mobile-page-heading, .hero-copy .page-logo-home, .hero-copy .page-logo-home img, .hero-copy .mobile-page-heading-copy, .hero-copy h1").evaluateAll((elements) =>
    elements.map((element) => {
      const { left, right } = element.getBoundingClientRect();
      return { element: element.className || element.tagName, left, right, viewport: window.innerWidth, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
    }).filter(({ left, right, viewport, scrollWidth, clientWidth }) =>
      left < 0 || right > viewport || scrollWidth > clientWidth),
  ), "Homepage logo and heading must reflow when text is enlarged").toEqual([]);
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
