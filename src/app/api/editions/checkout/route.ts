import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ACCESS_COOKIE, hasAccess } from "@/lib/editions/access";
import { checkPurchase, checkoutParams } from "@/lib/editions/checkout";
import { shopNow } from "@/lib/editions/state";
import { freshPiece, freshShipping } from "@/lib/editions/fresh";
import { isZone } from "@/lib/editions/shipping";
import { stripeConfigured, stripePost, type CheckoutSession } from "@/lib/editions/stripe";
import { shopTaxRateIds } from "@/lib/editions/tax";

/**
 * Buy: a plain form post from a piece's page (no client script). Checks,
 * against Sanity as it is now, that the Collection is open (or in early
 * access for a visitor with the code) and the piece and size are in stock;
 * prices shipping from the rate table; creates a Stripe Checkout Session
 * and sends the visitor to it. A refusal returns to the piece with the
 * reason (?buy=…), which the page writes beside Buy.
 */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const back = (slug: string, reason: string) =>
    NextResponse.redirect(new URL(`/editions/${encodeURIComponent(slug)}?buy=${reason}#buy`, origin), 303);

  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") ?? "").slice(0, 80);
  const sizeKey = String(form?.get("size") ?? "").slice(0, 40) || null;
  const zone = String(form?.get("zone") ?? "");
  if (!slug) return NextResponse.redirect(new URL("/editions", origin), 303);
  if (!isZone(zone)) return back(slug, "no-zone");

  const limit = rateLimit(`editions-checkout:${getClientIp(request)}`, { max: 20 });
  if (!limit.success) return back(slug, "busy");
  if (!stripeConfigured()) {
    console.error("STRIPE_SECRET_KEY is not set: checkout is unavailable.");
    return back(slug, "unavailable");
  }

  try {
    const [piece, routes, jar] = await Promise.all([freshPiece(slug), freshShipping(), cookies()]);
    const early = hasAccess(jar.get(ACCESS_COOKIE)?.value, piece?.collection?.earlyAccessCodeHash);
    const check = checkPurchase(piece, sizeKey, zone, routes, early, shopNow());
    if (!check.ok) return back(slug, check.refusal);

    const taxRateIds = await shopTaxRateIds();
    const params = checkoutParams({
      piece: piece!,
      collectionNumber: piece!.collection!.number,
      size: check.size,
      zone,
      shipping: check.shipping,
      taxRateIds,
      siteUrl: origin,
      imageUrl: piece!.photographs?.[0]?.url ? `${piece!.photographs[0].url}?w=1200&fit=max&auto=format` : null,
      gstNumber: process.env.GST_NUMBER || null,
    });
    const session = await stripePost<CheckoutSession>("/v1/checkout/sessions", params);
    if (!session.url) return back(slug, "unavailable");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Editions checkout failed:", error instanceof Error ? error.message : error);
    return back(slug, "unavailable");
  }
}
