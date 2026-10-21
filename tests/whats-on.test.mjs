import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("What's On initially hides every empty upcoming month and its empty term", async () => {
  const html = await readFile(new URL("../dist/whats-on/index.html", import.meta.url), "utf8");
  const hidden = (tag) => /\shidden(?:\s|>|=)/.test(tag);
  const terms = [...html.matchAll(/(<section\b[^>]*data-yearview-term[^>]*>)([\s\S]*?)<\/section>/g)];
  assert.equal(terms.length, 3);
  for (const [, termTag, contents] of terms) {
    const months = [...contents.matchAll(/<div\b[^>]*data-month-key="([^"]+)"[^>]*>/g)];
    let visibleMonths = 0;
    for (const [index, month] of months.entries()) {
      const rows = contents.slice(month.index, months[index + 1]?.index ?? contents.length);
      const hasUpcoming = [...rows.matchAll(/<(?:article|a)\b[^>]*class="event-list-item"[^>]*>/g)]
        .some(([tag]) => !hidden(tag));
      assert.equal(hidden(month[0]), !hasUpcoming, month[1]);
      if (hasUpcoming) visibleMonths++;
    }
    assert.equal(hidden(termTag), visibleMonths === 0);
  }
  assert.doesNotMatch(html, /data-empty-note|No more events listed this month/);
});
