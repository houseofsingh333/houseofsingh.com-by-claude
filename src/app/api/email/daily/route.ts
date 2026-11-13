import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { drain, sanityOutbox } from "@/lib/email/outbox";
import { resendSend } from "@/lib/email/resend";
import { emailConfig } from "@/lib/email/config";
import { retryPending, sanityPending } from "@/lib/email/signups";
import { checkSmallSupplier } from "@/lib/editions/smallSupplierCheck";
import { kindOf, openMessages } from "@/lib/inbox/daily";
import { inboxDigestEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/outbox";

/**
 * The daily job (Vercel Cron, vercel.json, just after midnight UTC when
 * Resend's daily allowance resets): sends the emails that waited, order
 * and shipping first, oldest first; and tries Kit again for any sign up
 * kept while Kit could not be reached; emails Maninder the list of
 * messages from the last seven days not yet marked Replied (lib/inbox,
 * only when there is one); and checks the small supplier
 * tracker, emailing the Shop's own address when a threshold is newly
 * passed (lib/editions/smallSupplierCheck.ts). Only Vercel's cron may call it
 * (Authorization: Bearer CRON_SECRET).
 */
/** Compared in constant time, so the answer's timing says nothing about the secret (audit P7). */
function sameSecret(given: string, wanted: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(wanted);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !sameSecret(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  if (!writeClient) return NextResponse.json({ error: "SANITY_API_TOKEN is not set" }, { status: 500 });

  const pending = sanityPending()!;
  const signups = emailConfig().kitKey ? await retryPending(pending) : { moved: 0, left: -1 };
  const emails = emailConfig().resendKey ? await drain(sanityOutbox(), resendSend) : { sent: 0, left: -1 };
  // The daily safety net: every message of the last week not yet answered.
  const inbox = await openMessages(writeClient)
    .then(async (open) => {
      if (!open.length) return { open: 0, sent: "none" };
      const sent = await sendEmail(inboxDigestEmail(emailConfig().notifyTo, open.map((m) => ({ name: m.name, kind: kindOf(m), submittedAt: m.submittedAt }))));
      return { open: open.length, sent };
    })
    .catch((e: unknown) => {
      console.error("The daily list of open messages failed:", e instanceof Error ? e.message : e);
      return { open: -1, sent: "failed" };
    });
  // After the waiting emails, so a threshold email takes no place from an order's.
  const smallSupplier = await checkSmallSupplier(writeClient).catch((e: unknown) => {
    console.error("Small supplier check failed:", e instanceof Error ? e.message : e);
    return { error: true };
  });
  return NextResponse.json({ signups, emails, inbox, smallSupplier: "error" in smallSupplier ? "failed" : { sent: smallSupplier.sent } });
}
