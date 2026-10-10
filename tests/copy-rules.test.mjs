import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const dist = path.resolve("dist");

const filesUnder = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
};

const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const pages = await Promise.all(
  (await filesUnder(dist)).filter((file) => file.endsWith(".html")).map(async (file) => {
    const html = (await readFile(file, "utf8")).replace(/<(script|style)\b[\s\S]*?<\/\1>/g, "");
    return { name: path.relative(dist, file), html };
  }),
);

const visibleText = (html) => decode(html.replace(/<textPath\b[\s\S]*?<\/textPath>/g, " ").replace(/<[^>]+>/g, " "));
const excerpt = (text, match) => text.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30).replace(/\s+/g, " ");

const eventFiles = (await readdir(path.resolve("src/content/events"))).filter((file) => file.endsWith(".json"));
const eventEmails = (await Promise.all(
  eventFiles.map(async (file) => JSON.parse(await readFile(path.resolve("src/content/events", file), "utf8")).contactEmail),
)).filter(Boolean);

// Addresses approved for public use: the shared FOA contact route, the pre-loved uniform inbox and event-specific inboxes.
const approvedEmails = new Set(["thefriendsofashley@gmail.com", "foapreloveduniform@gmail.com", ...eventEmails]);

test("the public build contains pages to check", () => {
  assert.ok(pages.length >= 15, `only ${pages.length} pages found; run the build first`);
});

test("the organisation is always 'The Friends of Ashley', never 'Friends of Ashley' alone", () => {
  const problems = [];
  for (const { name, html } of pages) {
    const text = visibleText(html);
    for (const match of text.matchAll(/(?<!The )(?<!the )Friends of Ashley/g)) problems.push(`${name}: ${excerpt(text, match)}`);
  }
  assert.deepEqual(problems, []);
});

test("page titles, descriptions and headings do not use bare FOA as the organisation name", () => {
  const problems = [];
  for (const { name, html } of pages) {
    const places = [
      ...[...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => ["title", m[1]]),
      ...[...html.matchAll(/<meta\s[^>]*?(?:name="description"|property="og:(?:title|description)")[^>]*>/g)].map((m) => ["meta", m[0].match(/content="([^"]*)"/)?.[1] ?? ""]),
      ...[...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)].map((m) => ["heading", m[1].replace(/<[^>]+>/g, " ")]),
    ];
    for (const [kind, raw] of places) {
      const text = decode(raw);
      for (const match of text.matchAll(/(?<!The )(?<!\()\bFOA\b(?!\))/g)) problems.push(`${name} ${kind}: ${excerpt(text, match)}`);
    }
  }
  assert.deepEqual(problems, []);
});

test("only approved email addresses are published, in text and in mailto links", () => {
  const problems = [];
  for (const { name, html } of pages) {
    const found = new Set([
      ...[...visibleText(html).matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)].map((m) => m[0]),
      ...[...html.matchAll(/mailto:([^"?]+)/g)].map((m) => decodeURIComponent(m[1])),
    ].map((address) => address.toLowerCase()));
    for (const address of found) if (!approvedEmails.has(address)) problems.push(`${name}: ${address}`);
  }
  assert.deepEqual(problems, []);
});
