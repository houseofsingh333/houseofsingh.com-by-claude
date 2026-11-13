import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";
import { sendEmail } from "@/lib/email/outbox";
import { emailConfig } from "@/lib/email/config";
import { messageThanksEmail } from "@/lib/email/templates";
import { contactKind } from "@/lib/inbox/kinds";
import { receive } from "@/lib/inbox/receive";

/**
 * Format the branching detail fields into a human-readable summary
 * so the Sanity document is easy to read at a glance.
 */
/** Every detail answer, label and text, in the order asked. */
function detailRows(body: Record<string, unknown>): [string, string][] {
  const rows: [string, string][] = [];

  const add = (label: string, key: string) => {
    const val = body[key];
    if (typeof val === "string" && val.trim()) {
      rows.push([label, val.trim()]);
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

  return rows;
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

    // Size limit (413) and JSON validity (400) are checked before any parsing.
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.body;

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

    const rows = detailRows(body);
    const details = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
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

    // Saved first (a private id: never readable from the public dataset),
    // then emailed to Maninder, then confirmed to the sender (lib/inbox).
    const kind = contactKind(body, intent);
    const submittedAt = new Date().toISOString();
    const client = writeClient;
    const longest = rows.reduce<[string, string] | null>((m, r) => (!m || r[1].length > m[1].length ? r : m), null);
    const result = await receive({
      message: {
        kind,
        via: intent ? `Contact form: ${intent}` : "Contact form",
        name,
        email,
        rows: [...(phone ? [["Phone", phone] as [string, string]] : []), ...rows.filter((r) => r !== longest), ...(referralSource ? [["Heard of us", referralSource] as [string, string]] : [])],
        message: longest?.[1],
        submittedAt,
      },
      save: async () => {
        // Without the token the message is not saved, but the email below still carries it.
        if (!client) throw new Error("SANITY_API_TOKEN is not set");
        const doc = await client.create({
          _id: `private.contact-${randomUUID()}`,
          _type: "contactSubmission",
          kind,
          intent,
          name,
          email,
          phone: phone || undefined,
          details: details || undefined,
          referralSource: referralSource || undefined,
          submittedAt,
        });
        return doc._id;
      },
      markNotified: async (id, outcome) => {
        await client!.patch(id).set({ notified: outcome, notifiedAt: new Date().toISOString() }).commit();
      },
      thanks: messageThanksEmail(email, name),
      send: sendEmail,
      notifyTo: emailConfig().notifyTo,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Unable to send that right now. Please try again in a few minutes." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
