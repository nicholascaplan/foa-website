import assert from "node:assert/strict";
import test from "node:test";
import { largestHeadingSize } from "../src/lib/heading-fit.ts";

test("heading fitting approaches the largest size without crossing a line-break boundary", () => {
  const boundary = 29.375;
  const size = largestHeadingSize(24, 48, (candidate) => candidate <= boundary);
  assert.ok(size <= boundary);
  assert.ok(boundary - size <= 0.1);
});

test("heading fitting uses the upper size when the original wrapping still fits", () => {
  assert.equal(largestHeadingSize(26, 48, () => true), 48);
});

test("heading fitting never shrinks the readable baseline", () => {
  assert.equal(largestHeadingSize(28, 48, () => false), 28);
  assert.equal(largestHeadingSize(56, 48, () => false), 56);
});

test("heading fitting recalculates from the baseline after the available width changes", () => {
  const narrow = largestHeadingSize(24, 48, (candidate) => candidate <= 25);
  const wide = largestHeadingSize(24, 48, (candidate) => candidate <= 34);
  assert.ok(narrow <= 25);
  assert.ok(wide > narrow);
  assert.ok(wide <= 34);
});
