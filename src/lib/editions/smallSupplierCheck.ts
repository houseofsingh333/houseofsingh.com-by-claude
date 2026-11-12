import type { SanityClient } from "next-sanity";
import { sendEmail } from "@/lib/email/outbox";
import { smallSupplierEmail } from "@/lib/email/templates";
import { addressOf, emailConfig } from "@/lib/email/config";
import { alertsDue, summarise, type OtherRevenue, type TrackedOrder } from "./smallSupplier";

/** The tracker's private document (Studio: House of Singh Editions, Small supplier tracker). */
export const TRACKER_ID = "private.editions-small-supplier";

/**
 * Run by the daily job: adds up the quarters and emails the Shop's own
 * address once for each threshold newly passed. A threshold is marked as
 * emailed only once its email was sent or queued, so a failed send is
 * tried again the next day.
 */
export async function checkSmallSupplier(client: SanityClient, now = new Date()): Promise<{ rolling: number; sent: string[] }> {
  const { orders, tracker } = await client.fetch<{ orders: TrackedOrder[]; tracker: { otherRevenue?: OtherRevenue[]; alertsActive?: string[] } | null }>(
    `{ "orders": *[_type == "editionsOrder"]{subtotal, shipping, paidAt, refundedAt, testMode}, "tracker": *[_id == $id][0]{otherRevenue, alertsActive} }`,
    { id: TRACKER_ID },
  );
  const rows = summarise(orders ?? [], tracker?.otherRevenue ?? [], now);
  const before = tracker?.alertsActive ?? [];
  const { due, active } = alertsDue(rows, before);
  const sent: string[] = [];
  const to = addressOf(emailConfig().fromEditions);
  for (const a of due) if ((await sendEmail(smallSupplierEmail(to, a, rows))) !== "skipped") sent.push(a.key);
  // Newly passed but not sent: left off, so tomorrow tries again.
  const keep = active.filter((k) => before.includes(k) || sent.includes(k));
  if (keep.join() !== [...before].sort().join()) {
    await client.createIfNotExists({ _id: TRACKER_ID, _type: "editionsSmallSupplier" });
    await client.patch(TRACKER_ID).set({ alertsActive: keep }).commit();
  }
  return { rolling: rows[rows.length - 1].rolling, sent };
}
