import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";
import { sendEmail } from "@/lib/email/outbox";
import { emailConfig } from "@/lib/email/config";
import { messageThanksEmail } from "@/lib/email/templates";
import { receive } from "@/lib/inbox/receive";

export async function POST(request: Request) {
  try {
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

    if (isHoneypotFilled(body)) {
      return NextResponse.json({ success: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const story = typeof body.story === "string" ? body.story.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const instagram =
      typeof body.instagram === "string" ? body.instagram.trim() : "";
    const projectTitle =
      typeof body.projectTitle === "string" ? body.projectTitle.trim() : "";

    if (!name || !email || !story) {
      return NextResponse.json(
        { error: "Name, email, and your story are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (
      name.length > 200 ||
      email.length > 200 ||
      phone.length > 200 ||
      instagram.length > 200 ||
      projectTitle.length > 200 ||
      story.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length." },
        { status: 400 },
      );
    }

    // Saved first, privately (a private id: until 13 Nov these were written
    // with a public id, readable by anyone; none existed), then emailed to
    // Maninder, then confirmed to the sender (lib/inbox).
    const client = writeClient;
    const submittedAt = new Date().toISOString();
    const result = await receive({
      message: {
        kind: "collaboration",
        via: projectTitle ? `Project interest: ${projectTitle}` : "Project interest",
        name,
        email,
        rows: [...(phone ? [["Phone", phone] as [string, string]] : []), ...(instagram ? [["Instagram", instagram] as [string, string]] : [])],
        message: story,
        submittedAt,
      },
      save: async () => {
        if (!client) throw new Error("SANITY_API_TOKEN is not set");
        const doc = await client.create({
          _id: `private.project-interest-${randomUUID()}`,
          _type: "projectInterest",
          kind: "collaboration",
          name,
          email,
          phone: phone || undefined,
          instagram: instagram || undefined,
          story,
          projectTitle: projectTitle || undefined,
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
