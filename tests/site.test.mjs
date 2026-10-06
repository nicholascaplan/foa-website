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
const appeal = JSON.parse(await readFile(path.resolve("src/content/fundraising/current-appeal.json"), "utf8"));
const money = (value) => `£${value.toLocaleString("en-GB")}`;

test("Fireworks defaults to immersive experience with shared guide facts and no poster", async () => {
  const html = await readFile(path.join(dist, "events/fireworks-2026/index.html"), "utf8");
  assert.match(html, /<body[^>]*fw-theme/);
  assert.doesNotMatch(html, /data-fw-mode|Immersive/);
  assert.doesNotMatch(html, /fireworks-poster\.jpg|ferris wheel/i);
  for (const fact of ["no on-site parking", "Harmony Centre", "St John Ambulance", "Event closes", "cash or card", "subject to availability"]) {
    assert.ok(html.includes(fact), `Missing guide fact: ${fact}`);
  }
});

test("Get Involved exposes the AGM volunteer teams and shared enquiry route", async () => {
  const html = await readFile(path.join(dist, "get-involved/index.html"), "utf8");
  for (const role of ["Pre-loved uniform sales", "Quartermasters", "Event comperes", "Eco Stall lead", "Fireworks shadowing", "Lead a community event"]) {
    assert.ok(html.includes(`<h3>${role}`), `Missing volunteer team: ${role}`);
  }
  assert.match(html, /Summer Fete and Big Picnic/);
  assert.match(html, /Plans and dates are still to be confirmed/);
  assert.doesNotMatch(html, /Could you help lead an event\?|Not ready to lead\?/);
  assert.ok(html.includes('href="mailto:thefriendsofashley@gmail.com?subject=Volunteering%20with%20The%20FOA"'));
  for (const route of ["uniform", "reps"]) {
    assert.ok(html.includes(`href="${basePath}/${route}/"`));
  }
});

test("Reps Hub puts shareable messages first and preserves ticket links and sale timings when copied", async () => {
  const html = await readFile(path.join(dist, "reps/index.html"), "utf8");
  assert.ok(html.indexOf('class="message-grid"') < html.indexOf('id="reps-role-title"'));
  const cards = [...html.matchAll(/<article class="message-card">([\s\S]*?)<\/article>/g)].map((match) => match[1]);
  assert.equal(cards.length, 3);
  const fireworks = JSON.parse(await readFile(path.resolve("src/content/events/fireworks-2026.json"), "utf8"));
  const uniform = JSON.parse(await readFile(path.resolve("src/content/events/uniform-november-2026.json"), "utf8"));
  assert.ok(cards[0].includes(`href="${fireworks.ticketUrl}"`));
  assert.ok(cards[0].includes("Buy Fireworks tickets"));
  assert.ok(cards[0].match(/data-copy-text="([^"]*)"/)?.[1].includes(`Tickets: ${fireworks.ticketUrl}`));
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  const range = `${time.format(new Date(uniform.start))}–${time.format(new Date(uniform.end))}`;
  assert.ok(cards[1].match(/data-copy-text="([^"]*)"/)?.[1].includes(range));
  for (const date of [uniform.start, uniform.end]) {
    assert.ok(cards[1].includes(`datetime="${new Date(date).toISOString()}"`));
  }
  assert.ok(!cards[2].includes('class="message-time"'));
});

test("Fundraising appears after What's On in both navigation menus", async () => {
  for (const route of ["index.html", "fundraising/index.html"]) {
    const html = await readFile(path.join(dist, route), "utf8");
    for (const label of ["Primary navigation", "Mobile navigation"]) {
      const nav = html.match(new RegExp(`<nav[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)<\\/nav>`))?.[1];
      assert.ok(nav);
      const destinations = [...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
      const expected = ["/", "/newsletter/", "/whats-on/", "/fundraising/", "/get-involved/", "/uniform/"];
      if (label === "Mobile navigation") expected.push("/contact/");
      assert.deepEqual(destinations, expected.map((destination) => `${basePath}${destination}`));
      if (route.startsWith("fundraising/")) {
        assert.match(nav, /href="[^"]*\/fundraising\/" aria-current="page"/);
      }
    }
  }
});

test("fundraising uses shared totals, approved estimates and annual support", async () => {
  const html = await readFile(path.join(dist, "fundraising/index.html"), "utf8");
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  const about = await readFile(path.join(dist, "about/index.html"), "utf8");
  const raised = appeal.sources.reduce((sum, { amount }) => sum + amount, 0);
  const planned = appeal.priorities.reduce((sum, { estimate }) => sum + estimate, 0);
  for (const page of [html, homepage]) {
    assert.ok(page.includes(money(raised)));
    assert.ok(page.includes(money(appeal.target)));
    assert.ok(page.includes(`aria-valuenow="${Math.min(raised, appeal.target)}"`));
  }
  for (const page of [homepage, about]) {
    assert.ok(page.includes(`href="${basePath}/fundraising/"`));
  }
  const homepageBand = homepage.match(/<section class="fundraising-update"[\s\S]*?<\/section>/)?.[0];
  assert.ok(homepageBand);
  assert.doesNotMatch(homepageBand, /Donate via JustGiving/);
  for (const page of [html, about]) assert.ok(page.includes(money(appeal.previousYear.raised)));
  for (const { label, amount } of appeal.sources) {
    assert.ok(html.includes(label));
    assert.ok(html.includes(money(amount)));
  }
  for (const { title, estimate } of appeal.priorities) {
    assert.ok(html.includes(title));
    assert.ok(html.includes(money(estimate)));
  }
  assert.ok(html.includes(money(planned)));
  // Astro escapes apostrophes in text nodes; compare visible copy, not its encoding.
  const visibleCopy = html.replace(/&#(?:39|x27);/gi, "'");
  for (const { title, items } of appeal.annualSupport) {
    assert.ok(visibleCopy.includes(title));
    for (const { label } of items) assert.ok(visibleCopy.includes(label));
  }
  assert.ok(html.includes(`datetime="${appeal.updated}"`));
  assert.doesNotMatch(html, /gross income/i);
});

test("production omits all Night Mode preview code and styles", async () => {
  const outputFiles = (await filesUnder(dist)).filter((file) => /\.(html|css|js)$/.test(file));
  for (const file of outputFiles) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /data-dev-night|data-dev-theme|foa-dev-night-mode|--night-sheet/, path.relative(dist, file));
  }
});

test("the homepage shows Fireworks in the initial HTML without Welcome Tea or date switching", async () => {
  const homepage = await readFile(path.join(dist, "index.html"), "utf8");
  assert.match(homepage, /<article class="event-feature event-feature--poster">/);
  assert.match(homepage, /<h2>Fireworks on the Field<\/h2>/);
  assert.match(homepage, new RegExp(`rel="preload" as="image" href="${basePath}/events/fireworks-1600.jpg"`));
  assert.doesNotMatch(homepage, /Welcome Tea|welcome-tea|data-show-before|data-show-from/);
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
    assert.match(html, new RegExp(`src="${basePath}/sponsors/martin-flashman.jpeg" alt="Martin Flashman and Co" width="225" height="33"`));
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
