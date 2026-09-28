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
