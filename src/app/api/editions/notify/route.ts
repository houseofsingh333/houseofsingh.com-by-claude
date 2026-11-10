import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";
import { saveNotify } from "@/lib/editions/records";

/**
 * "Notify me": an email and the Collection it is for, saved privately with
 * the visitor's consent (the note beneath the field says what it is for).
 * Same guards as the newsletter: rate limit, size limit, honeypot.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`editions-notify:${getClientIp(request)}`);
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

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const collection = typeof body.collection === "string" ? body.collection.trim().slice(0, 40) : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  try {
    await saveNotify(email, collection || "The next Collection");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Editions notify request was not saved:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to save that right now. Please try again later." }, { status: 500 });
  }
}
