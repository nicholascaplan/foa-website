import assert from "node:assert/strict";
import test from "node:test";
import { ordinalDateFormatter, ordinalSuffix } from "../src/lib/dates.ts";

test("ordinal suffixes follow English rules", () => {
  const expected = { 1: "st", 2: "nd", 3: "rd", 4: "th", 10: "th", 21: "st", 22: "nd", 23: "rd", 30: "th", 31: "st" };
  for (const [day, suffix] of Object.entries(expected)) assert.equal(ordinalSuffix(Number(day)), suffix, `day ${day}`);
});

test("11th, 12th and 13th (and their hundreds) use th", () => {
  for (const day of [11, 12, 13, 111, 112, 113]) assert.equal(ordinalSuffix(day), "th", `day ${day}`);
});

test("dates read as ordinals in UK English", () => {
  const format = ordinalDateFormatter({ timeZone: "Europe/London" });
  assert.equal(format("2026-12-05T12:00:00+00:00"), "5th December");
  assert.equal(format("2026-11-02T10:00:00+00:00"), "2nd November");
  assert.equal(format("2026-10-23T10:00:00+01:00"), "23rd October");
  assert.equal(format("2026-12-11T12:00:00+00:00"), "11th December");
});

test("the weekday and year options are kept", () => {
  const format = ordinalDateFormatter({ weekday: "long", year: "numeric", timeZone: "Europe/London" });
  assert.match(format("2026-12-05T12:00:00+00:00"), /^Saturday,? 5th December 2026$/);
});

test("the day is taken in the requested timezone, across British Summer Time", () => {
  const format = ordinalDateFormatter({ timeZone: "Europe/London" });
  assert.equal(format("2026-07-01T23:30:00Z"), "2nd July");
  assert.equal(format("2026-12-01T23:30:00Z"), "1st December");
});

test("Date objects are accepted as well as strings", () => {
  const format = ordinalDateFormatter({ timeZone: "Europe/London" });
  assert.equal(format(new Date("2026-11-05T19:00:00Z")), "5th November");
});
