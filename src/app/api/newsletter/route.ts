/**
 * The footer newsletter: the email goes to Kit with the tag "Letters" and
 * the consent given; the welcome email follows at once through Resend
 * (docs/email.md).
 */
import { NextResponse } from "next/server";
import { signUp, sanityPending } from "@/lib/email/signups";
import { consentRecord } from "@/lib/email/consent";
import { sendEmail } from "@/lib/email/outbox";
import { welcomeEmail } from "@/lib/email/templates";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";

export async function POST(request: Request) {
  try {
    // Rate limit by IP first — cheapest guard against flooding.
    const limit = rateLimit(getClientIp(request));
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    // Size limit (413) and JSON validity (400) are checked before any parsing.
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.body;

    // Honeypot: a filled hidden field means a bot. Silently accept (200) so
    // the bot can't tell it was rejected, and keep nothing.
    if (isHoneypotFilled(body)) {
      return NextResponse.json({ success: true });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";

    // 254 characters is the longest valid email address.
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    // To Kit, tagged "Letters", with the consent as shown beneath the
    // field. If Kit cannot be reached, kept privately to retry (no one is
    // lost); once Kit has it, the website keeps no copy of the email.
    try {
      await signUp(
        {
          email,
          tag: "Letters",
          kind: "letters",
          // The words that were shown: the footer's line, or the menu's.
          consent:
            body.form === "menu"
              ? consentRecord("lettersMenu", "the menu's newsletter, houseofsingh.com")
              : consentRecord("letters", "the newsletter form, houseofsingh.com"),
        },
        sanityPending(),
      );
    } catch (error) {
      console.error("Newsletter sign up was not saved:", error instanceof Error ? error.message : error);
      return NextResponse.json(
        { error: "Unable to subscribe at this time. Please try again later." },
        { status: 500 },
      );
    }
    // The welcome, at once (Resend, within the daily limit).
    await sendEmail(welcomeEmail(email));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
