import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const dist = path.resolve("dist");
const basePath = (process.env.BASE_PATH || "/").replace(/\/$/, "");

const filesUnder = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
};

const outputPath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split(/[?#]/, 1)[0]);
  const withoutBase = basePath && decoded.startsWith(`${basePath}/`)
    ? decoded.slice(basePath.length)
    : decoded;
  const relative = withoutBase.replace(/^\//, "");
  if (!relative || relative.endsWith("/")) return path.join(dist, relative, "index.html");
  return path.join(dist, relative);
};

const welcomeTea = JSON.parse(await readFile(path.resolve("src/content/events/welcome-tea-2026.json"), "utf8"));
const archiveFrom = new Date(welcomeTea.archiveFrom).toISOString();

test("production omits all Night Mode preview code and styles", async () => {
  const outputFiles = (await filesUnder(dist)).filter((file) => /\.(html|css|js)$/.test(file));
  for (const file of outputFiles) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /data-dev-night|data-dev-theme|foa-dev-night-mode|--night-sheet/, path.relative(dist, file));
  }
});

test("the homepage swaps the Welcome Tea poster for Fireworks at the content archive time", async () => {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  assert.match(homepage, new RegExp(`class="event-feature event-feature--poster" data-show-before="${archiveFrom}"`));
  assert.match(homepage, new RegExp(`class="event-feature event-feature--poster" data-show-from="${archiveFrom}" hidden`));
  assert.match(homepage, new RegExp(`class="event-poster-link" href="${basePath}/whats-on/"`));
});

test("What's On switches Welcome Tea from upcoming to past at the content archive time", async () => {
  const whatsOn = await readFile(path.join(dist, "whats-on", "index.html"), "utf8");
  assert.match(whatsOn, new RegExp(`data-show-before="${archiveFrom}"`));
  assert.match(whatsOn, new RegExp(`data-show-from="${archiveFrom}"`));
});

test("the homepage and Fireworks event page credit the sponsor with an accessible local logo", async () => {
  for (const page of ["index.html", "events/fireworks-2026/index.html"]) {
    const html = await readFile(path.join(dist, page), "utf8");
    assert.match(html, /class="sponsor-ribbon"/);
    assert.match(html, new RegExp(`src="${basePath}/martin-flashman.jpeg" alt="Martin Flashman and Co" width="225" height="33"`));
  }
});

test("external links communicate their destination and open safely in a new tab", async () => {
  const htmlFiles = (await filesUnder(dist)).filter((file) => file.endsWith(".html"));
  const externalLinkTags = [];
  let externalLinkIndicators = 0;

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    externalLinkTags.push(...html.matchAll(/<a\s+[^>]*href="https?:\/\/[^>]+>/g).map((match) => match[0]));
    externalLinkIndicators += html.match(/class="external-link-icon"/g)?.length ?? 0;
  }

  assert.ok(externalLinkTags.length > 0);
  for (const link of externalLinkTags) {
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
  }
  assert.ok(externalLinkIndicators >= externalLinkTags.length);
});

test("all generated internal links and assets resolve", async () => {
  const htmlFiles = (await filesUnder(dist)).filter((file) => file.endsWith(".html"));
  const missing = [];

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      if (/^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;
      const target = reference.startsWith("/")
        ? outputPath(reference)
        : path.resolve(path.dirname(file), reference.split(/[?#]/, 1)[0]);
      try {
        await stat(target);
      } catch {
        missing.push(`${path.relative(dist, file)} -> ${reference}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});
