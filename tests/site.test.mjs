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
  assert.match(homepage, /Welcome Tea poster:/);
  assert.match(homepage, /Upcoming event/);
  assert.match(homepage, /Welcome Tea/);
  assert.match(homepage, /Fireworks on the Field/);
  assert.match(homepage, /class="event-feature event-feature--poster" data-show-before="2026-10-03T12:00:00.000Z"/);
  assert.match(homepage, new RegExp(`class="event-poster-link" href="${basePath}/whats-on/"`));
  assert.match(homepage, /class="event-feature" data-show-from="2026-10-03T12:00:00.000Z" hidden/);
  assert.match(homepage, new RegExp(`<img src="${basePath}/welcome%20tea\\.png" alt="Welcome Tea poster:`));
  assert.doesNotMatch(homepage, /data-event-carousel|data-carousel-progress|data-carousel-slide/);
  assert.match(homepage, /<meta name="viewport"/);
  assert.match(homepage, new RegExp(`<link rel="icon" href="${basePath}/favicon\\.svg" type="image/svg\\+xml">`));
  assert.match(homepage, new RegExp(`<link rel="icon" href="${basePath}/favicon\\.png" type="image/png">`));
  await stat(path.join(dist, "favicon.svg"));
  await stat(path.join(dist, "favicon.png"));
});

test("What's On includes the date-driven Welcome Tea transition", async () => {
  const whatsOn = await readFile(path.join(dist, "whats-on", "index.html"), "utf8");
  const stylesheetPath = whatsOn.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
  assert.ok(stylesheetPath, "What's On should include a stylesheet");
  const stylesheet = await readFile(outputPath(stylesheetPath), "utf8");
  assert.match(whatsOn, /data-show-before="2026-10-03T12:00:00.000Z"/);
  assert.match(whatsOn, /data-show-from="2026-10-03T12:00:00.000Z"/);
  assert.match(whatsOn, /Pre-loved uniform sale/);
  assert.match(whatsOn, /Friday 2 October, 15:25 · School playground/);
  assert.match(whatsOn, /A chance for new Ashley families to meet one another and enjoy tea and cake/);
  assert.match(whatsOn, /Europe\/London/);
  assert.match(stylesheet, /\[hidden\]\{display:none!important\}/);
  assert.match(stylesheet, /\.event-feature--poster\{/);
  assert.match(stylesheet, /\.event-poster-link\{/);
  assert.doesNotMatch(stylesheet, /\.event-carousel-slides/);
});

test("newsletter shows the latest issue and previous issue in order", async () => {
  const newsletter = await readFile(path.join(dist, "newsletter", "index.html"), "utf8");
  assert.match(newsletter, /Autumn Term News &amp; Fireworks Tickets/);
  assert.match(newsletter, /Sent on Friday 2nd October/);
  assert.match(newsletter, /Welcome Back from The FOA/);
  assert.match(newsletter, /Wednesday 16th September/);
  assert.match(newsletter, /aria-expanded="false"[^>]*aria-controls="newsletter-back-to-school-2026-more"|aria-controls="newsletter-back-to-school-2026-more"[^>]*aria-expanded="false"/);
  assert.match(newsletter, /id="newsletter-back-to-school-2026-more" hidden/);
  assert.match(newsletter, /Pre-loved Uniform Sales: 3:25pm, School Playground/);
  assert.match(newsletter, /Design Tips:<\/strong> Draw on the blank side only/);
  assert.match(newsletter, /Dear Parents and Carers,/);
  assert.match(newsletter, /Welcome back! We hope you’ve all had a wonderful summer/);
  assert.match(newsletter, /just coming along and showing your support really makes a difference\./);
  assert.match(newsletter, /Call for Event Leads:/);
  assert.match(newsletter, /Mrs Ratcliff/);
  assert.match(newsletter, /The FOA Team/);
  assert.match(newsletter, /Read more/);
  assert.match(newsletter, /class="newsletter-more"/);
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

test("the school website is linked from the footer", async () => {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  const schoolUrl = "https://www.ashleyschool.org.uk/";

  assert.match(homepage, new RegExp(`href="${schoolUrl}"`));
  assert.match(homepage, /aria-label="Visit Ashley School website \(opens in a new tab\)"/);
});

test("privacy notice covers contact handling and consented Google Analytics", async () => {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  const privacy = await readFile(path.join(dist, "privacy", "index.html"), "utf8");

  assert.match(homepage, new RegExp(`href="${basePath}/privacy/"`));
  assert.match(privacy, /Website enquiries/);
  assert.match(privacy, /Google Analytics/);
  assert.match(privacy, /Allow analytics cookies/);
  assert.match(privacy, /Cookie preferences/);
  assert.match(privacy, /Google's Privacy Policy/);
  assert.match(homepage, /G-V2X8ZMQ5XZ/);
  assert.match(homepage, /data-google-analytics/);
  assert.match(homepage, /analytics_storage/);
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
