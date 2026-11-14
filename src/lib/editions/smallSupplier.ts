/**
 * The small supplier tracker (private; with Maninder's CPA, 12 Nov 2026).
 *
 * House of Singh Editions is sold by Maninder Singh, operating as House of
 * Singh, a small supplier, so no GST/HST is charged. A small supplier's taxable
 * revenue must stay within the limit over any four consecutive calendar
 * quarters, and within any single quarter. This adds up, by calendar
 * quarter (Toronto time):
 * - the Shop's paid orders: piece plus shipping, every country, test
 *   orders and refunded orders left out;
 * - any other personal taxable revenue Maninder enters in the Studio
 *   (House of Singh Editions, Small supplier tracker).
 * It reports each quarter, the four quarters ending with it, and which
 * thresholds have been passed, so the Studio view and the daily email job
 * (app/api/email/daily) say the same thing.
 *
 * Plain module, no imports: the Studio uses it too.
 */

export type TrackedOrder = {
  subtotal?: number | null;
  shipping?: number | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  testMode?: boolean | null;
};
export type OtherRevenue = { quarter: string; amount: number; note?: string | null };

/** The thresholds Maninder asked to hear about, CA$. */
export const ROLLING_ALERTS = [20_000, 25_000] as const;
export const QUARTER_ALERT = 20_000;

/** "2026-Q4": the calendar quarter of a moment, in Toronto. */
export function quarterOf(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "numeric" }).formatToParts(d);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
}

/** The quarter n quarters before (or after, for negative n) the given one. */
export function shiftQuarter(q: string, n: number): string {
  const m = /^(\d{4})-Q([1-4])$/.exec(q);
  if (!m) throw new Error(`Not a quarter: ${q}`);
  const index = Number(m[1]) * 4 + (Number(m[2]) - 1) - n;
  return `${Math.floor(index / 4)}-Q${(index % 4) + 1}`;
}

export const isQuarter = (q: string) => /^\d{4}-Q[1-4]$/.test(q);

const round2 = (n: number) => Math.round(n * 100) / 100;

/** An order that counts: paid, not refunded, not a test. */
export const counts = (o: TrackedOrder) => Boolean(o.paidAt) && !o.refundedAt && !o.testMode;

export type QuarterRow = {
  quarter: string;
  orders: number;
  ordersCount: number;
  other: number;
  total: number;
  /** This quarter and the three before it. */
  rolling: number;
};

/**
 * The quarters from `count - 1` quarters before `now`'s quarter up to it,
 * oldest first, each with its own total and the four quarters ending with it.
 */
export function summarise(orders: TrackedOrder[], other: OtherRevenue[], now: Date = new Date(), count = 8): QuarterRow[] {
  const byQuarter = new Map<string, { orders: number; ordersCount: number; other: number }>();
  const slot = (q: string) => {
    if (!byQuarter.has(q)) byQuarter.set(q, { orders: 0, ordersCount: 0, other: 0 });
    return byQuarter.get(q)!;
  };
  for (const o of orders) {
    if (!counts(o)) continue;
    const s = slot(quarterOf(o.paidAt!));
    s.orders += (o.subtotal ?? 0) + (o.shipping ?? 0);
    s.ordersCount += 1;
  }
  for (const r of other) if (isQuarter(r.quarter) && Number.isFinite(r.amount)) slot(r.quarter).other += r.amount;

  const current = quarterOf(now);
  const totalOf = (q: string) => {
    const s = byQuarter.get(q);
    return s ? s.orders + s.other : 0;
  };
  const rows: QuarterRow[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const q = shiftQuarter(current, i);
    const s = byQuarter.get(q) ?? { orders: 0, ordersCount: 0, other: 0 };
    const rolling = [0, 1, 2, 3].reduce((sum, k) => sum + totalOf(shiftQuarter(q, k)), 0);
    rows.push({ quarter: q, orders: round2(s.orders), ordersCount: s.ordersCount, other: round2(s.other), total: round2(s.orders + s.other), rolling: round2(rolling) });
  }
  return rows;
}

export type Alert = { key: string; subject: string; text: string };

/**
 * The emails due now, and the thresholds now active. A rolling threshold
 * alerts once when it is passed, and again only after the total has gone
 * back under it; a single quarter alerts once per quarter.
 */
export function alertsDue(rows: QuarterRow[], active: string[]): { due: Alert[]; active: string[] } {
  const now = rows[rows.length - 1];
  const next = new Set(active);
  const due: Alert[] = [];
  const cad = (n: number) => `CA$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  for (const limit of ROLLING_ALERTS) {
    const key = `rolling-${limit}`;
    if (now.rolling > limit && !next.has(key)) {
      next.add(key);
      due.push({
        key,
        subject: `Small supplier: the last four quarters passed ${cad(limit)}`,
        text: `The four calendar quarters ending with ${now.quarter} add up to ${cad(now.rolling)}, past ${cad(limit)}.`,
      });
    } else if (now.rolling <= limit) next.delete(key);
  }
  for (const r of rows) {
    const key = `quarter-${QUARTER_ALERT}:${r.quarter}`;
    if (r.total > QUARTER_ALERT && !next.has(key)) {
      next.add(key);
      due.push({
        key,
        subject: `Small supplier: ${r.quarter} passed ${cad(QUARTER_ALERT)}`,
        text: `The calendar quarter ${r.quarter} adds up to ${cad(r.total)} on its own, past ${cad(QUARTER_ALERT)}.`,
      });
    }
  }
  return { due, active: [...next].sort() };
}
