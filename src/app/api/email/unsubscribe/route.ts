import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readUnsubscribeToken } from "@/lib/email/unsubscribe";
import { leave, sanityPending } from "@/lib/email/signups";

/**
 * Unsubscribing (the link in the welcome and the Notify me confirmation).
 * POST, from the /unsubscribe page's button or a mail app's own one click
 * unsubscribe (List-Unsubscribe-Post): the signed link names the person,
 * who is unsubscribed in Kit; if Kit cannot be reached, the request is kept
 * privately and retried daily. GET (a link opened directly, or a mail
 * scanner) only leads to the page, which asks once before acting.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const t = url.searchParams.get("t") ?? "";
  return NextResponse.redirect(new URL(`/unsubscribe?t=${encodeURIComponent(t)}`, url.origin), 303);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const limit = rateLimit(`unsubscribe:${getClientIp(request)}`, { max: 20 });
  if (!limit.success) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });

  const form = await request.formData().catch(() => null);
  const fromPage = form?.get("from") === "page";
  const token = String(form?.get("t") ?? url.searchParams.get("t") ?? "");
  const email = readUnsubscribeToken(token);
  if (!email) {
    return fromPage
      ? NextResponse.redirect(new URL("/unsubscribe?invalid=1", url.origin), 303)
      : NextResponse.json({ error: "This link is not valid." }, { status: 400 });
  }
  try {
    await leave(email, sanityPending());
  } catch (error) {
    console.error("Unsubscribe not recorded:", error instanceof Error ? error.message : error);
    return fromPage
      ? NextResponse.redirect(new URL(`/unsubscribe?t=${encodeURIComponent(token)}&failed=1`, url.origin), 303)
      : NextResponse.json({ error: "Please try again later." }, { status: 503 });
  }
  return fromPage ? NextResponse.redirect(new URL("/unsubscribe?done=1", url.origin), 303) : NextResponse.json({ unsubscribed: true });
}
