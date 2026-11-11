import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";
import { readJsonBody } from "@/lib/read-json-body";
import { sanityFetch } from "@/sanity/fetch";
import { collectionTitle } from "@/lib/editions/format";
import { signUp, sanityPending } from "@/lib/email/signups";
import { consentRecord } from "@/lib/email/consent";
import { sendEmail } from "@/lib/email/outbox";
import { notifyEmail } from "@/lib/email/templates";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

/**
 * "Notify me": the email goes to Kit, tagged with the Collection ("Collection
 * 01"), with the consent shown beneath the field; the confirmation follows
 * at once through Resend. Same guards as the newsletter: rate limit, size
 * limit, honeypot.
 */
export async function POST(request: Request) {
  if (!(await editionsAllowed("any"))) return editionsOff();
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
  // The tag is the Collection's title, and only a real one: a Collection
  // in Sanity, or the next one after the latest.
  const numbers = (await sanityFetch<number[] | null>({ query: `*[_type == "editionsCollection" && defined(number)].number`, revalidate: 60 })) ?? [];
  const allowed = new Set([...numbers, Math.max(0, ...numbers) + 1].map(collectionTitle));
  const tag = allowed.has(collection) ? collection : collectionTitle(Math.max(0, ...numbers) + (numbers.length ? 0 : 1));
  try {
    await signUp({ email, tag, kind: "shop", consent: consentRecord("shop", `Notify me for ${tag}, houseofsingh.com/editions`) }, sanityPending());
  } catch (error) {
    console.error("Editions notify request was not saved:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to save that right now. Please try again later." }, { status: 500 });
  }
  await sendEmail(notifyEmail(email, tag));
  return NextResponse.json({ success: true });
}
