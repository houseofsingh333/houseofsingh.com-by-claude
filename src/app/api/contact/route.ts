import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";

/**
 * Format the branching detail fields into a human-readable summary
 * so the Sanity document is easy to read at a glance.
 */
function formatDetails(body: Record<string, unknown>): string {
  const lines: string[] = [];

  const add = (label: string, key: string) => {
    const val = body[key];
    if (typeof val === "string" && val.trim()) {
      lines.push(`${label}: ${val.trim()}`);
    }
  };

  // Commercial
  add("Project name", "projectName");
  add("Project description", "projectDescription");
  add("Budget", "budget");
  add("Timeline", "timeline");

  // Collaboration
  add("Collaboration type", "collabType");
  add("Portfolio link", "portfolioLink");
  add("Social handle", "socialHandle");
  add("Collaboration description", "collabDescription");
  add("Collaboration timeline", "collabTimeline");

  // Media
  add("Media outlet", "mediaOutlet");
  add("Inquiry type", "inquiryType");
  add("Deadline", "deadline");
  add("Media description", "mediaDescription");

  // Something Else
  add("Message", "freeformMessage");

  return lines.join("\n");
}

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

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const intent = typeof body.intent === "string" ? body.intent.trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const details = formatDetails(body);
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const referralSource =
      typeof body.referralSource === "string"
        ? body.referralSource.trim()
        : "";

    if (
      name.length > 200 ||
      email.length > 200 ||
      intent.length > 200 ||
      phone.length > 200 ||
      referralSource.length > 200 ||
      details.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length." },
        { status: 400 },
      );
    }

    if (!writeClient) {
      console.error("SANITY_API_TOKEN is not configured. Contact submission was not saved.");
      return NextResponse.json(
        { error: "Unable to process your request at this time. Please try again later." },
        { status: 500 },
      );
    }

    await writeClient.create({
      _type: "contactSubmission",
      intent,
      name,
      email,
      phone: phone || undefined,
      details: details || undefined,
      referralSource: referralSource || undefined,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
