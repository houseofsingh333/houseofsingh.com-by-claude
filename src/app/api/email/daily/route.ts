import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { drain, sanityOutbox } from "@/lib/email/outbox";
import { resendSend } from "@/lib/email/resend";
import { emailConfig } from "@/lib/email/config";
import { retryPending, sanityPending } from "@/lib/email/signups";
import { checkSmallSupplier } from "@/lib/editions/smallSupplierCheck";

/**
 * The daily job (Vercel Cron, vercel.json, just after midnight UTC when
 * Resend's daily allowance resets): sends the emails that waited, order
 * and shipping first, oldest first; and tries Kit again for any sign up
 * kept while Kit could not be reached; and checks the small supplier
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
  // After the waiting emails, so a threshold email takes no place from an order's.
  const smallSupplier = await checkSmallSupplier(writeClient).catch((e: unknown) => {
    console.error("Small supplier check failed:", e instanceof Error ? e.message : e);
    return { error: true };
  });
  return NextResponse.json({ signups, emails, smallSupplier: "error" in smallSupplier ? "failed" : { sent: smallSupplier.sent } });
}
