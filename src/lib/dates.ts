export const ordinalSuffix = (day: number) =>
  day % 100 >= 11 && day % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][day % 10] ?? "th");

export const ordinalDateFormatter = (options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", ...options });
  return (value: Date | string) =>
    formatter
      .formatToParts(value instanceof Date ? value : new Date(value))
      .map((part) => (part.type === "day" ? `${part.value}${ordinalSuffix(Number(part.value))}` : part.value))
      .join("");
};

const eventTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false,
});

export const timeRangeSeparator = "-";
export const formatEventTimeRange = (start: Date, end?: Date) =>
  `${eventTimeFormatter.format(start)}${end ? `${timeRangeSeparator}${eventTimeFormatter.format(end)}` : ""}`;

// Keep supplied shift wording and exact times, normalising only time-range separators.
export const formatTimeRangeText = (text: string) =>
  text.replace(/(\d{1,2}:\d{2})\s*(?:[\u2013\u2014-]|to)\s*(?=\d{1,2}:\d{2})/g, `$1${timeRangeSeparator}`);
