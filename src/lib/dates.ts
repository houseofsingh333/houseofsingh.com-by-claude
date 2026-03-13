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
