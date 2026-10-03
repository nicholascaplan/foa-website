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
