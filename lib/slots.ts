/**
 * Single source of truth for time slot definitions.
 * Shared between the API routes and the frontend TimeSelector component.
 */

export const WEEKDAY_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
] as const;

export const SATURDAY_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
] as const;

export type TimeSlot =
  | (typeof WEEKDAY_SLOTS)[number]
  | (typeof SATURDAY_SLOTS)[number];

/** Returns the available slots for a given date. Empty array = no bookings allowed. */
export function getSlotsForDate(date: Date): string[] {
  const day = date.getDay();
  if (day === 0) return []; // Sunday — closed
  if (day === 6) return [...SATURDAY_SLOTS];
  return [...WEEKDAY_SLOTS];
}

export const MAX_CAPACITY = 2;
