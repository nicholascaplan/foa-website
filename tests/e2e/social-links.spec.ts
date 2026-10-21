import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1024]) {
  for (const theme of ["day", "night"]) {
    for (const enlarged of [false, true]) {
      test(`social links follow Contact Us without a tall-screen spacer at ${width}px, ${theme}, ${enlarged ? "200%" : "normal"} text`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((theme) => {
          localStorage.setItem("foa-theme", theme);
          localStorage.setItem("foa-cookie-preferences", "essential");
        }, theme);
        await page.goto("/contact/");
        if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        await page.getByRole("button", { name: "Open menu" }).click();
        const layout = await page.locator(".mobile-menu-follow").evaluate((group) => {
          const contact = document.querySelector(".mobile-menu-cta")!.getBoundingClientRect();
          const separator = group.getBoundingClientRect();
          const firstPill = group.querySelector("a")!.getBoundingClientRect();
          return { beforeRule: separator.top - contact.bottom, afterRule: firstPill.top - separator.top,
            pillLeft: firstPill.left, contactLeft: contact.left, fontSize: parseFloat(getComputedStyle(group).fontSize) };
        });
        expect(layout.beforeRule).toBeCloseTo(0.75 * layout.fontSize, 1);
        expect(layout.afterRule).toBeCloseTo(0.75 * layout.fontSize + 1, 1);
        expect(layout.pillLeft).toBeCloseTo(layout.contactLeft, 1);
      });
    }
  }
}

for (const width of [320, 390, 768, 1024, 1440]) {
  for (const theme of ["day", "night"]) {
    for (const enlarged of [false, true]) {
      test(`social labels fit their footer pills at ${width}px, ${theme}, ${enlarged ? "200%" : "normal"} text`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((theme) => {
          localStorage.setItem("foa-theme", theme);
          localStorage.setItem("foa-cookie-preferences", "essential");
        }, theme);
        await page.goto("/");
        if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        const group = page.locator(".footer-follow");
        await group.scrollIntoViewIfNeeded();
        await expect(group.getByRole("link")).toHaveCount(2);
        for (const link of await group.getByRole("link").all()) {
          const bounds = await link.evaluate((element) => {
            const pill = element.getBoundingClientRect();
            const label = element.querySelector("span")!.getBoundingClientRect();
            const icon = element.querySelector("svg")!.getBoundingClientRect();
            return { left: pill.left, right: pill.right, top: pill.top, bottom: pill.bottom, height: pill.height,
              children: [label, icon].map(({ left, right, top, bottom }) => ({ left, right, top, bottom })) };
          });
          expect(bounds.left).toBeGreaterThanOrEqual(0);
          expect(bounds.right).toBeLessThanOrEqual(width);
          expect(bounds.height).toBeGreaterThanOrEqual(44);
          for (const child of bounds.children) {
            expect(child.left).toBeGreaterThanOrEqual(bounds.left);
            expect(child.right).toBeLessThanOrEqual(bounds.right);
            expect(child.top).toBeGreaterThanOrEqual(bounds.top);
            expect(child.bottom).toBeLessThanOrEqual(bounds.bottom);
          }
        }
        const layout = await page.locator(".site-footer").evaluate((footer) => {
          const brand = footer.querySelector(".footer-brand")!.getBoundingClientRect();
          const links = footer.querySelector(".footer-links")!.getBoundingClientRect();
          const follow = footer.querySelector(".footer-follow")!.getBoundingClientRect();
          return { brand: { left: brand.left, bottom: brand.bottom }, links: { left: links.left, bottom: links.bottom },
            follow: { left: follow.left, top: follow.top }, fontSize: parseFloat(getComputedStyle(footer).fontSize) };
        });
        expect(layout.follow.left).toBeCloseTo(layout.brand.left, 1);
        if (layout.links.left > layout.brand.left + 1) {
          expect(layout.follow.top - layout.brand.bottom).toBeCloseTo(1.5 * layout.fontSize, 1);
        } else {
          expect(layout.follow.top - layout.links.bottom).toBeCloseTo(2.25 * layout.fontSize, 1);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
  }
}

for (const width of [320, 390, 768, 1024]) {
  for (const theme of ["day", "night"]) {
    for (const enlarged of [false, true]) {
      test(`menu social links remain secondary and reachable at ${width}px, ${theme}, ${enlarged ? "200%" : "normal"} text`, async ({ page }) => {
        await page.setViewportSize({ width, height: enlarged ? 480 : 667 });
        await page.addInitScript((theme) => {
          localStorage.setItem("foa-theme", theme);
          localStorage.setItem("foa-cookie-preferences", "essential");
        }, theme);
        await page.goto("/");
        if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        await page.getByRole("button", { name: "Open menu" }).click();
        const menu = page.getByRole("dialog", { name: "Site menu" });
        const group = menu.getByRole("group", { name: "Follow The Friends of Ashley" });
        const contact = menu.getByRole("link", { name: "Contact Us", exact: true });
        if (!enlarged) await expect(contact).toBeInViewport({ ratio: 1 });
        const order = await group.evaluate((element) => ({
          top: element.getBoundingClientRect().top,
          contactBottom: document.querySelector(".mobile-menu-cta")!.getBoundingClientRect().bottom,
        }));
        expect(order.top).toBeGreaterThan(order.contactBottom);
        const pills = await group.getByRole("link").evaluateAll((links) => links.map((link) => {
          const pill = link.getBoundingClientRect();
          const icon = link.querySelector("svg")!.getBoundingClientRect();
          const label = link.querySelector("span")!.getBoundingClientRect();
          return { top: pill.top, bottom: pill.bottom, left: pill.left, right: pill.right,
            iconRight: icon.right, labelLeft: label.left };
        }));
        if (!enlarged) {
          expect(pills[0].top).toBeCloseTo(pills[1].top, 1);
          expect(pills[0].bottom).toBeCloseTo(pills[1].bottom, 1);
          expect(pills[0].right).toBeLessThan(pills[1].left);
          for (const pill of pills) expect(pill.iconRight).toBeLessThanOrEqual(pill.labelLeft);
        } else if (width <= 390) {
          expect(pills[1].top).toBeGreaterThanOrEqual(pills[0].bottom);
        }
        for (const link of await group.getByRole("link").all()) {
          await link.scrollIntoViewIfNeeded();
          await expect(link).toBeInViewport({ ratio: 1 });
          await expect(link).toHaveAttribute("target", "_blank");
          const fits = await link.evaluate((element) => {
            const pill = element.getBoundingClientRect();
            const label = element.querySelector("span")!.getBoundingClientRect();
            return label.left >= pill.left && label.right <= pill.right && pill.height >= 44;
          });
          expect(fits).toBe(true);
        }
        const facebook = group.getByRole("link", { name: /Facebook/ });
        await facebook.focus();
        await page.keyboard.press("Tab");
        await expect(menu.getByRole("link", { name: "The Friends of Ashley home", exact: true })).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(facebook).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
      });
    }
  }
}
