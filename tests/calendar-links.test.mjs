import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleCalendarUrl } from "../src/lib/calendar-links.ts";

const fayre = {
  title: "Christmas Fayre",
  summary: "Led by Rachel Briscoe (Squirrel and Otter) and Sophie Glass (Fox).",
  location: "Ashley School, Ashley Road, Walton-on-Thames KT12 1HX",
  start: new Date("2026-12-05T12:00:00+00:00"),
  end: new Date("2026-12-05T15:00:00+00:00"),
  url: "https://www.thefriendsofashley.org/events/christmas-fayre-2026/",
};

const read = (href) => {
  const url = new URL(href);
  return { url, params: url.searchParams };
};

test("a timed event with a confirmed end links Google to the exact UTC range", () => {
  const href = buildGoogleCalendarUrl(fayre);
  const { url, params } = read(href);
  assert.equal(`${url.origin}${url.pathname}`, "https://calendar.google.com/calendar/render");
  assert.equal(params.get("action"), "TEMPLATE");
  assert.equal(params.get("text"), "Christmas Fayre");
  assert.equal(params.get("dates"), "20261205T120000Z/20261205T150000Z");
  assert.equal(params.get("ctz"), "Europe/London");
  assert.equal(params.get("details"), "Led by Rachel Briscoe (Squirrel and Otter) and Sophie Glass (Fox).\n\nDetails: https://www.thefriendsofashley.org/events/christmas-fayre-2026/");
  assert.equal(params.get("location"), fayre.location);
});

test("British Summer Time starts convert to the exact UTC instant", () => {
  const bst = { ...fayre, start: new Date("2026-10-03T13:00:00+01:00"), end: new Date("2026-10-03T14:30:00+01:00") };
  assert.match(buildGoogleCalendarUrl(bst), /dates=20261003T120000Z%2F20261003T133000Z/);
});

test("a timed event without a confirmed end offers no service links rather than inventing a duration", () => {
  const noEnd = { ...fayre, end: undefined };
  assert.equal(buildGoogleCalendarUrl(noEnd), null);
});

test("an all-day event uses the UK calendar date with an exclusive end date", () => {
  const grotto = { ...fayre, allDay: true, end: undefined, start: new Date("2026-12-14T00:00:00+00:00") };
  const google = read(buildGoogleCalendarUrl(grotto)).params;
  assert.equal(google.get("dates"), "20261214/20261215");
  assert.equal(google.get("ctz"), null);
});

test("a BST-midnight all-day event stays on the same UK date", () => {
  // Happy Bags April 2027 starts at midnight BST (23:00 UTC the day before).
  const bags = { ...fayre, allDay: true, end: undefined, start: new Date("2027-04-26T00:00:00+01:00") };
  const google = read(buildGoogleCalendarUrl(bags)).params;
  assert.equal(google.get("dates"), "20270426/20270427");
});
