import { useEffect, useState } from "react";
import { useClient } from "sanity";
import { QUARTER_ALERT, ROLLING_ALERTS, summarise, type OtherRevenue, type QuarterRow, type TrackedOrder } from "@/lib/editions/smallSupplier";
import { apiVersion } from "../env";

/**
 * The small supplier tracker's own view (Studio: House of Singh Editions,
 * Small supplier tracker, Quarters): the last eight calendar quarters,
 * each with the Shop's paid orders (piece plus shipping, every country,
 * refunds and test orders left out), the other revenue entered on the
 * next tab, the quarter's total and the four quarters ending with it. The
 * same sums as the daily email job (lib/editions/smallSupplier.ts). Plain
 * React and Studio colour variables, so it needs no extra package.
 */
type Props = { document: { displayed: { otherRevenue?: OtherRevenue[] | null } } };

const cad = (n: number) => `CA$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const muted = "var(--card-muted-fg-color, #6e7683)";
const caution = "var(--card-badge-caution-fg-color, #a86b00)";
const critical = "var(--card-badge-critical-fg-color, #c4314b)";

export default function SmallSupplierView({ document }: Props) {
  const client = useClient({ apiVersion });
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    client
      .fetch<TrackedOrder[]>(`*[_type == "editionsOrder"]{subtotal, shipping, paidAt, refundedAt, testMode}`)
      .then(setOrders)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [client]);

  if (error) return <p style={{ padding: 24, color: critical }}>The orders could not be read: {error}</p>;
  if (!orders) return <p style={{ padding: 24, color: muted }}>Reading the orders…</p>;

  const rows: QuarterRow[] = summarise(orders, document.displayed.otherRevenue ?? []);
  const now = rows[rows.length - 1];
  const tests = orders.filter((o) => o.testMode).length;
  const colour = (n: number, limit: number) => (n > limit ? critical : n > limit * 0.8 ? caution : undefined);
  const cell = { padding: "8px 12px", textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const };

  return (
    <div style={{ padding: 24, maxWidth: 820, lineHeight: 1.5 }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: muted }}>The four calendar quarters ending with {now.quarter}</p>
      <p style={{ margin: "0 0 20px", fontSize: 28, color: colour(now.rolling, ROLLING_ALERTS[0]) }}>{cad(now.rolling)}</p>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
        <thead>
          <tr style={{ color: muted, fontSize: 12 }}>
            <th style={{ ...cell, textAlign: "left" }}>Quarter</th>
            <th style={cell}>Shop orders</th>
            <th style={cell}>Other revenue</th>
            <th style={cell}>Quarter total</th>
            <th style={cell}>Four quarters to here</th>
          </tr>
        </thead>
        <tbody>
          {[...rows].reverse().map((r) => (
            <tr key={r.quarter} style={{ borderTop: "1px solid var(--card-border-color, #e5e5e5)" }}>
              <td style={{ ...cell, textAlign: "left" }}>{r.quarter}</td>
              <td style={cell}>
                {cad(r.orders)}
                <span style={{ color: muted }}> ({r.ordersCount})</span>
              </td>
              <td style={cell}>{cad(r.other)}</td>
              <td style={{ ...cell, color: colour(r.total, QUARTER_ALERT) }}>{cad(r.total)}</td>
              <td style={{ ...cell, color: colour(r.rolling, ROLLING_ALERTS[0]) }}>{cad(r.rolling)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 20, fontSize: 13, color: muted }}>
        Shop orders: piece plus shipping, every country, paid and not refunded, by the day they were paid (Toronto time).
        {tests ? ` ${tests} test order${tests === 1 ? " is" : "s are"} left out.` : ""} Other revenue: the next tab. An email goes to the Shop&apos;s
        address when the four quarters pass {cad(ROLLING_ALERTS[0])} and {cad(ROLLING_ALERTS[1])}, and when any single quarter passes{" "}
        {cad(QUARTER_ALERT)}. Amber: past 80 percent of a threshold; red: past it.
      </p>
    </div>
  );
}
