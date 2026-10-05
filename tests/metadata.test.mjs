import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const dist = path.resolve("dist");
const siteUrl = (process.env.SITE_URL || "https://example.com").replace(/\/$/, "");
const basePath = (process.env.BASE_PATH || "/").replace(/\/$/, "");

const publicRoutes = [
  "/",
  "/whats-on/",
  "/get-involved/",
  "/uniform/",
  "/about/",
  "/fundraising/",
  "/committee/",
  "/reps/",
  "/newsletter/",
  "/meeting-minutes/",
  "/contact/",
  "/privacy/",
  "/events/fireworks-2026/",
];

const htmlFor = (route) => path.join(dist, route.replace(/^\//, ""), "index.html");
const read = (file) => readFile(file, "utf8");

const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const tagsOf = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((match) => match[0]);
const metaContent = (html, key, value) =>
  attribute(tagsOf(html, "meta").find((tag) => attribute(tag, key) === value) ?? "", "content");
const canonicalOf = (html) =>
  attribute(tagsOf(html, "link").find((tag) => attribute(tag, "rel") === "canonical") ?? "", "href");
const exists = async (file) => stat(file).then(() => true, () => false);

test("every expected public route is generated", async () => {
  const missing = [];
  for (const route of publicRoutes) {
    if (!(await exists(htmlFor(route)))) missing.push(route);
  }
  if (!(await exists(path.join(dist, "404.html")))) missing.push("/404.html");

  assert.deepEqual(missing, [], "routes missing from the build");
});

test("public pages declare language, one h1, one main landmark, a title and a description", async () => {
  const problems = [];
  for (const route of publicRoutes) {
    const html = await read(htmlFor(route));
    if (!/<html lang="en-GB"/.test(html)) problems.push(`${route}: missing lang="en-GB"`);
    if ((html.match(/<h1\b/g) ?? []).length !== 1) problems.push(`${route}: expected exactly one h1`);
    if ((html.match(/<main\b/g) ?? []).length !== 1) problems.push(`${route}: expected exactly one main`);
    if (!/<title>[^<]+\| The Friends of Ashley<\/title>|<title>The Friends of Ashley \|/.test(html)) problems.push(`${route}: title missing or off-pattern`);
    if (!metaContent(html, "name", "description")) problems.push(`${route}: missing meta description`);
  }

  assert.deepEqual(problems, []);
});

test("canonical and og:url match the deployed site URL and base path for every page", async () => {
  const problems = [];
  for (const route of publicRoutes) {
    const html = await read(htmlFor(route));
    const expected = `${siteUrl}${basePath}${route}`;
    if (canonicalOf(html) !== expected) problems.push(`${route}: canonical ${canonicalOf(html)} !== ${expected}`);
    if (metaContent(html, "property", "og:url") !== expected) problems.push(`${route}: og:url !== ${expected}`);
  }

  assert.deepEqual(problems, []);
});

test("social metadata uses the shared naming and a social image that exists", async () => {
  const problems = [];
  for (const route of publicRoutes) {
    const html = await read(htmlFor(route));
    if (metaContent(html, "property", "og:site_name") !== "The Friends of Ashley") problems.push(`${route}: og:site_name`);
    if (!metaContent(html, "property", "og:title")) problems.push(`${route}: og:title missing`);
    if (!metaContent(html, "property", "og:description")) problems.push(`${route}: og:description missing`);
    if (metaContent(html, "name", "twitter:card") !== "summary_large_image") problems.push(`${route}: twitter:card`);

    const image = metaContent(html, "property", "og:image");
    const expectedPrefix = `${siteUrl}${basePath}/`;
    if (!image?.startsWith(expectedPrefix)) {
      problems.push(`${route}: og:image ${image} does not start with ${expectedPrefix}`);
      continue;
    }
    const file = path.join(dist, decodeURIComponent(image.slice(expectedPrefix.length)));
    if (!(await exists(file))) problems.push(`${route}: og:image file not found (${image})`);
  }

  assert.deepEqual(problems, []);
});

test("robots.txt allows crawling and points to the sitemap for this site and base path", async () => {
  const robots = await read(path.join(dist, "robots.txt"));

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.doesNotMatch(robots, /^Disallow:/m);
  assert.ok(
    robots.includes(`Sitemap: ${siteUrl}${basePath}/sitemap-index.xml`),
    `robots.txt should reference ${siteUrl}${basePath}/sitemap-index.xml, got:\n${robots}`,
  );
});

test("the sitemap lists every public route once, and nothing else", async () => {
  const index = await read(path.join(dist, "sitemap-index.xml"));
  assert.ok(index.includes(`${siteUrl}${basePath}/sitemap-0.xml`), "sitemap index should reference sitemap-0.xml");

  const sitemap = await read(path.join(dist, "sitemap-0.xml"));
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
  const expected = publicRoutes.map((route) => `${siteUrl}${basePath}${route}`).sort();

  assert.deepEqual(locations, expected);
});

test("the contact playground is hidden from search engines and the sitemap", async () => {
  const playground = await read(path.join(dist, "playground.html"));
  const sitemap = await read(path.join(dist, "sitemap-0.xml"));

  assert.match(playground, /<meta name="robots" content="noindex">/);
  assert.ok(!sitemap.includes("playground"), "playground must not appear in the sitemap");
});

test("the 404 page is generated and kept out of the sitemap", async () => {
  const notFound = await read(path.join(dist, "404.html"));
  const sitemap = await read(path.join(dist, "sitemap-0.xml"));

  assert.match(notFound, /<h1\b/);
  assert.ok(!sitemap.includes("404"), "404 must not appear in the sitemap");
});

test("Fireworks Event structured data is valid and matches the event content", async () => {
  const html = await read(htmlFor("/events/fireworks-2026/"));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");

  const data = JSON.parse(blocks[0]);
  const event = JSON.parse(await read(path.resolve("src/content/events/fireworks-2026.json")));

  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Event");
  assert.equal(data.name, event.title);
  assert.equal(data.description, event.summary);
  assert.equal(new Date(data.startDate).getTime(), new Date(event.start).getTime());
  assert.equal(new Date(data.endDate).getTime(), new Date(event.end).getTime());
  assert.ok(new Date(data.endDate) > new Date(data.startDate), "event must end after it starts");
  assert.equal(data.eventAttendanceMode, "https://schema.org/OfflineEventAttendanceMode");
  assert.equal(data.location.name, event.location);
  assert.equal(data.organizer.name, "The Friends of Ashley");
  assert.equal(data.organizer.url, `${siteUrl}${basePath}/`);
  assert.ok(data.image.startsWith(`${siteUrl}${basePath}/`), "image URL should respect site URL and base path");
  assert.ok(await exists(path.join(dist, new URL(data.image).pathname.slice(basePath.length + 1))), "image file should exist");
});

test("the development-only tools are not shipped in the production build", async () => {
  for (const route of publicRoutes) {
    const html = await read(htmlFor(route));
    assert.ok(!html.includes("data-mobile-preview"), `${route} contains the mobile-preview control`);
    assert.ok(!html.includes("data-reset-cookie-preferences"), `${route} contains the cookie-reset developer control`);
    assert.ok(!html.includes("dev-tools"), `${route} contains developer tooling markup`);
  }
});
