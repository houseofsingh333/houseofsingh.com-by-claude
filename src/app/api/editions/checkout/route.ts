import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ACCESS_COOKIE, hasAccess } from "@/lib/editions/access";
import { checkPurchase, checkoutParams } from "@/lib/editions/checkout";
import { shopNow } from "@/lib/editions/state";
import { freshPiece, freshShipping } from "@/lib/editions/fresh";
import { isZone } from "@/lib/editions/shipping";
import { stripeConfigured, stripePost, type CheckoutSession } from "@/lib/editions/stripe";
import { taxRateFor } from "@/lib/editions/tax";
import { taxMode, taxForPostalCode } from "@/lib/editions/tax-rates";
import { placeHold, releaseHold } from "@/lib/editions/holds";
import { sanityHoldStore } from "@/lib/editions/records";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

/**
 * Buy: a plain form post from a piece's page (no client script). Checks,
 * against Sanity as it is now, that the Collection is open (or in early
 * access for a visitor with the code) and the piece and size are in stock;
 * prices shipping from the rate table; creates a Stripe Checkout Session
 * and sends the visitor to it. A refusal returns to the piece with the
 * reason (?buy=…), which the page writes beside Buy.
 */
/** Where Stripe's Checkout pages live (a local stand-in in testing). */
const STRIPE_CHECKOUT_ORIGIN = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE).origin : "https://checkout.stripe.com";

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Without JavaScript: a page that moves on to Stripe by itself. The site's
 * security policy lets a form post only to the site ("form-action 'self'"),
 * and browsers apply that to a redirect after the post too, so a redirect
 * to Stripe would be refused. A page that then moves on is not a form post.
 */
function toCheckout(url: string) {
  const u = escape(url);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${u}"><title>Secure checkout</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:48px 24px;background:#F9F7F5;color:#1A1A1A;font:16px/1.6 Arial,sans-serif"><p>Taking you to secure checkout by Stripe. <a href="${u}" style="color:#1A1A1A">Continue</a></p></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await editionsAllowed("full"))) return editionsOff();
  const origin = new URL(request.url).origin;
  // The Buy form sends this from the page (fetch) and moves to Stripe
  // itself; a plain form post (no JavaScript) gets redirects and pages.
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const back = (slug: string, reason: string) =>
    wantsJson
      ? NextResponse.json({ refusal: reason }, { status: 409 })
      : NextResponse.redirect(new URL(`/editions/${encodeURIComponent(slug)}?buy=${reason}#buy`, origin), 303);

  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") ?? "").slice(0, 80);
  const sizeKey = String(form?.get("size") ?? "").slice(0, 40) || null;
  const zone = String(form?.get("zone") ?? "");
  if (!slug) return NextResponse.redirect(new URL("/editions", origin), 303);
  if (!isZone(zone)) return back(slug, "no-zone");
  // No tax by default (TAX_MODE "none"). Kept for a future registration:
  // fixed tax, where for Canada the postal code sets the province, and so
  // the GST/HST; Stripe Tax, which works it out from the address at checkout.
  const mode = taxMode();
  const tax = mode === "fixed" && zone === "canada" ? taxForPostalCode(String(form?.get("postal") ?? "").slice(0, 10)) : null;
  if (mode === "fixed" && zone === "canada" && !tax) return back(slug, "postal-needed");

  const limit = rateLimit(`editions-checkout:${getClientIp(request)}`, { max: 20 });
  if (!limit.success) return back(slug, "busy");
  if (!stripeConfigured()) {
    console.error("STRIPE_SECRET_KEY is not set: checkout is unavailable.");
    return back(slug, "unavailable");
  }

  let holdKey: string | null = null;
  let heldPiece: string | null = null;
  try {
    const [piece, routes, jar] = await Promise.all([freshPiece(slug), freshShipping(), cookies()]);
    const early = hasAccess(jar.get(ACCESS_COOKIE)?.value, piece?.collection?.earlyAccessCodeHash);
    const check = checkPurchase(piece, sizeKey, zone, routes, early, shopNow());
    if (!check.ok) return back(slug, check.refusal);

    // Hold the unit (and size) for this checkout, so it cannot be sold twice.
    const hold = await placeHold(sanityHoldStore(), piece!._id, check.size?._key ?? null);
    if (!hold.ok) return back(slug, hold.reason === "busy" ? "busy" : hold.reason);
    holdKey = hold.key;
    heldPiece = piece!._id;

    const taxRate = tax ? await taxRateFor(tax.province) : null;
    if (tax && !taxRate) throw new Error(`No Stripe tax rate for ${tax.province}: run scripts/editions-tax-rates.ts`);
    const params = checkoutParams({
      piece: piece!,
      collectionNumber: piece!.collection!.number,
      size: check.size,
      zone,
      shipping: check.shipping,
      taxRate: taxRate ? { id: taxRate.id, province: taxRate.province } : null,
      taxMode: mode,
      siteUrl: origin,
      imageUrl: piece!.photographs?.[0]?.url ? `${piece!.photographs[0].url}?w=1200&fit=max&auto=format` : null,
      gstNumber: process.env.GST_NUMBER || null,
      holdKey,
    });
    const session = await stripePost<CheckoutSession>("/v1/checkout/sessions", params);
    if (!session.url || !session.url.startsWith(STRIPE_CHECKOUT_ORIGIN)) throw new Error("Stripe gave no checkout address");
    if (wantsJson) return NextResponse.json({ url: session.url });
    return toCheckout(session.url);
  } catch (error) {
    console.error("Editions checkout failed:", error instanceof Error ? error.message : error);
    // No checkout: let the hold go at once rather than in half an hour.
    if (holdKey && heldPiece) await releaseHold(sanityHoldStore(), heldPiece, holdKey).catch(() => {});
    return back(slug, "unavailable");
  }
}
