import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";
import { saveProposal } from "@/lib/editions/records";
import { sendEmail } from "@/lib/email/outbox";
import { addressOf, emailConfig } from "@/lib/email/config";
import { proposalCopyEmail, proposalReceivedEmail } from "@/lib/email/templates";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * A collaboration proposal (For artists): saved privately; the artist gets
 * an email that it arrived, and Maninder a copy (lib/email).
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

  try {
    await saveProposal(p);
  } catch (error) {
    console.error("Editions proposal was not saved:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to send that right now. Please try again later." }, { status: 500 });
  }
  // The artist hears at once; a copy goes to the Shop's own address.
  await sendEmail(proposalReceivedEmail(p.email, p.name));
  await sendEmail(proposalCopyEmail(addressOf(emailConfig().fromEditions), p));
  return NextResponse.json({ success: true });
}
