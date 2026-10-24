// Builds a small iCalendar (RFC 5545) download for one event.
// Timed instants are written in UTC, which is exact for UK dates in any
// daylight-saving state; all-day events use the UK calendar date.

export interface CalendarEvent {
  id: string;
  title: string;
  summary: string;
  location: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  status?: string;
  url: string;
}

// The published school address is appended only for events at these known Ashley venues.
const schoolVenues = new Set(["Ashley School", "Ashley School field", "School playground"]);
const schoolAddress = "Ashley Road, Walton-on-Thames KT12 1HX";

export const locationWithAddress = (location: string) =>
  schoolVenues.has(location) ? `${location}, ${schoolAddress}` : location;

const londonDay = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/London",
});

// Content lines longer than 75 octets are folded with a leading space (RFC 5545 section 3.1).
export const foldLine = (line: string) => {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    while (end > start && (bytes[end] & 0xc0) === 0x80) end--; // never split a UTF-8 sequence
    parts.push(new TextDecoder().decode(bytes.subarray(start, end)));
    start = end;
    limit = 74; // continuation lines begin with one space
  }
  return parts.join("\r\n ");
};

export const icsEscape = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const utcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const londonDateValue = (date: Date) => londonDay.format(date).replace(/-/g, "");

// Whole UK calendar days; adding via UTC midday stays correct across daylight-saving changes.
const addLondonDays = (date: Date, days: number) => {
  const [year, month, day] = londonDay.format(date).split("-").map(Number);
  return londonDateValue(new Date(Date.UTC(year, month - 1, day + days, 12)));
};

const icsStatus = (status?: string) =>
  status === "save-the-date" ? "TENTATIVE" : status === "confirmed" || status === "tickets-planned" ? "CONFIRMED" : undefined;

export const buildEventIcs = (event: CalendarEvent, generatedAt = new Date()) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Friends of Ashley//thefriendsofashley.org//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@thefriendsofashley.org`,
    `DTSTAMP:${utcStamp(generatedAt)}`,
  ];
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${londonDateValue(event.start)}`);
    lines.push(`DTEND;VALUE=DATE:${addLondonDays(event.start, 1)}`);
  } else {
    lines.push(`DTSTART:${utcStamp(event.start)}`);
    // A confirmed end is written when known; otherwise the start stands alone (RFC 5545).
    if (event.end) lines.push(`DTEND:${utcStamp(event.end)}`);
  }
  const status = icsStatus(event.status);
  if (status) lines.push(`STATUS:${status}`);
  lines.push(`SUMMARY:${icsEscape(event.title)}`);
  lines.push(`DESCRIPTION:${icsEscape(`${event.summary}\n\nDetails: ${event.url}`)}`);
  lines.push(`LOCATION:${icsEscape(event.location)}`);
  lines.push(`URL:${event.url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
};
