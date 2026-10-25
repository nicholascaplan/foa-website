// Builds the "add this event" link for Google Calendar so visitors can save an
// event without downloading the .ics file. Google requires an end: timed events
// without a confirmed end return no link rather than inventing a duration.
// All-day events use the UK calendar date with an exclusive end date, the same
// semantics as the ICS download. The URL format follows the community-verified
// parameter documentation at
// https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs
// (services/google.md).

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

// 20261205T120000Z: the exact UTC instant in Google's compact form.
const googleStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

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
