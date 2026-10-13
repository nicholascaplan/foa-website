import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the newsletter uses the envelope logo on desktop, mobile and in the menu while keeping the standard letterheads and footer", async () => {
  const html = await readFile(new URL("../dist/newsletter/index.html", import.meta.url), "utf8");
  assert.match(html, /class="newsletter-logo-page"/);
  assert.doesNotMatch(html, /logo-preview|newsletter-logo-preview/);
  for (const region of [
    html.match(/<header\b[\s\S]*?<\/header>/)?.[0],
    html.match(/class="mobile-page-logo page-logo-home"[\s\S]*?<\/a>/)?.[0],
    html.match(/class="mobile-menu-home"[\s\S]*?<\/a>/)?.[0],
  ]) {
    assert.ok(region);
    assert.match(region, /src="[^"]*\/brand\/foa-logo-newsletter\.svg"/);
  }
  assert.match(html, /property="og:image" content="[^"]*\/brand\/foa-logo-newsletter-og\.png"/);
  assert.match(html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? "", /src="[^"]*\/brand\/foa-logo\.jpg"/);
  const letterheads = html.match(/class="newsletter-letterhead"[^>]*>[\s\S]*?<\/div>/g);
  assert.ok(letterheads?.length);
  for (const letterhead of letterheads) {
    assert.match(letterhead, /src="[^"]*\/brand\/foa-logo\.jpg"/);
  }
});

test("the newsletter social preview is a 1200 by 630 PNG", async () => {
  const image = await readFile(new URL("../dist/brand/foa-logo-newsletter-og.png", import.meta.url));
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test("the newsletter envelope corners are not clipped to a circle", async () => {
  const source = await readFile(new URL("../src/pages/newsletter.astro", import.meta.url), "utf8");
  const style = source.match(/\.newsletter-logo-page \.brand-logo--festive\s*\{([^}]+)\}/)?.[1];
  assert.ok(style);
  assert.match(style, /border-radius:\s*0\s*;/);
  assert.match(style, /object-fit:\s*contain\s*;/);
  assert.match(style, /transform-origin:\s*top left\s*;/);
  assert.match(style, /scale\(var\(--newsletter-logo-scale\)\)/);
});

test("newsletter artwork geometry matches the standard circle size and reserves space for the envelope", async () => {
  const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  assert.match(styles, /--newsletter-logo-scale:\s*calc\(550 \/ 380\)/);
  assert.match(styles, /--newsletter-logo-offset-x:\s*calc\(-85 \/ 380 \* 100%\)/);
  assert.match(styles, /--newsletter-logo-offset-y:\s*calc\(-29 \/ 380 \* 100%\)/);
  const source = await readFile(new URL("../src/pages/newsletter.astro", import.meta.url), "utf8");
  assert.match(source, /aspect-ratio:\s*380 \/ 483/);
});

test("the compact envelope fits within the circle's width without seams entering the logo", async () => {
  const svg = await readFile(new URL("../assets/brand/foa-logo-newsletter.svg", import.meta.url), "utf8");
  assert.match(svg, /M100 320L275 469L450 320V508H100Z/);
  assert.match(svg, /translate\(85 29\) scale\(0\.8315098468271335\)/);
  assert.ok(100 - 4 > 85, "The envelope's left outline stays inside the circle width");
  assert.ok(450 + 4 < 85 + 380, "The envelope's right outline stays inside the circle width");
  const seams = svg.match(/M100 508L([\d.]+) ([\d.]+)M450 508L([\d.]+) ([\d.]+)/);
  assert.ok(seams);
  for (const [x, y] of [[Number(seams[1]), Number(seams[2])], [Number(seams[3]), Number(seams[4])]]) {
    assert.ok(Math.hypot(x - 275, y - 219) > 190, "The seam stops outside the round logo");
  }
});
