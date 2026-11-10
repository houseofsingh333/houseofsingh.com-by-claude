import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TextLink from "@/components/TextLink";
import { stripeConfigured, stripeGet, type CheckoutSession } from "@/lib/editions/stripe";
import { orderBySession } from "@/lib/editions/records";
import { orderId } from "@/lib/editions/orders";
import { cad, fromCents } from "@/lib/editions/format";
import { ZONES } from "@/lib/editions/shipping";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { requireEditions } from "@/lib/editions/enabled";

export const metadata: Metadata = { title: "Thank you" };

const SESSION = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

/**
 * After paying (Stripe's success address): the piece is yours, what was
 * paid, what happens next, and, once the order is recorded by the webhook,
 * the collector number and the certificate. Read from Stripe by the
 * session in the address; the email is never shown here.
 */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  requireEditions();
  const { session_id: id } = await searchParams;
  if (!id || !SESSION.test(id) || !stripeConfigured()) notFound();

  const session = await stripeGet<CheckoutSession>(`/v1/checkout/sessions/${id}`).catch(() => null);
  if (!session) notFound();
  const order = await orderBySession(session.id, orderId(session.id)).catch(() => null);

  const m = session.metadata ?? {};
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const pieceName = order?.pieceName ?? m.pieceName ?? "Your piece";
  const zone = ZONES.find((z) => z.value === m.zone)?.label;
  const rows: [string, string][] = [
    ["Piece", m.size ? `${pieceName}, size ${m.size}` : pieceName],
    ...(zone ? [["Ships to", zone] as [string, string]] : []),
    ["Price", cad(Number(m.price ?? 0))],
    ["Shipping", cad(Number(m.shipping ?? 0))],
    ["Tax", cad(fromCents(session.total_details?.amount_tax))],
    ["Total", cad(fromCents(session.amount_total))],
  ];

  return (
    <div className="ed-page">
      <section className="ed-thanks" aria-labelledby="ed-thanks-title">
        <span className="type-label text-muted-foreground">{session.livemode ? "Thank you" : "Thank you · Test order, no payment taken"}</span>
        <h1 id="ed-thanks-title" className="font-editorial font-normal text-display-l leading-[1.05] text-foreground">
          {paid ? `Thank you. ${pieceName} is yours.` : "Thank you. Your payment is being confirmed."}
        </h1>
        <dl className="ed-summary">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="type-label text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="ed-thanks-next">
          <h2 className="type-label text-muted-foreground">What happens next</h2>
          <p className="text-body text-foreground">{EDITIONS_DEFAULTS.shippingLine}</p>
          <p className="text-body text-muted-foreground">{`A receipt from ${EDITIONS_DEFAULTS.seller} is on its way by email.`}</p>
        </div>
        {order ? (
          <div className="ed-thanks-collector">
            <span className="type-label text-muted-foreground">Collector</span>
            <span className="font-editorial text-display-m text-foreground">{`No. ${String(order.collectorNumber).padStart(4, "0")}`}</span>
            {order.certificateCode && <TextLink href={`/editions/verify/${order.certificateCode}`}>Your certificate</TextLink>}
          </div>
        ) : (
          paid && <p className="text-small text-muted-foreground">Your collector number and certificate appear here in a moment. Refresh this page to see them.</p>
        )}
        <TextLink href="/editions" back>
          The Shop
        </TextLink>
      </section>
    </div>
  );
}
