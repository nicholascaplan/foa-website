import { ukDateKey, type VisibilityRules } from "./event-visibility.ts";

export interface EventTiming {
  start: Date;
  end?: Date;
  allDay?: boolean;
  archive?: boolean;
  archiveFrom?: Date;
}

// One policy for listings and reminders. Editorial overrides take precedence.
export const eventVisibilityRules = (event: EventTiming, past = false): VisibilityRules => {
  if (event.archive) return past ? {} : { expiresAt: new Date(0).toISOString() };
  if (event.archiveFrom) {
    const boundary = event.archiveFrom.toISOString();
    return past ? { showFrom: boundary } : { showBefore: boundary };
  }
  if (event.allDay) {
    const nextDay = new Date(Date.parse(`${ukDateKey(event.start)}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
    return past ? { showFromDay: nextDay } : { expiresOn: nextDay };
  }
  const boundary = (event.end ?? event.start).toISOString();
  return past ? { showFrom: boundary } : { expiresAt: boundary };
};
