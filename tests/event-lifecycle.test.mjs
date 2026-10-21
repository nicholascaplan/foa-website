import assert from "node:assert/strict";
import test from "node:test";
import { eventVisibilityRules } from "../src/lib/event-lifecycle.ts";
import { isHidden } from "../src/lib/event-visibility.ts";
import { academicMonths, academicYearLabel, syncYearView } from "../src/lib/academic-year.ts";

const event = { start: new Date("2026-11-05T16:30:00Z"), end: new Date("2026-11-05T18:30:00Z") };
const assertBoundary = (timing, boundary) => {
  for (const offset of [-1, 0, 1]) {
    const now = Date.parse(boundary) + offset;
    assert.equal(isHidden(eventVisibilityRules(timing), now), offset >= 0);
    assert.equal(isHidden(eventVisibilityRules(timing, true), now), offset < 0);
  }
};

test("timed events remain current until their end, falling back to the start", () => {
  assertBoundary(event, event.end.toISOString());
  assertBoundary({ start: event.start }, event.start.toISOString());
});

test("explicit archive overrides take precedence over end and all-day rules", () => {
  assertBoundary({ ...event, allDay: true, archiveFrom: event.start }, event.start.toISOString());
  const archived = { ...event, archive: true };
  assert.equal(isHidden(eventVisibilityRules(archived), event.start.getTime() - 1000), true);
  assert.equal(isHidden(eventVisibilityRules(archived, true), event.start.getTime() - 1000), false);
});

test("all-day events switch at UK midnight including both daylight-saving transitions", () => {
  for (const [start, boundary] of [
    ["2027-01-13T00:00:00Z", "2027-01-14T00:00:00Z"],
    ["2027-06-30T23:00:00Z", "2027-07-01T23:00:00Z"],
    ["2027-03-28T00:00:00Z", "2027-03-28T23:00:00Z"],
    ["2026-10-24T23:00:00Z", "2026-10-26T00:00:00Z"],
  ]) assertBoundary({ start: new Date(start), allDay: true }, boundary);
});

test("academic months use UK dates, sort events and derive year labels", () => {
  const july = { start: new Date("2027-06-30T23:30:00Z") };
  const outside = { start: new Date("2027-09-01T00:00:00Z") };
  const months = academicMonths([july, event, outside]);
  assert.equal(months.length, 12);
  assert.equal(months[0].key, "2026-09");
  assert.equal(months.at(-1).key, "2027-08");
  assert.deepEqual(months.find((month) => month.key === "2027-07").events, [july]);
  assert.deepEqual(months.find((month) => month.key === "2027-06").events, []);
  assert.equal(academicYearLabel(2029), "2029/30");
  assert.equal(academicMonths([], 2029)[4].key, "2030-01");
});

test("year-view section updates cover empty months, hidden terms and the end of the year without moving nodes", () => {
  const month = (key, hasEvents) => {
    const controls = { "[data-current-chip]": {}, ".event-list": {} };
    return { dataset: { monthKey: key }, controls, hidden: false,
      querySelector: (selector) => selector === ".event-list-item:not([hidden])" ? (hasEvents ? {} : null) : controls[selector] };
  };
  const january = month("2027-01", false);
  const february = month("2027-02", false);
  const april = month("2027-04", true);
  const term = (months) => ({ hidden: false, querySelector: () => months.find((month) => !month.hidden) });
  const spring = term([january, february]);
  const summer = term([april]);
  const archiveMonth = { hidden: true, querySelector: () => ({}) };
  const archive = { hidden: true, querySelector: () => ({}) };
  const empty = { hidden: false };
  const root = {
    querySelectorAll: (selector) => ({
      "[data-month-key]": [january, february, april],
      "[data-yearview-term]": [spring, summer],
      "[data-earlier-month]": [archiveMonth],
    })[selector],
    querySelector: (selector) => ({ "[data-past-events-section]": archive, "[data-yearview-empty]": empty,
      "[data-yearview-term] .event-list-item:not([hidden])": {} })[selector],
  };
  syncYearView(Date.parse("2027-02-01T12:00:00Z"), root);
  assert.equal(january.hidden, true);
  assert.equal(february.hidden, true);
  assert.equal(february.controls["[data-current-chip]"].hidden, false);
  assert.equal(february.controls[".event-list"].hidden, true);
  assert.equal(april.hidden, false);
  assert.equal(spring.hidden, true);
  assert.equal(summer.hidden, false);
  assert.equal(archive.hidden, false);
  assert.equal(archiveMonth.hidden, false);
  assert.equal(empty.hidden, true);
  // Empty list controls are still present even when rows have expired.
  april.querySelector = (selector) => selector === ".event-list-item:not([hidden])" ? null : april.controls[selector];
  const originalQuery = root.querySelector;
  root.querySelector = (selector) => selector.startsWith("[data-yearview-term]") ? null : originalQuery(selector);
  syncYearView(Date.parse("2027-09-01T12:00:00Z"), root);
  assert.equal(spring.hidden, true);
  assert.equal(summer.hidden, true);
  assert.equal(empty.hidden, false);
});
