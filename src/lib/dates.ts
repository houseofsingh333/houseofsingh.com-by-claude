/**
 * Parse a date string from Sanity CMS safely.
 *
 * Sanity stores date-only fields as "YYYY-MM-DD". When passed to `new Date()`,
 * this is interpreted as midnight **UTC**, which shifts the displayed date back
 * by one day for users in timezones west of UTC (e.g. EST/EDT).
 *
 * This helper detects date-only strings and constructs the Date using local
 * timezone parts, avoiding the UTC-shift bug.
 */
export function parseSanityDate(dateStr: string): Date {
  // Match date-only format: YYYY-MM-DD (no time component)
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (dateOnly) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  // For full ISO timestamps (e.g. _createdAt, _updatedAt), use default parsing
  return new Date(dateStr);
}

/*
 * Calendar dates picked by a visitor (the contact form's date step).
 *
 * A date picker gives "YYYY-MM-DD": a day on the calendar, with no time and
 * no time zone. It is stored and sent exactly like that, and only ever turned
 * into a Date with local parts, so 20 November stays 20 November everywhere.
 */

const DATE_ONLY_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * The "YYYY-MM-DD" calendar day held in `value`, or "" if there is none.
 * Accepts a plain date, or a full ISO timestamp saved by an older version of
 * the contact form, whose first ten characters are the day the visitor picked.
 */
export function toDateOnly(value: string | null | undefined): string {
  const match = value ? DATE_ONLY_PREFIX.exec(value) : null;
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

/** The calendar day in `value` as a local Date (midnight local), or null. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  const day = toDateOnly(value);
  if (!day) return null;
  const [year, month, date] = day.split("-").map(Number);
  const parsed = new Date(year, month - 1, date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * A picked calendar day for display, e.g. "November 20, 2026". Returns the
 * value unchanged when it holds no date, so nothing is ever silently hidden.
 */
export function formatDateOnly(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale = "en-US",
): string {
  const parsed = parseDateOnly(value);
  return parsed ? parsed.toLocaleDateString(locale, options) : (value ?? "");
}
