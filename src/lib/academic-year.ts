import { ukDateKey } from "./event-visibility.ts";
import type { EventTiming } from "./event-lifecycle.ts";

// Editorial rollover: update only when the next year's dates are ready.
export const academicYearStart = 2026;
export const academicYearLabel = (year = academicYearStart) => `${year}/${String(year + 1).slice(-2)}`;

export const academicMonths = <T extends EventTiming>(events: T[], year = academicYearStart) => {
  const formatter = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" });
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(year, 8 + index, 1, 12));
    const key = ukDateKey(date).slice(0, 7);
    return {
      key,
      label: formatter.format(date),
      events: events.filter((event) => ukDateKey(event.start).startsWith(key)).sort((a, b) => a.start.getTime() - b.start.getTime()),
    };
  });
};

// Self-contained so the early inline initializer uses exactly the same logic.
// Rows stay in place: refreshes never detach focused links or open disclosures.
export const syncYearView = (now = Date.now(), root: Document = document) => {
  const currentMonth = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/London",
  }).format(new Date(now)).slice(0, 7);
  root.querySelectorAll<HTMLElement>("[data-month-key]").forEach((month) => {
    const remaining = Boolean(month.querySelector(".event-list-item:not([hidden])"));
    const current = month.dataset.monthKey === currentMonth;
    month.hidden = !current && !remaining;
    month.querySelector<HTMLElement>("[data-current-chip]")!.hidden = !current;
    month.querySelector<HTMLElement>("[data-empty-note]")!.hidden = !current || remaining;
    month.querySelector<HTMLElement>(".event-list")!.hidden = !remaining;
  });
  root.querySelectorAll<HTMLElement>("[data-yearview-term]").forEach((term) => {
    term.hidden = !term.querySelector("[data-month-key]:not([hidden])");
  });
  root.querySelectorAll<HTMLElement>("[data-earlier-month]").forEach((month) => {
    month.hidden = !month.querySelector(".event-list-item:not([hidden])");
  });
  const archive = root.querySelector<HTMLElement>("[data-past-events-section]");
  if (archive) archive.hidden = !archive.querySelector(".event-list-item:not([hidden])");
  const empty = root.querySelector<HTMLElement>("[data-yearview-empty]");
  if (empty) empty.hidden = Boolean(root.querySelector("[data-yearview-term] .event-list-item:not([hidden])"));
};
