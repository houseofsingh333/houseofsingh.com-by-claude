import { clockIn, collectionTitle, pad2 } from "./format";
import { seasonWord } from "./view";
import type { EditionsCollection } from "./types";

/**
 * The release moment in words (Shop design round 2): the countdown, the
 * card's date, the time in each city, the visitor's own time and the
 * calendar file. Pure functions on the release instant, so the same
 * moment reads correctly everywhere.
 */

const TORONTO = "America/Toronto";

/** A date's calendar day in a zone, as a number of days since 1970 (for counting days). */
function dayNumber(at: Date, timeZone: string): number {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return Math.round(Date.UTC(get("year"), get("month") - 1, get("day")) / 86_400_000);
}

/** "today", "tomorrow", "in 153 days": calendar days in Toronto until the moment. */
export function daysUntil(iso: string, now: Date): string {
  const days = dayNumber(new Date(iso), TORONTO) - dayNumber(now, TORONTO);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/** The same, for the phone bar: "Today", "Tomorrow", "In 153 days". */
export const daysUntilShort = (iso: string, now: Date) => {
  const w = daysUntil(iso, now);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

/** The line above the title before the release: "Released on the eve of Vaisakhi · in 153 days". */
export function sealedEyebrow(c: Pick<EditionsCollection, "releaseLine" | "season" | "opens">, now: Date): string {
  const line = c.releaseLine?.trim() || `Releasing for ${seasonWord(c.season)}`;
  return `${line} · ${daysUntil(c.opens, now)}`;
}

/** In early access: "Early access · opens to everyone in 1 day". */
export const earlyEyebrow = (c: Pick<EditionsCollection, "opens">, now: Date) => `Early access · opens to everyone ${daysUntil(c.opens, now)}`;

/** The card's date, in Toronto: "13 · 04 · 2027". */
export function cardDate(iso: string): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TORONTO, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("day")} · ${get("month")} · ${get("year")}`;
}

export type City = { label: string; timeZone: string };
export type CityTime = { label: string; timeZone: string; time: string; date: string };

/** "13 April" in a zone. */
const dateIn = (iso: string, timeZone: string) => new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "long" }).format(new Date(iso));

/** The release in each city: { "London", "12 am", "14 April" }. */
export function cityTimes(iso: string, cities: City[]): CityTime[] {
  return cities.map((c) => ({ label: c.label, timeZone: c.timeZone, time: clockIn(iso, c.timeZone), date: dateIn(iso, c.timeZone) }));
}

/** One sentence with every city, for screen readers: "7 pm on 13 April in Toronto, 12 am on 14 April in London, …". */
export const citiesSentence = (times: CityTime[]) => times.map((t) => `${t.time} on ${t.date} in ${t.label}`).join(", ");

/** "7 pm, Tuesday 13 April": the moment in one zone (the visitor's own, on the phone). */
export function momentIn(iso: string, timeZone: string): string {
  const day = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long" }).format(new Date(iso)).replace(",", "");
  return `${clockIn(iso, timeZone)}, ${day}`;
}

/** The fallback zone for the visitor's own time before the browser says. */
export const DEFAULT_ZONE = TORONTO;

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** The calendar file for the release: one hour from the moment, with the Shop's address. */
export function releaseIcs(c: Pick<EditionsCollection, "_id" | "number" | "opens">, siteUrl: string, now = new Date()): string {
  const start = new Date(c.opens);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const url = `${siteUrl}/editions`;
  const title = `House of Singh Editions, ${collectionTitle(c.number)}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//House of Singh//Editions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:collection-${pad2(c.number)}-${c.opens.replace(/[^0-9]/g, "")}@houseofsingh.com`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(title)}`,
    `DESCRIPTION:${icsText(`${collectionTitle(c.number)} opens. ${url}`)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
