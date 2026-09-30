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

test("homepage contains the primary mobile-review content", async () => {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  assert.match(homepage, /Helping Ashley children/);
  assert.match(homepage, /Fireworks on the Field/);
  assert.match(homepage, /<meta name="viewport"/);
});

test("newsletter shows the latest issue and previous issue in order", async () => {
  const newsletter = await readFile(path.join(dist, "newsletter", "index.html"), "utf8");
  assert.match(newsletter, /Autumn Term News &amp; Fireworks Tickets/);
  assert.match(newsletter, /28th September 2026/);
  assert.match(newsletter, /Welcome Back from The FOA/);
  assert.match(newsletter, /16th September 2026/);
  assert.match(newsletter, /A start-of-year introduction to The FOA, fundraising and key dates\./);
  assert.match(newsletter, /Dear Parents and Carers,/);
  assert.match(newsletter, /Welcome back! We hope you have all had a wonderful summer/);
  assert.match(newsletter, /Just coming along and showing your support really makes a difference\./);
  assert.match(newsletter, /Ways to get involved/);
  assert.match(newsletter, /Read more/);
  assert.match(newsletter, /class="newsletter-dialog"/);
  assert.match(newsletter, /class="newsletter-dialog-sections"/);
});

test("meeting minutes publishes the AGM archive entry and document", async () => {
  const minutes = await readFile(path.join(dist, "meeting-minutes", "index.html"), "utf8");
  assert.match(minutes, /Annual General Meeting/);
  assert.match(minutes, /Meeting%20Minutes%20-%20AGM%20-%2016th%20September%202026/);
  await stat(path.join(dist, "Meeting Minutes - AGM - 16th September 2026"));
});

test("JustGiving donations are linked from the footer and fundraising impact", async () => {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  const about = await readFile(path.join(dist, "about", "index.html"), "utf8");
  const justGivingUrl = "https://www.justgiving.com/charity/Friends-of-Ashley";

  assert.match(homepage, new RegExp(`href="${justGivingUrl}"`));
  assert.match(homepage, /<span>Donate<\/span><span>via JustGiving/);
  assert.match(homepage, /aria-label="Donate via JustGiving \(opens in a new tab\)"/);
  assert.match(about, new RegExp(`href="${justGivingUrl}"`));
  assert.match(about, /Last year's impact[\s\S]*Donate via JustGiving/);
});

test("Fireworks conditionally reveals its return link and shows a ticket-link placeholder", async () => {
  const fireworks = await readFile(path.join(dist, "events", "fireworks-2026", "index.html"), "utf8");
  const whatsOn = await readFile(path.join(dist, "whats-on", "index.html"), "utf8");

  assert.match(fireworks, new RegExp(`href="${basePath}/whats-on/" data-whats-on-return-path="${basePath}/whats-on/" hidden`));
  assert.match(fireworks, /Back to What's On/);
  assert.match(fireworks, /document\.referrer/);
  assert.match(fireworks, /dataset\.whatsOnReturnPath/);
  assert.match(fireworks, /window\.location\.origin/);
  assert.match(fireworks, /Ticket link to follow\./);
  assert.match(fireworks, /fireworks-1600\.jpg/);
  assert.match(whatsOn, /View event details/);
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
