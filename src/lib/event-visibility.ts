const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/London",
});

export interface VisibilityRules {
  showBefore?: string;
  showFrom?: string;
  expiresAt?: string;
  expiresOn?: string;
}

export const ukDateKey = (date: Date) => dateKeyFormatter.format(date);

const dayNumber = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
};

export const relativeDayLabel = (eventDateKey: string, now: number) => {
  const daysAway = dayNumber(eventDateKey) - dayNumber(ukDateKey(new Date(now)));
  return daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : "";
};

export const isHidden = ({ showBefore, showFrom, expiresAt, expiresOn }: VisibilityRules, now: number) =>
  Boolean(
    (showBefore && now >= Date.parse(showBefore))
    || (showFrom && now < Date.parse(showFrom))
    || (expiresAt && now >= Date.parse(expiresAt))
    || (expiresOn && ukDateKey(new Date(now)) >= expiresOn),
  );

export const syncEventVisibility = (now = Date.now()) => {
  document
    .querySelectorAll<HTMLElement>("[data-show-before], [data-show-from], [data-expires-at], [data-expires-on]")
    .forEach((element) => {
      element.hidden = isHidden(element.dataset, now);
    });
};

export const syncRelativeDates = (now = Date.now()) => {
  document.querySelectorAll<HTMLElement>("[data-event-date]").forEach((label) => {
    const text = relativeDayLabel(label.dataset.eventDate!, now);
    label.textContent = text;
    label.hidden = !text;
  });
};
