import { NextResponse } from "next/server";
import { verifyStripeSignature, type CheckoutSession } from "@/lib/editions/stripe";
import { processPaidSession } from "@/lib/editions/orders";
import { sanityOrderStore } from "@/lib/editions/records";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

/**
 * Stripe's webhook (docs/editions-setup.md). Only signed events are read
 * (STRIPE_WEBHOOK_SECRET). A paid Checkout Session records the order,
 * counts the sale, assigns the collector number and, for numbered and one
 * of one pieces, the edition number and certificate code. Stripe sends an
 * event again if it does not get a 2xx; the order's fixed ID makes a
 * repeat change nothing.
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
