import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the header is the only location for Night Mode and the menu keeps one trigger", async () => {
  for (const route of ["index.html", "uniform/index.html", "events/fireworks-2026/index.html", "events/christmas-fayre-2026/index.html"]) {
    const html = await readFile(new URL(`../dist/${route}`, import.meta.url), "utf8");
    const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
    assert.ok(header, route);
    assert.equal(header.match(/data-theme-toggle\b/g)?.length, 1, route);
    assert.equal(html.match(/<button\b[^>]*\bdata-menu-toggle(?:\s|>)/g)?.length, 1, route);
    const menuStart = html.indexOf('id="mobile-menu"');
    assert.ok(menuStart > html.indexOf("</header>"), route);
    assert.doesNotMatch(html.slice(menuStart), /data-theme-toggle\b/, route);
    assert.match(html, /data-header-menu-sentinel\b/, route);
  }
});

test("the homepage shows its larger introduction logo above the main headline", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const introduction = html.match(/<div class="home-introduction">[\s\S]*?<\/div>/)?.[0];
  assert.ok(introduction);
  assert.match(introduction, /The Friends of Ashley/);
  assert.match(introduction, /<img[^>]*width="160"[^>]*height="160"/);
  assert.ok(html.indexOf(introduction) < html.indexOf("<h1>"));
});
