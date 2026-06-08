import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";

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

    const body = await request.json();

    // Honeypot: a filled hidden field means a bot. Silently accept (200) so
    // the bot can't tell it was rejected, and write nothing to Sanity.
    if (isHoneypotFilled(body)) {
      return NextResponse.json({ success: true });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!writeClient) {
      console.error("SANITY_API_TOKEN is not configured. Newsletter subscription was not saved.");
      return NextResponse.json(
        { error: "Unable to subscribe at this time. Please try again later." },
        { status: 500 },
      );
    }

    await writeClient.create({
      _type: "newsletterSubscriber",
      email,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
