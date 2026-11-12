import type { OrderRecord } from "@/lib/editions/orders";
import { ZONES } from "@/lib/editions/shipping";
import { sendEmail } from "./outbox";
import { certificateEmail, checkTaxEmail, madeEmail, orderEmail, shippedEmail } from "./templates";
import { addressOf, emailConfig } from "./config";

/** A short reference for an order, from its Stripe session (the last eight characters). */
const orderRef = (order: Pick<OrderRecord, "sessionId">) => order.sessionId.slice(-8).toUpperCase();

/** After a paid order is recorded: the confirmation, and the certificate for a numbered or one of one piece. */
export async function sendOrderEmails(order: OrderRecord, editionOf: number | null): Promise<void> {
  await sendEmail(
    orderEmail(order.email, {
      pieceName: order.pieceName,
      size: order.size,
      shipsTo: ZONES.find((z) => z.value === order.zone)?.label ?? null,
      price: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      collectorNumber: order.collectorNumber,
      orderRef: orderRef(order),
    }),
  );
  if (order.checkTax && order.taxProvince) {
    await sendEmail(checkTaxEmail(addressOf(emailConfig().fromEditions), { pieceName: order.pieceName, orderRef: orderRef(order), taxProvince: order.taxProvince, shipProvince: order.shipProvince }));
  }
  if (order.certificateCode) {
    await sendEmail(certificateEmail(order.email, { pieceName: order.pieceName, number: order.editionNumber ?? null, of: editionOf, code: order.certificateCode }));
  }
}

export const sendMadeEmail = (order: OrderRecord) => sendEmail(madeEmail(order.email, order.pieceName, orderRef(order)));

export const sendShippedEmail = (order: OrderRecord) =>
  sendEmail(shippedEmail(order.email, order.pieceName, orderRef(order), { number: order.trackingNumber ?? "", url: order.trackingUrl }));
