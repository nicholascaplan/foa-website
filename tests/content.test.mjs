import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const contentDir = path.resolve("src/content");
const assetsDir = path.resolve("assets");
const dist = path.resolve("dist");

const loadCollection = async (name) => {
  const directory = path.join(contentDir, name);
  const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
  return Promise.all(files.map(async (file) => ({
    id: file.replace(/\.json$/, ""),
    data: JSON.parse(await readFile(path.join(directory, file), "utf8")),
  })));
};
const exists = (file) => stat(file).then(() => true, () => false);

test("every event ends after it starts and has a valid UK start", async () => {
  const problems = [];
  for (const { id, data } of await loadCollection("events")) {
    if (Number.isNaN(new Date(data.start).getTime())) problems.push(`${id}: invalid start`);
    if (data.end && !(new Date(data.end) > new Date(data.start))) problems.push(`${id}: end is not after start`);
  }

  assert.deepEqual(problems, []);
});

test("events that switch to past content do so after they take place", async () => {
  const problems = [];
  for (const { id, data } of await loadCollection("events")) {
    if (data.archiveFrom && new Date(data.archiveFrom) < new Date(data.start)) {
      problems.push(`${id}: archiveFrom ${data.archiveFrom} is before the event start ${data.start}`);
    }
    if (data.archive && data.archiveFrom) {
      problems.push(`${id}: archive and archiveFrom are both set, so it would be listed as both past and upcoming`);
    }
  }

  assert.deepEqual(problems, []);
});

test("event images exist and have alternative text", async () => {
  const problems = [];
  for (const { id, data } of await loadCollection("events")) {
    if (!data.image) continue;
    if (!data.imageAlt?.trim()) problems.push(`${id}: image has no imageAlt`);
    if (!(await exists(path.join(assetsDir, data.image)))) problems.push(`${id}: image file "${data.image}" not found in assets/`);
  }

  assert.deepEqual(problems, []);
});

test("event links point to generated internal pages", async () => {
  const problems = [];
  for (const { id, data } of await loadCollection("events")) {
    if (!data.path) continue;
    if (!/^\/[^?#]*\/$/.test(data.path)) {
      problems.push(`${id}: path "${data.path}" should be an internal path starting and ending with "/"`);
      continue;
    }
    if (!(await exists(path.join(dist, data.path, "index.html")))) problems.push(`${id}: no generated page for ${data.path}`);
  }

  assert.deepEqual(problems, []);
});

test("exactly one newsletter is marked latest and it is the most recently published", async () => {
  const newsletters = await loadCollection("newsletters");
  const latest = newsletters.filter(({ data }) => data.latest);

  assert.equal(latest.length, 1, `expected exactly one latest newsletter, found ${latest.map(({ id }) => id).join(", ") || "none"}`);
  for (const { id, data } of newsletters) {
    assert.ok(data.published && !Number.isNaN(new Date(data.published).getTime()), `${id}: needs a valid published date`);
    assert.ok(new Date(latest[0].data.published) >= new Date(data.published), `${id} is newer than the newsletter marked latest`);
  }
});

test("the newsletter page presents the latest issue first and archives the rest", async () => {
  const newsletters = await loadCollection("newsletters");
  const html = await readFile(path.join(dist, "newsletter", "index.html"), "utf8");
  const archiveStart = html.indexOf("Previous newsletters");
  const latestStart = html.indexOf("Latest newsletter");
  assert.ok(latestStart !== -1 && archiveStart > latestStart, "latest section should come before the archive");

  const escape = (text) => text.replaceAll("&", "&amp;");
  const latestSection = html.slice(latestStart, archiveStart);
  const archiveSection = html.slice(archiveStart);
  for (const { id, data } of newsletters) {
    const title = escape(data.title);
    if (data.latest) {
      assert.ok(latestSection.includes(title), `${id} is marked latest but is not in the latest section`);
      assert.ok(!archiveSection.includes(`>${title}<`), `${id} is latest but also appears in the archive`);
    } else {
      assert.ok(archiveSection.includes(title), `${id} should be in the archive`);
      assert.ok(!latestSection.includes(`<h2>${title}</h2>`), `${id} is not marked latest but is shown as the latest issue`);
    }
  }
});

test("committee entries have unique display order, names, roles and existing portraits", async () => {
  const members = await loadCollection("committee");
  const orders = members.map(({ data }) => data.order);
  const problems = [];

  if (new Set(orders).size !== orders.length) problems.push(`display order values are not unique: ${orders.join(", ")}`);
  for (const { id, data } of members) {
    if (!data.name?.trim()) problems.push(`${id}: missing name`);
    if (!data.role?.trim()) problems.push(`${id}: missing role`);
    if (!(await exists(path.join(assetsDir, data.portrait)))) problems.push(`${id}: portrait "${data.portrait}" not found in assets/`);
  }

  assert.deepEqual(problems, []);
});

test("committee pages show names and roles only, with no personal contact details", async () => {
  const members = await loadCollection("committee");
  const html = await readFile(path.join(dist, "committee", "index.html"), "utf8");

  for (const { data } of members) {
    assert.ok(html.includes(data.name), `${data.name} should be on the committee page`);
    assert.ok(html.includes(data.role), `${data.role} should be on the committee page`);
  }
  const mailtoTargets = [...html.matchAll(/href="mailto:([^"?]+)/g)].map((match) => match[1]);
  assert.ok(mailtoTargets.length > 0);
  for (const address of mailtoTargets) {
    assert.equal(address, "thefriendsofashley@gmail.com", "only the shared FOA contact route may be linked");
  }
});
