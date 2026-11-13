import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";
import { markProposalNotified, saveProposal } from "@/lib/editions/records";
import { sendEmail } from "@/lib/email/outbox";
import { emailConfig } from "@/lib/email/config";
import { proposalReceivedEmail } from "@/lib/email/templates";
import { receive } from "@/lib/inbox/receive";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * A collaboration proposal (For artists): saved privately, emailed to
 * Maninder, and the artist told it arrived, with no promise of a reply
 * (only proposals that fit a coming Collection get one). Never lost:
 * lib/inbox/receive.ts.
 */
export async function POST(request: Request) {
  if (!(await editionsAllowed("any"))) return editionsOff();
  const limit = rateLimit(`editions-proposal:${getClientIp(request)}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  if (isHoneypotFilled(body)) return NextResponse.json({ success: true });

  const p = {
    name: text(body.name, 120),
    email: text(body.email, 254),
    practice: text(body.practice, 200),
    link: text(body.link, 400),
    idea: text(body.idea, 3000),
  };
  if (!p.name || !p.practice || !p.idea) {
    return NextResponse.json({ error: "Your name, what you make and your idea are needed." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (p.link && !/^https?:\/\//i.test(p.link)) p.link = `https://${p.link}`;

  const submittedAt = new Date().toISOString();
  const result = await receive({
    message: {
      kind: "artists",
      via: "For artists",
      name: p.name,
      email: p.email,
      rows: [["Makes", p.practice], ["Work", p.link || "No link"]],
      message: p.idea,
      submittedAt,
    },
    save: () => saveProposal({ ...p, submittedAt }),
    markNotified: markProposalNotified,
    thanks: proposalReceivedEmail(p.email, p.name),
    send: sendEmail,
    notifyTo: emailConfig().notifyTo,
  });
  if (!result.ok) {
    return NextResponse.json({ error: "Unable to send that right now. Please try again later." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
