import assert from "node:assert/strict";
import test from "node:test";
import { fundraisingDisplayPercent } from "../src/lib/fundraising-progress.ts";

test("early fundraising gets a modest visual lift without changing its amount", () => {
  const actual = (1457 / 25000) * 100;
  const display = fundraisingDisplayPercent(1457, 25000);
  assert.ok(display > actual);
  assert.ok(display < actual + 4);
});

test("fundraising remains empty at zero and full at or above its goal", () => {
  assert.equal(fundraisingDisplayPercent(0, 25000), 0);
  assert.equal(fundraisingDisplayPercent(25000, 25000), 100);
  assert.equal(fundraisingDisplayPercent(30000, 25000), 100);
});

test("the visual lift tapers as fundraising approaches its goal", () => {
  assert.ok(fundraisingDisplayPercent(22500, 25000) - 90 < fundraisingDisplayPercent(2500, 25000) - 10);
});
