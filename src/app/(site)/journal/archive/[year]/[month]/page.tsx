import type { Metadata, ResolvingMetadata } from "next";
import { permanentRedirect } from "next/navigation";
import { fullTitle } from "@/lib/page-title";
import { shareCard, withSharePhoto } from "@/lib/share-metadata";
import JournalPage from "@/components/journal/room/JournalPage";
import NotFoundResponse from "@/components/NotFoundResponse";
import { journalMonthHref, loadJournalEntries, monthsWithEntries } from "@/lib/journalArchive";
import { journalMonthDescription, monthName } from "@/lib/pageDescriptions";
import JsonLd from "@/components/JsonLd";
import { loadJournalIndex } from "@/lib/journalData";
import { monthKey, monthKeyOf } from "@/lib/journalRoom";
import { buildBreadcrumbJsonLd, buildJournalMonthJsonLd } from "@/lib/structured-data";
import { parseSanityDate } from "@/lib/dates";
import type { JournalEntry } from "@/lib/types";
// This area's own styles, loaded with its pages alone (globals.css).
import "@/app/styles/journal.css";

/*
 * One month of the journal, at its own cached address with its own
 * canonical: the Journal page opened at that month. Months with entries are
 * built ahead; any other valid month is built on first visit and cached,
 * opens at the nearest older month with entries, and is kept out of search
 * results.
 */

type Params = { year: string; month: string };

/** The year and month in the address, if they are a valid month. */
function parse(params: Params): { year: number; month: number } | null {
  const year = Number(params.year);
  const month = Number(params.month);
  if (!/^\d{4}$/.test(params.year) || !/^\d{1,2}$/.test(params.month)) return null;
  if (!Number.isInteger(year) || month < 1 || month > 12) return null;
  return { year, month };
}

export async function generateStaticParams(): Promise<Params[]> {
  const entries = await loadJournalEntries();
  return monthsWithEntries(entries).map(({ year, month }) => ({ year: String(year), month: String(month) }));
}

/** The month's share photograph: its latest entry's photograph (audit P1). */
function monthPhoto(entries: JournalEntry[], year: number, month: number) {
  const e = entries.find((x) => {
    const d = parseSanityDate(x.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month && x.coverImage;
  });
  if (!e?.coverImage) return null;
  const alt = typeof e.coverImage === "object" && "alt" in e.coverImage ? (e.coverImage as { alt?: string | null }).alt : null;
  return { image: e.coverImage, alt: alt || e.title };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const when = parse(await params);
  if (!when) return {};
  const entries = await loadJournalEntries();
  const hasEntries = monthsWithEntries(entries).some((m) => m.year === when.year && m.month === when.month);
  const title = `Journal, ${monthName(when.year, when.month)}`;
  const description = journalMonthDescription(when.year, when.month);
  return {
    title,
    description,
    alternates: { canonical: journalMonthHref(when.year, when.month) },
    ...(hasEntries ? {} : { robots: { index: false, follow: true } }),
    ...withSharePhoto(await shareCard(parent, fullTitle(title), description), monthPhoto(entries, when.year, when.month), title),
  };
}

export default async function JournalMonthPage({ params }: { params: Promise<Params> }) {
  const raw = await params;
  const when = parse(raw);
  if (!when) return <NotFoundResponse />;
  // One address per month: /journal/archive/2025/07 goes on to .../2025/7.
  const canonical = journalMonthHref(when.year, when.month);
  if (`/journal/archive/${raw.year}/${raw.month}` !== canonical) permanentRedirect(canonical);
  const key = monthKey(when.year, when.month);
  const entries = (await loadJournalIndex()).filter((d) => monthKeyOf(d.date) === key);
  const title = `Journal, ${monthName(when.year, when.month)}`;
  const description = journalMonthDescription(when.year, when.month);
  return (
    <>
      <JsonLd data={buildJournalMonthJsonLd(canonical, { title, description }, entries)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
          { name: monthName(when.year, when.month), path: canonical },
        ])}
      />
      <JournalPage at={{ kind: "month", year: when.year, month: when.month }} />
    </>
  );
}
