import assert from "node:assert/strict";
import test from "node:test";
import { isHidden, relativeDayLabel, ukDateKey } from "../src/lib/event-visibility.ts";

const at = (iso) => Date.parse(iso);

test("UK date keys follow Europe/London across the clock changes", () => {
  assert.equal(ukDateKey(new Date("2026-03-28T23:30:00Z")), "2026-03-28");
  assert.equal(ukDateKey(new Date("2026-03-29T00:30:00Z")), "2026-03-29");
  assert.equal(ukDateKey(new Date("2026-06-30T23:30:00Z")), "2026-07-01");
  assert.equal(ukDateKey(new Date("2026-10-24T23:30:00Z")), "2026-10-25");
  assert.equal(ukDateKey(new Date("2026-10-25T23:30:00Z")), "2026-10-25");
  assert.equal(ukDateKey(new Date("2026-10-26T00:00:00Z")), "2026-10-26");
});

test("relative labels are Today, Tomorrow or nothing", () => {
  assert.equal(relativeDayLabel("2026-11-05", at("2026-11-03T12:00:00Z")), "");
  assert.equal(relativeDayLabel("2026-11-05", at("2026-11-04T00:00:00Z")), "Tomorrow");
  assert.equal(relativeDayLabel("2026-11-05", at("2026-11-04T23:59:00Z")), "Tomorrow");
  assert.equal(relativeDayLabel("2026-11-05", at("2026-11-05T00:00:00Z")), "Today");
  assert.equal(relativeDayLabel("2026-11-05", at("2026-11-05T23:59:00Z")), "Today");
  assert.equal(relativeDayLabel("2026-11-05", at("2026-11-06T00:00:00Z")), "");
});

test("relative labels count UK days across the autumn clock change", () => {
  assert.equal(relativeDayLabel("2026-10-26", at("2026-10-25T23:30:00Z")), "Tomorrow");
  assert.equal(relativeDayLabel("2026-10-26", at("2026-10-26T00:00:00Z")), "Today");
  assert.equal(relativeDayLabel("2026-10-25", at("2026-10-24T23:30:00Z")), "Today");
  assert.equal(relativeDayLabel("2026-10-25", at("2026-10-24T22:59:00Z")), "Tomorrow");
});

test("relative labels count UK days across the spring clock change", () => {
  assert.equal(relativeDayLabel("2026-03-29", at("2026-03-28T23:59:00Z")), "Tomorrow");
  assert.equal(relativeDayLabel("2026-03-29", at("2026-03-29T00:00:00Z")), "Today");
  assert.equal(relativeDayLabel("2026-03-30", at("2026-03-29T23:30:00Z")), "Today");
});

test("show-before hides content from the instant it is reached", () => {
  const rules = { showBefore: "2026-10-03T12:00:00.000Z" };
  assert.equal(isHidden(rules, at("2026-10-03T11:59:59Z")), false);
  assert.equal(isHidden(rules, at("2026-10-03T12:00:00Z")), true);
});

test("show-from reveals content from the instant it is reached", () => {
  const rules = { showFrom: "2026-10-03T12:00:00.000Z" };
  assert.equal(isHidden(rules, at("2026-10-03T11:59:59Z")), true);
  assert.equal(isHidden(rules, at("2026-10-03T12:00:00Z")), false);
});

test("a timed event expires at its start time", () => {
  const rules = { expiresAt: "2026-10-02T14:25:00.000Z" };
  assert.equal(isHidden(rules, at("2026-10-02T14:24:59Z")), false);
  assert.equal(isHidden(rules, at("2026-10-02T14:25:00Z")), true);
});

test("an all-day event stays until the end of its UK day, in summer and winter", () => {
  const summer = { expiresOn: "2026-07-02" };
  assert.equal(isHidden(summer, at("2026-07-01T22:59:00Z")), false);
  assert.equal(isHidden(summer, at("2026-07-01T23:00:00Z")), true);

  const clocksBack = { expiresOn: "2026-10-26" };
  assert.equal(isHidden(clocksBack, at("2026-10-25T23:59:00Z")), false);
  assert.equal(isHidden(clocksBack, at("2026-10-26T00:00:00Z")), true);

  const winter = { expiresOn: "2026-12-17" };
  assert.equal(isHidden(winter, at("2026-12-16T23:59:00Z")), false);
  assert.equal(isHidden(winter, at("2026-12-17T00:00:00Z")), true);
});

test("content with no rules is never hidden", () => {
  assert.equal(isHidden({}, at("2030-01-01T00:00:00Z")), false);
});
