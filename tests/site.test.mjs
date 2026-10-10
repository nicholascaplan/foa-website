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
  assert.match(html, /<div[^>]*data-fw-stage[^>]*data-fw-paused/);
  assert.match(html, /<canvas[^>]*data-fw-sky[^>]*width="0"[^>]*height="0"/);
  assert.doesNotMatch(html, /data-fw-mode|Immersive/);
  assert.doesNotMatch(html, /fireworks-poster\.jpg|ferris wheel/i);
  for (const fact of ["no on-site parking", "Harmony Centre", "St John Ambulance", "Event closes", "cash or card", "subject to availability"]) {
    assert.ok(html.includes(fact), `Missing guide fact: ${fact}`);
  }
});

test("the immersive Fireworks page keeps its social image without preloading the unused photograph", async () => {
  const html = await readFile(path.join(dist, "events/fireworks-2026/index.html"), "utf8");
  assert.doesNotMatch(html, /<link\b[^>]*rel="preload"[^>]*fireworks-1600\.jpg/);
  assert.match(html, /<meta\b[^>]*property="og:image"[^>]*fireworks-1600\.jpg/);
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

test("navigation exposes the menu on Home and both menus on interior pages", async () => {
  for (const route of ["index.html", "fundraising/index.html"]) {
    const html = await readFile(path.join(dist, route), "utf8");
    const labels = route === "index.html" ? ["Mobile navigation"] : ["Primary navigation", "Mobile navigation"];
    for (const label of labels) {
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

test("production ships the responsive Night Mode theme but none of the local development tools", async () => {
  const outputFiles = (await filesUnder(dist)).filter((file) => /\.(html|css|js)$/.test(file));
  let themeStyles = false;
  for (const file of outputFiles) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /data-dev-|foa-dev-night-mode/, path.relative(dist, file));
    // Dev tool CSS is bundled with the header component, so only markup and scripts are checked for the tools themselves.
    if (!/\.css$/.test(file)) {
      // Component styles are inlined on the standalone playground; only the rendered tool markup/scripts are forbidden.
      const markupAndScripts = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
      assert.doesNotMatch(markupAndScripts, /dev-tools|data-mobile-preview/, path.relative(dist, file));
    }
    if (/\.css$/.test(file) && /data-theme=["']?night/.test(content)) themeStyles = true;
  }
  assert.ok(themeStyles, "the Night Mode stylesheet is built");
  for (const page of ["index.html", "404.html", "uniform/index.html"]) {
    const html = await readFile(path.join(dist, page), "utf8");
    assert.equal(html.match(/data-theme-initializer/g)?.length, 1, page);
    const expectedToggles = page === "index.html" ? 1 : 2;
    assert.equal(html.match(/data-theme-toggle(?!\])/g)?.length, expectedToggles, page);
    if (page === "index.html") {
      assert.doesNotMatch(html, /<header\b[^>]*class="site-header"/, `${page} has no branded header`);
      assert.match(html, /class="mobile-menu-theme"[\s\S]*?data-theme-toggle/, `${page} places Night Mode in the menu`);
    } else {
      assert.match(html, /<header\b[\s\S]*?data-theme-toggle[\s\S]*?<\/header>/, `${page} keeps the desktop control in the header`);
      assert.match(html, /class="mobile-menu-theme"[\s\S]*?data-theme-toggle/, `${page} keeps the mobile control in the menu`);
    }
    assert.ok(html.indexOf("data-theme-initializer") < html.indexOf("<body"), `${page} sets the theme before the body`);
  }
});

test("the homepage omits the recruitment notice and every footer logo links home", async () => {
  const html = await readFile(path.join(dist, "index.html"), "utf8");
  assert.doesNotMatch(html, /class="notice-strip"/);
  const htmlFiles = (await filesUnder(dist)).filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) {
    if (path.basename(file) === "playground.html") continue;
    const page = await readFile(file, "utf8");
    if (!page.includes('<footer class="site-footer">')) continue;
    const logo = page.match(/<a class="footer-brand-home" href="([^"]+)"/);
    assert.ok(logo, path.relative(dist, file));
    assert.equal(logo[1], `${basePath}/`, path.relative(dist, file));
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

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
const christmas = JSON.parse(await readFile(path.resolve("src/content/events/christmas-fayre-2026.json"), "utf8"));
const fireworks = JSON.parse(await readFile(path.resolve("src/content/events/fireworks-2026.json"), "utf8"));

test("the Christmas Fayre page lists every help area from the event record", async () => {
  const html = await readFile(path.join(dist, "events/christmas-fayre-2026/index.html"), "utf8");
  const areas = [...html.matchAll(/<li class="xmas-area">[\s\S]*?<span>([^<]*)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(areas, christmas.helpAreas.map((area) => escapeHtml(area.name)));
  assert.equal(areas.length, 7);
});

test("the Christmas Fayre page uses the Fayre inbox for every sign-up link, with a clear subject", async () => {
  const html = await readFile(path.join(dist, "events/christmas-fayre-2026/index.html"), "utf8");
  const links = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map((match) => match[1]);
  assert.equal(links.length, 2);
  for (const link of links) {
    assert.equal(link, `mailto:${christmas.contactEmail}?subject=Helping%20at%20the%20Christmas%20Fayre`);
  }
  assert.equal([...html.matchAll(/>Email the Fayre team <span/g)].length, 2);
});

test("the Christmas Fayre page keeps reminders in a plain list, separate from the help areas", async () => {
  const html = await readFile(path.join(dist, "events/christmas-fayre-2026/index.html"), "utf8");
  const notes = html.match(/<div class="xmas-notes">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.match(notes, /<h3>Good to know<\/h3>/);
  assert.equal([...notes.matchAll(/<li>/g)].length, 3);
  for (const reminder of ["Join in anywhere", "Bring a friend", "No experience needed"]) assert.match(notes, new RegExp(reminder));
  assert.doesNotMatch(notes, /xmas-area/);
});

test("the Christmas Fayre page shows the date, place and lead from the event record, with decoration hidden from assistive technology", async () => {
  const html = await readFile(path.join(dist, "events/christmas-fayre-2026/index.html"), "utf8");
  assert.match(html, /<dd><span class="xmas-nowrap">Saturday 5th December,<\/span> <span class="xmas-nowrap">12:00<\/span><\/dd>/);
  assert.match(html, new RegExp(`<dd>${christmas.location}</dd>`));
  assert.match(html, new RegExp(`<dd>${christmas.lead}</dd>`));
  assert.equal([...html.matchAll(/<ul class="xmas-baubles" aria-hidden="true">/g)].length, 1);
  assert.equal([...html.matchAll(/<li style="--i:\d+;/g)].length, 20);
  assert.equal([...html.matchAll(/<i style="--x:/g)].length, 28);
  assert.match(html, /<div class="xmas-snow" aria-hidden="true">/);
});

test("the Fireworks volunteering page shows every role, shift and sign-up link from the event record", async () => {
  const html = await readFile(path.join(dist, "fireworks-volunteering/index.html"), "utf8");
  assert.equal([...html.matchAll(/<li class="vol-card">/g)].length, fireworks.volunteerRoles.length);
  for (const role of fireworks.volunteerRoles) {
    const card = html.split('<li class="vol-card">').find((part) => part.includes(`<h3>${escapeHtml(role.name)}</h3>`));
    assert.ok(card, `no card for ${role.name}`);
    assert.match(card, new RegExp(`vol-card__group">${escapeHtml(role.group)}<`));
    assert.ok(card.includes(escapeHtml(role.dates)), `${role.name}: dates`);
    assert.ok(card.includes(escapeHtml(role.description)), `${role.name}: description`);
    for (const shift of role.shifts) {
      assert.ok(card.includes(`<dt>${escapeHtml(shift.label)}</dt>`), `${role.name}: ${shift.label} label`);
      assert.ok(card.includes(escapeHtml(shift.when)), `${role.name}: ${shift.label} time`);
      assert.match(card, new RegExp(`${shift.helpers} ${shift.helpers === 1 ? "helper" : "helpers"} per (?:slot|shift)`));
    }
    assert.ok(card.includes(`href="${role.url}"`), `${role.name}: sign-up link`);
  }
});

test("Fireworks volunteering sign-ups go to Volunteer Sign Up, open safely in a new tab and say so", async () => {
  const html = await readFile(path.join(dist, "fireworks-volunteering/index.html"), "utf8");
  const links = [...html.matchAll(/<a class="button button--amber vol-card__action"[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
  assert.equal(links.length, fireworks.volunteerRoles.length);
  for (const link of links) {
    assert.match(link, /href="https:\/\/volunteersignup\.org\/[A-Za-z0-9]+"/);
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
    assert.match(link, /\(opens Volunteer Sign Up in a new tab\)/);
  }
  const urls = fireworks.volunteerRoles.map((role) => role.url);
  assert.equal(new Set(urls).size, urls.length, "each role has its own sign-up link");
});

test("Fireworks volunteering links back to the event page and never asks for personal details", async () => {
  const html = await readFile(path.join(dist, "fireworks-volunteering/index.html"), "utf8");
  assert.ok(html.includes(`href="${basePath}${fireworks.path}"`));
  assert.doesNotMatch(html, /<form|<input|type="tel"/);
});
