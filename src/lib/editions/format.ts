/** Numbers and words of House of Singh Editions. */

/** 1 → "01". */
export const pad2 = (n: number) => String(n).padStart(2, "0");

const GURMUKHI_DIGITS = ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"];

/** 1 → "੧", 12 → "੧੨": the Collection's number in Gurmukhi numerals. */
export function gurmukhi(n: number): string {
  return String(n)
    .split("")
    .map((d) => GURMUKHI_DIGITS[Number(d)] ?? d)
    .join("");
}

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** 8 → "Eight pieces", 1 → "One piece". */
export function piecesInWords(n: number): string {
  const word = WORDS[n] ?? String(n);
  return `${word} ${n === 1 ? "piece" : "pieces"}`;
}

/** 180 → "CA$180", 180.5 → "CA$180.50". */
export function cad(amount: number): string {
  const whole = Number.isInteger(amount);
  return `CA$${amount.toLocaleString("en-CA", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/** Cents to dollars. */
export const fromCents = (cents: number | null | undefined) => (cents ?? 0) / 100;

/** "Collection 01". */
export const collectionTitle = (n: number) => `Collection ${pad2(n)}`;

/** A date and time in a zone, as "9 pm" or "6:30 am". */
export function clockIn(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date(iso));
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "").toLowerCase();
  return `${hour}${minute === "00" ? "" : `:${minute}`} ${period}`;
}

/** "13 April 2027", in Toronto. */
export function dayIn(iso: string, timeZone = "America/Toronto"): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

/** "May 2027", in Toronto. */
export function monthIn(iso: string, timeZone = "America/Toronto"): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, month: "long", year: "numeric" }).format(new Date(iso));
}
