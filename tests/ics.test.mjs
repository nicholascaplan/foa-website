import assert from "node:assert/strict";
import test from "node:test";
import { buildEventIcs, foldLine, icsEscape, locationWithAddress } from "../src/lib/ics.ts";

const base = {
  id: "fireworks-2026",
  title: "Fireworks on the Field",
  summary: "An early quiet display, the main spectacular and an evening of food, games and family fun.",
  location: "Ashley School field, Ashley Road, Walton-on-Thames KT12 1HX",
  start: new Date("2026-11-05T16:30:00+00:00"),
  end: new Date("2026-11-05T18:30:00+00:00"),
  status: "confirmed",
  url: "https://www.thefriendsofashley.org/events/fireworks-2026/",
};

test("timed events carry exact UTC start and end instants", () => {
  const ics = buildEventIcs(base, new Date("2026-10-24T12:00:00+01:00"));
  assert.match(ics, /DTSTART:20261105T163000Z\r\n/);
  assert.match(ics, /DTEND:20261105T183000Z\r\n/);
  assert.match(ics, /DTSTAMP:20261024T110000Z\r\n/);
});

test("a timed event without a confirmed end writes the start only", () => {
  const ics = buildEventIcs({ ...base, end: undefined });
  assert.match(ics, /DTSTART:20261105T163000Z\r\n/);
  assert.doesNotMatch(ics, /DTEND/);
});

test("all-day events use the UK calendar date with an exclusive end date", () => {
  // Midnight BST (UTC+1) must stay on the same UK day.
  const ics = buildEventIcs({ ...base, start: new Date("2027-04-26T00:00:00+01:00"), end: undefined, allDay: true });
  assert.match(ics, /DTSTART;VALUE=DATE:20270426\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20270427\r\n/);
  // And the same for a GMT winter date.
  const winter = buildEventIcs({ ...base, start: new Date("2026-12-14T00:00:00+00:00"), end: undefined, allDay: true });
  assert.match(winter, /DTSTART;VALUE=DATE:20261214\r\n/);
  assert.match(winter, /DTEND;VALUE=DATE:20261215\r\n/);
});

test("save-the-date events are tentative and confirmed events are confirmed", () => {
  assert.match(buildEventIcs({ ...base, status: "save-the-date" }), /STATUS:TENTATIVE\r\n/);
  assert.match(buildEventIcs(base), /STATUS:CONFIRMED\r\n/);
  assert.doesNotMatch(buildEventIcs({ ...base, status: "completed" }), /STATUS:/);
});

test("text values escape commas, semicolons, backslashes and newlines", () => {
  assert.equal(icsEscape('a, b; c\\d\ne'), "a\\, b\\; c\\\\d\\ne");
  const ics = buildEventIcs({ ...base, location: "School playground, Ashley Road" });
  assert.match(ics, /LOCATION:School playground\\, Ashley Road\r\n/);
});

test("lines fold at 75 octets with a single-space continuation", () => {
  const line = `DESCRIPTION:${"x".repeat(200)}`;
  const folded = foldLine(line);
  const parts = folded.split("\r\n");
  assert.equal(parts.length, 3);
  assert.ok(new TextEncoder().encode(parts[0]).length <= 75);
  assert.ok(parts[1].startsWith(" "));
  assert.ok(new TextEncoder().encode(parts[1]).length <= 75);
  assert.equal(folded.replaceAll("\r\n ", ""), line); // unfolding restores the original
});

test("folding never splits a UTF-8 sequence", () => {
  const line = `SUMMARY:Café ${"é".repeat(60)}`;
  const folded = foldLine(line);
  for (const part of folded.split("\r\n")) assert.ok(new TextEncoder().encode(part).length <= 75);
  assert.equal(folded.replaceAll("\r\n ", ""), line);
});

test("the calendar document is well formed with CRLF endings", () => {
  const ics = buildEventIcs(base, new Date("2026-10-24T12:00:00+01:00"));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.doesNotMatch(ics, /[^\r]\n/);
  assert.match(ics, /UID:fireworks-2026@thefriendsofashley.org\r\n/);
  assert.match(ics, /SUMMARY:Fireworks on the Field\r\n/);
  assert.match(ics, /URL:https:\/\/www\.thefriendsofashley\.org\/events\/fireworks-2026\/\r\n/);
  for (const line of ics.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`);
});

test("the school address is appended only for the known Ashley venues", () => {
  assert.equal(locationWithAddress("Ashley School"), "Ashley School, Ashley Road, Walton-on-Thames KT12 1HX");
  assert.equal(locationWithAddress("Ashley School field"), "Ashley School field, Ashley Road, Walton-on-Thames KT12 1HX");
  assert.equal(locationWithAddress("School playground"), "School playground, Ashley Road, Walton-on-Thames KT12 1HX");
  assert.equal(locationWithAddress("Walton Bridge"), "Walton Bridge");
});
