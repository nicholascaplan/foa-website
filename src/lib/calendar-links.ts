// Builds "add this event" links for the named calendar services (Google Calendar
// and Outlook) so visitors can save an event without downloading the .ics file.
// Both services require an end: timed events without a confirmed end return no
// link rather than inventing a duration. All-day events use the UK calendar
// date with an exclusive end date, the same semantics as the ICS download.
// URL formats follow the community-verified parameter documentation at
// https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs
// (services/google.md and services/outlook-web.md).

// The UK-day helpers mirror src/lib/ics.ts; lib modules stay self-contained so
// the unit tests can import them without a bundler.
const londonDay = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/London",
});

const londonDateValue = (date: Date) => londonDay.format(date).replace(/-/g, "");

// Whole UK calendar days; adding via UTC midday stays correct across daylight-saving changes.
const addLondonDays = (date: Date, days: number) => {
  const [year, month, day] = londonDay.format(date).split("-").map(Number);
  return londonDateValue(new Date(Date.UTC(year, month - 1, day + days, 12)));
};

export interface LinkableEvent {
  title: string;
  summary: string;
  location: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  url: string;
}

// 20261205T120000Z (Google) and 2026-12-05T12:00:00Z (Outlook), both exact UTC instants.
const googleStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const outlookStamp = (date: Date) => date.toISOString().replace(/\.\d{3}/, "");

const londonDateDashed = (undashed: string) =>
  `${undashed.slice(0, 4)}-${undashed.slice(4, 6)}-${undashed.slice(6, 8)}`;

const details = (event: LinkableEvent) => `${event.summary}\n\nDetails: ${event.url}`;

export const buildGoogleCalendarUrl = (event: LinkableEvent) => {
  if (!event.allDay && !event.end) return null;
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", event.title);
  if (event.allDay) {
    params.set("dates", `${londonDateValue(event.start)}/${addLondonDays(event.start, 1)}`);
  } else {
    params.set("dates", `${googleStamp(event.start)}/${googleStamp(event.end!)}`);
    // The event happens in the UK; say so the wall time is London even for viewers elsewhere.
    params.set("ctz", "Europe/London");
  }
  params.set("details", details(event));
  params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const buildOutlookCalendarUrl = (event: LinkableEvent) => {
  if (!event.allDay && !event.end) return null;
  const params = new URLSearchParams();
  params.set("path", "/calendar/action/compose");
  params.set("rru", "addevent");
  if (event.allDay) {
    params.set("startdt", londonDateDashed(londonDateValue(event.start)));
    params.set("enddt", londonDateDashed(addLondonDays(event.start, 1)));
    params.set("allday", "true");
  } else {
    params.set("startdt", outlookStamp(event.start));
    params.set("enddt", outlookStamp(event.end!));
  }
  params.set("subject", event.title);
  params.set("body", details(event));
  params.set("location", event.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};
