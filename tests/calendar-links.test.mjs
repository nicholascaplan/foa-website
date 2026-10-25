import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleCalendarUrl, buildOutlookCalendarUrl } from "../src/lib/calendar-links.ts";

const fayre = {
  title: "Christmas Fayre",
  summary: "Led by Rachel Briscoe (Squirrel and Otter) and Sophie Glass (Fox).",
  location: "Ashley School, Ashley Road, Walton-on-Thames KT12 1HX",
  start: new Date("2026-12-05T12:00:00+00:00"),
  end: new Date("2026-12-05T16:00:00+00:00"),
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
  assert.equal(params.get("dates"), "20261205T120000Z/20261205T160000Z");
  assert.equal(params.get("ctz"), "Europe/London");
  assert.equal(params.get("details"), "Led by Rachel Briscoe (Squirrel and Otter) and Sophie Glass (Fox).\n\nDetails: https://www.thefriendsofashley.org/events/christmas-fayre-2026/");
  assert.equal(params.get("location"), fayre.location);
});

test("a timed event with a confirmed end links Outlook to the exact UTC range", () => {
  const href = buildOutlookCalendarUrl(fayre);
  const { url, params } = read(href);
  assert.equal(`${url.origin}${url.pathname}`, "https://outlook.live.com/calendar/0/deeplink/compose");
  assert.equal(params.get("path"), "/calendar/action/compose");
  assert.equal(params.get("rru"), "addevent");
  assert.equal(params.get("startdt"), "2026-12-05T12:00:00Z");
  assert.equal(params.get("enddt"), "2026-12-05T16:00:00Z");
  assert.equal(params.get("subject"), "Christmas Fayre");
  assert.equal(params.get("body"), "Led by Rachel Briscoe (Squirrel and Otter) and Sophie Glass (Fox).\n\nDetails: https://www.thefriendsofashley.org/events/christmas-fayre-2026/");
  assert.equal(params.get("location"), fayre.location);
});

test("British Summer Time starts convert to the exact UTC instant", () => {
  const bst = { ...fayre, start: new Date("2026-10-03T13:00:00+01:00"), end: new Date("2026-10-03T14:30:00+01:00") };
  assert.match(buildGoogleCalendarUrl(bst), /dates=20261003T120000Z%2F20261003T133000Z/);
  const { params } = read(buildOutlookCalendarUrl(bst));
  assert.equal(params.get("startdt"), "2026-10-03T12:00:00Z");
  assert.equal(params.get("enddt"), "2026-10-03T13:30:00Z");
});

test("a timed event without a confirmed end offers no service links rather than inventing a duration", () => {
  const noEnd = { ...fayre, end: undefined };
  assert.equal(buildGoogleCalendarUrl(noEnd), null);
  assert.equal(buildOutlookCalendarUrl(noEnd), null);
});

test("all-day events use the UK calendar date with an exclusive end date on both services", () => {
  const grotto = { ...fayre, allDay: true, end: undefined, start: new Date("2026-12-14T00:00:00+00:00") };
  const google = read(buildGoogleCalendarUrl(grotto)).params;
  assert.equal(google.get("dates"), "20261214/20261215");
  assert.equal(google.get("ctz"), null);
  const outlook = read(buildOutlookCalendarUrl(grotto)).params;
  assert.equal(outlook.get("startdt"), "2026-12-14");
  assert.equal(outlook.get("enddt"), "2026-12-15");
  assert.equal(outlook.get("allday"), "true");
});

test("a BST-midnight all-day event stays on the same UK date", () => {
  // Happy Bags April 2027 starts at midnight BST (23:00 UTC the day before).
  const bags = { ...fayre, allDay: true, end: undefined, start: new Date("2027-04-26T00:00:00+01:00") };
  const google = read(buildGoogleCalendarUrl(bags)).params;
  assert.equal(google.get("dates"), "20270426/20270427");
  const outlook = read(buildOutlookCalendarUrl(bags)).params;
  assert.equal(outlook.get("startdt"), "2027-04-26");
  assert.equal(outlook.get("enddt"), "2027-04-27");
});
