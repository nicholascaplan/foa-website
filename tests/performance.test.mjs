import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import test from "node:test";

const dist = path.resolve("dist");
const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
const kib = 1024;
// Headroom above the October 2026 build, not target mobile load sizes.
// Tighten only after approved optimisation; don't silently raise a failing budget.
const routes = [
  { route: "/", eagerImageKiB: 850 },
  { route: "/whats-on/", eagerImageKiB: 1400 },
  ...["newsletter", "fundraising", "get-involved", "uniform", "contact"].map((name) => ({
    route: `/${name}/`, eagerImageKiB: 100,
  })),
];
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const localFile = (url) => {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return null;
  assert.ok(!base || url.startsWith(`${base}/`), `asset ${url} must respect base ${base}`);
  return path.join(dist, decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]));
};

for (const { route, eagerImageKiB } of routes) {
  test(`performance asset budgets: ${route}`, async (t) => {
    const html = await readFile(path.join(dist, route, "index.html"), "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
      .filter(([, attrs]) => attribute(` ${attrs}`, "type") !== "application/ld+json");
    const inline = scripts.filter(([, attrs]) => !attribute(` ${attrs}`, "src"))
      .map(([, , body]) => body).join("\n");
    const scriptFiles = new Set(scripts.map(([, attrs]) => localFile(attribute(` ${attrs}`, "src"))).filter(Boolean));
    const styleFiles = new Set();
    const imageFiles = new Set();
    for (const [tag] of html.matchAll(/<(?:link|img)\b[^>]*>/g)) {
      if (tag.startsWith("<img") && attribute(tag, "loading") !== "lazy") {
        const file = localFile(attribute(tag, "src"));
        if (file) imageFiles.add(file);
      }
      if (tag.startsWith("<link")) {
        const file = localFile(attribute(tag, "href"));
        if (!file) continue;
        if (attribute(tag, "rel") === "stylesheet") styleFiles.add(file);
        if (attribute(tag, "rel") === "preload" && attribute(tag, "as") === "image") imageFiles.add(file);
      }
    }
    const compressedBytes = async (files) => (await Promise.all([...files].map(async (file) => gzipSync(await readFile(file)).length)))
      .reduce((sum, bytes) => sum + bytes, 0);
    const scriptGzip = gzipSync(inline).length + await compressedBytes(scriptFiles);
    const styleGzip = await compressedBytes(styleFiles);
    const images = await Promise.all([...imageFiles].map(async (file) => ({
      asset: path.relative(dist, file), bytes: (await stat(file)).size,
    })));
    const eagerImages = images.reduce((sum, image) => sum + image.bytes, 0);
    t.diagnostic(JSON.stringify({ route, htmlBytes: Buffer.byteLength(html), scriptGzipBytes: scriptGzip,
      stylesheetGzipBytes: styleGzip, eagerImageBytes: eagerImages, images }));
    assert.ok(scriptGzip <= 4 * kib, `${route}: referenced/inline JS gzip estimate ${scriptGzip} exceeds 4 KiB`);
    assert.ok(styleGzip <= 18 * kib, `${route}: stylesheet gzip estimate ${styleGzip} exceeds 18 KiB`);
    assert.ok(eagerImages <= eagerImageKiB * kib, `${route}: eager image bytes ${eagerImages} exceed ${eagerImageKiB} KiB`);
  });
}
