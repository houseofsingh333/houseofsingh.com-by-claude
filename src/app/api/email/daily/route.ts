import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { drain, sanityOutbox } from "@/lib/email/outbox";
import { resendSend } from "@/lib/email/resend";
import { emailConfig } from "@/lib/email/config";
import { retryPending, sanityPending } from "@/lib/email/signups";

/**
 * The daily job (Vercel Cron, vercel.json, just after midnight UTC when
 * Resend's daily allowance resets): sends the emails that waited, order
 * and shipping first, oldest first; and tries Kit again for any sign up
 * kept while Kit could not be reached. Only Vercel's cron may call it
 * (Authorization: Bearer CRON_SECRET).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  if (!writeClient) return NextResponse.json({ error: "SANITY_API_TOKEN is not set" }, { status: 500 });

  const pending = sanityPending()!;
  const signups = emailConfig().kitKey ? await retryPending(pending) : { moved: 0, left: -1 };
  const emails = emailConfig().resendKey ? await drain(sanityOutbox(), resendSend) : { sent: 0, left: -1 };
  return NextResponse.json({ signups, emails });
}
