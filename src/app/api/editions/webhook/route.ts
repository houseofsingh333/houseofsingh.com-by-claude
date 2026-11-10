import { NextResponse } from "next/server";
import { verifyStripeSignature, type CheckoutSession } from "@/lib/editions/stripe";
import { processPaidSession, processRefund, type RefundedCharge } from "@/lib/editions/orders";
import { sanityHoldStore, sanityOrderStore } from "@/lib/editions/records";
import { releaseHold } from "@/lib/editions/holds";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

/**
 * Stripe's webhook (docs/editions-setup.md). Only signed events are read
 * (STRIPE_WEBHOOK_SECRET). A paid Checkout Session records the order,
 * counts the sale, assigns the collector number and, for numbered and one
 * of one pieces, the edition number and certificate code; its hold becomes
 * the sale. An expired or failed checkout releases its hold; a refund in
 * full restocks. Stripe sends an event again if it does not get a 2xx; the
 * order's fixed ID makes a repeat change nothing.
 */
export async function POST(request: Request) {
  if (!(await editionsAllowed("any"))) return editionsOff();
  const raw = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!verifyStripeSignature(raw, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  let event: { type?: string; data?: { object?: CheckoutSession } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const type = event.type ?? "";
  // A checkout that ended unpaid: let its hold go.
  if (type === "checkout.session.expired" || type === "checkout.session.async_payment_failed") {
    const meta = (event.data?.object as CheckoutSession | undefined)?.metadata ?? {};
    if (meta.pieceId && meta.holdKey) await releaseHold(sanityHoldStore(), meta.pieceId, meta.holdKey).catch((e) => console.error("Hold not released:", e));
    return NextResponse.json({ received: true, result: "released" });
  }
  // A payment returned in full: the unit goes back into stock.
  if (type === "charge.refunded") {
    try {
      const result = await processRefund(event.data?.object as unknown as RefundedCharge, sanityOrderStore());
      return NextResponse.json({ received: true, result: result.status });
    } catch (error) {
      console.error("Editions refund failed:", error instanceof Error ? error.message : error);
      return NextResponse.json({ error: "Not recorded yet" }, { status: 500 });
    }
  }
  if (type !== "checkout.session.completed" && type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }
  const session = event.data?.object;
  if (!session?.id) return NextResponse.json({ error: "No session" }, { status: 400 });
  try {
    const result = await processPaidSession(session, sanityOrderStore());
    return NextResponse.json({ received: true, result: result.status });
  } catch (error) {
    // A 500 makes Stripe send the event again later.
    console.error("Editions webhook failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Not recorded yet" }, { status: 500 });
  }
}
