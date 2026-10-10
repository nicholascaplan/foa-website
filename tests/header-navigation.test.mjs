import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Home shares one introduction/navigation row, while interior pages keep their compact branding", async () => {
  const homepage = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(homepage, /<header\b[^>]*class="site-header site-header--home"/);
  assert.equal(homepage.match(/<button\b[^>]*\bdata-menu-toggle(?:\s|>)/g)?.length, 1);
  assert.equal(homepage.match(/\bdata-theme-toggle(?=[\s=>])/g)?.length, 2);
  assert.match(homepage, /class="mobile-menu-theme"[\s\S]*?data-theme-toggle/);
  assert.match(homepage, /aria-label="Primary navigation"/);
  const homeHeader = homepage.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(homeHeader);
  assert.doesNotMatch(homeHeader, /class="brand"/);
  assert.match(homeHeader, /class="home-introduction"/);
  assert.equal(homepage.match(/class="home-introduction"/g)?.length, 1);

  for (const route of ["uniform/index.html", "events/fireworks-2026/index.html", "events/christmas-fayre-2026/index.html"]) {
    const html = await readFile(new URL(`../dist/${route}`, import.meta.url), "utf8");
    const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
    assert.ok(header, route);
    assert.match(header, /aria-label="Primary navigation"/, route);
    assert.equal(header.match(/\bdata-theme-toggle(?=[\s=>])/g)?.length, 1, route);
    assert.equal(html.match(/<button\b[^>]*\bdata-menu-toggle(?:\s|>)/g)?.length, 1, route);
    assert.equal(html.match(/\bdata-theme-toggle(?=[\s=>])/g)?.length, 2, route);
    assert.match(html, /class="mobile-menu-theme"[\s\S]*?data-theme-toggle/, route);
    const menuStart = html.indexOf('id="mobile-menu"');
    assert.ok(menuStart > html.indexOf("</header>"), route);
    assert.match(html.slice(menuStart), /data-theme-toggle\b/, route);
    assert.match(html, /data-header-menu-sentinel\b/, route);
  }
});

test("the homepage shows its larger introduction logo above the main headline", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const introduction = html.match(/<div\b[^>]*\bclass="home-introduction"[^>]*>[\s\S]*?<\/div>/)?.[0];
  assert.ok(introduction);
  assert.match(introduction, /The Friends of Ashley/);
  assert.match(introduction, /<img[^>]*width="160"[^>]*height="160"/);
  assert.ok(html.indexOf(introduction) < html.indexOf("<h1>"));
});

test("the footer logo links home on the homepage and interior pages", async () => {
  for (const route of ["index.html", "uniform/index.html"]) {
    const html = await readFile(new URL(`../dist/${route}`, import.meta.url), "utf8");
    assert.match(html, /<a class="footer-brand-home" href="\//, route);
  }
});
