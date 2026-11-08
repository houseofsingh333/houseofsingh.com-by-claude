import { NextResponse } from "next/server";
import { loadJournalIndex, loadJournalMonth } from "@/lib/journalData";
import { monthsOf } from "@/lib/journalRoom";

/*
 * One month of the journal in full, as JSON: the Journal page asks for
 * these as the reader scrolls past the months it was opened with. Months
 * with entries are built ahead and cached like the pages (Sanity fetches
 * revalidate every 60 seconds); an unknown month is a 404.
 */

type Params = { year: string; month: string };

export const dynamic = "force-static";
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  return monthsOf(await loadJournalIndex()).map((m) => ({ year: String(m.year), month: String(m.month) }));
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const raw = await params;
  const year = Number(raw.year);
  const month = Number(raw.month);
  if (!/^\d{4}$/.test(raw.year) || !/^\d{1,2}$/.test(raw.month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Not a month" }, { status: 404 });
  }
  const entries = await loadJournalMonth(year, month);
  if (!entries.length) return NextResponse.json({ error: "No entries" }, { status: 404 });
  return NextResponse.json({ year, month, entries });
}
