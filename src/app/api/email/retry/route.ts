import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { isStuck, retryNotices, sanityOutbox, type Queued } from "@/lib/email/outbox";
import { resendSend } from "@/lib/email/resend";
import { emailConfig } from "@/lib/email/config";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * The messages to Maninder that are still waiting (lib/email/outbox.ts).
 * The site watch (site-watch.yml) calls it every fifteen minutes:
 *
 * - POST: tries the waiting notices again (at most once every ten minutes,
 *   however often it is called), then reports.
 * - GET: reports only.
 *
 * The report is counts only, never who wrote or what: { waiting, stuck }.
 * When "stuck" is above zero the site watch opens an alert assigned to
 * Maninder; it closes by itself once nothing is stuck. No key is needed:
 * calling it can only make the site retry emails to Maninder, and the
 * ten minute spacing keeps that harmless.
 */
const RUN_ID = "private.email-retry";
const SPACING_MS = 10 * 60 * 1000;

async function report() {
  const client = writeClient!;
  const notices = await client.fetch<Queued[]>(`*[_type == "emailQueued" && priority == 0]{ _id, priority, createdAt, attempts }`);
  const now = new Date();
  return { waiting: notices.length, stuck: notices.filter((n) => isStuck(n as Queued, now)).length };
}

export async function GET(request: Request) {
  if (!rateLimit(`email-retry:${getClientIp(request)}`, { max: 30 }).success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!writeClient) return NextResponse.json({ error: "SANITY_API_TOKEN is not set" }, { status: 500 });
  return NextResponse.json(await report(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!rateLimit(`email-retry:${getClientIp(request)}`, { max: 30 }).success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!writeClient) return NextResponse.json({ error: "SANITY_API_TOKEN is not set" }, { status: 500 });
  const client = writeClient;
  // At most once every ten minutes, whoever calls.
  await client.createIfNotExists({ _id: RUN_ID, _type: "emailRetryRun" });
  const run = await client.getDocument<{ _rev: string; lastRun?: string }>(RUN_ID);
  const due = !run?.lastRun || Date.now() - Date.parse(run.lastRun) > SPACING_MS;
  let retried = false;
  if (due && run && emailConfig().resendKey) {
    try {
      await client.patch(RUN_ID).ifRevisionId(run._rev).set({ lastRun: new Date().toISOString() }).commit();
      await retryNotices(sanityOutbox(), resendSend);
      retried = true;
    } catch {
      // Another call took this turn.
    }
  }
  return NextResponse.json({ ...(await report()), retried }, { headers: { "Cache-Control": "no-store" } });
}
