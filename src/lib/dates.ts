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
function parseDateOnly(value: string | null | undefined): Date | null {
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

/*
 * Display formatters for Sanity dates. Each accepts a date only value
 * ("YYYY-MM-DD", parsed as a local date by parseSanityDate, so it never
 * shifts a day) or a full timestamp. Missing values give "" (or null where
 * noted); a value that is not a date is shown as it is rather than as
 * "Invalid Date".
 */

/** A Sanity date as a valid local Date, or null. */
function toValidDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = parseSanityDate(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function format(
  value: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "";
  const d = toValidDate(value);
  return d ? d.toLocaleDateString(locale, options) : value;
}

/** "15 July 2025": journal entries, in the journal list and on the article. */
export function formatEntryDate(value: string | null | undefined): string {
  return format(value, "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** "15/07/2025": the home page journal list on desktop. */
export function formatNumericDate(value: string | null | undefined): string {
  return format(value, "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** "July 2025": Featured On rows. Null when there is no valid date. */
export function formatMonthYear(value: string | null | undefined): string | null {
  return toValidDate(value)
    ? format(value, "en-US", { month: "long", year: "numeric" })
    : null;
}

/** "Jul 2025": the home page journal cards on phone and tablet. */
export function formatShortMonthYear(value: string | null | undefined): string {
  return format(value, "en-US", { month: "short", year: "numeric" });
}

/** "15": the day of the month, for the home page journal cards. */
export function formatDayOfMonth(value: string | null | undefined): string {
  const d = toValidDate(value);
  return d ? d.getDate().toString() : (value ?? "");
}

/** Short month names, January first, for the journal month filter. */
export const MONTH_SHORT_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * A Sanity date as an ISO 8601 timestamp for structured data, or undefined
 * when missing or invalid. Date only values are read as local dates.
 */
export function toIsoTimestamp(value: string | null | undefined): string | undefined {
  return toValidDate(value)?.toISOString();
}
