import { createHash, randomBytes } from "node:crypto";
import type { CheckoutSession, StripeAddress } from "./stripe";

/**
 * What happens when Stripe reports a paid Checkout Session (the webhook):
 * the order is recorded privately, the piece's sold count goes up (per size
 * where it has sizes), the buyer's lifelong collector number is assigned
 * or reused, and numbered editions and one of one pieces get their edition
 * number and certificate code. Written against a small store, so the same
 * logic runs on Sanity in production and in memory in tests.
 */

export type OrderPiece = {
  _id: string;
  name: string;
  editionType: "numbered" | "limited" | "one-of-one";
  quantity: number;
  soldCount?: number | null;
  sizes?: { _key: string; label: string; stock: number; sold?: number | null }[] | null;
};

export type OrderRecord = {
  _id: string;
  _type: "editionsOrder";
  sessionId: string;
  paymentIntent: string | null;
  testMode: boolean;
  piece: { _type: "reference"; _ref: string; _weak: true };
  pieceName: string;
  size?: string;
  zone?: string;
  email: string;
  name?: string;
  shippingAddress?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  collectorNumber: number;
  editionNumber?: number;
  certificateCode?: string;
  paidAt: string;
  /** paid → made → shipped; refunded when the payment is returned in full. */
  status?: "paid" | "made" | "shipped" | "refunded";
  sizeKey?: string;
  madeAt?: string;
  shippedAt?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  refundedAt?: string;
};

export interface OrderStore {
  getPiece(id: string): Promise<OrderPiece | null>;
  getOrder(id: string): Promise<OrderRecord | null>;
  /** The collector for this email (by its private id), or a new one with the next number. */
  collectorNumber(collectorId: string, email: string, at: string): Promise<number>;
  /**
   * Creates the order and counts the sale in one transaction: if the order
   * already exists (Stripe sent the event again), nothing changes and
   * this returns false. Returns the piece's sold count after the sale.
   */
  createOrderAndCount(order: OrderRecord, pieceId: string, sizeKey: string | null, holdKey: string | null): Promise<{ created: boolean; soldAfter: number }>;
  setOrderFields(id: string, fields: Partial<OrderRecord>): Promise<void>;
  /** The order paid with this payment, if any. */
  orderByPayment(paymentIntent: string): Promise<OrderRecord | null>;
  /**
   * Marks the order refunded and puts the unit back (the piece's sold
   * count, and the size's) in one transaction, only if the order is still
   * at this revision and not already refunded.
   */
  refundAndRestock(order: OrderRecord & { _rev?: string }, at: string): Promise<boolean>;
}

/** Private IDs: Sanity never serves a document with a dot in its ID without a token. */
export const orderId = (sessionId: string) => `private.editions-order-${sessionId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
export const collectorId = (email: string) =>
  `private.editions-collector-${createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32)}`;

/** A certificate code: ten letters and digits, easy to read (no 0, O, 1, I, L). */
export function certificateCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(10), (b) => alphabet[b % alphabet.length]).join("");
}

export function addressLines(a: StripeAddress | null | undefined, name?: string | null): string | undefined {
  if (!a) return undefined;
  const city = [a.city, a.state, a.postal_code].filter(Boolean).join(" ");
  return [name, a.line1, a.line2, city, a.country].filter(Boolean).join("\n") || undefined;
}

export type ProcessResult = { status: "recorded" | "duplicate" | "ignored"; reason?: string; order?: OrderRecord; editionOf?: number | null };

export async function processPaidSession(session: CheckoutSession, store: OrderStore, now = new Date()): Promise<ProcessResult> {
  if (session.payment_status !== "paid") return { status: "ignored", reason: "not paid" };
  const meta = session.metadata ?? {};
  const pieceId = meta.pieceId;
  if (!pieceId) return { status: "ignored", reason: "not a Shop session" };
  const id = orderId(session.id);
  if (await store.getOrder(id)) return { status: "duplicate" };

  const piece = await store.getPiece(pieceId);
  if (!piece) return { status: "ignored", reason: "piece not found" };
  const email = session.customer_details?.email?.trim() ?? "";
  if (!email) return { status: "ignored", reason: "no email" };

  const paidAt = now.toISOString();
  const collector = await store.collectorNumber(collectorId(email), email, paidAt);
  const shipTo = session.collected_information?.shipping_details ?? session.shipping_details ?? null;
  const certified = piece.editionType === "numbered" || piece.editionType === "one-of-one";
  const sizeKey = meta.sizeKey || null;

  const order: OrderRecord = {
    _id: id,
    _type: "editionsOrder",
    sessionId: session.id,
    paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
    testMode: !session.livemode,
    piece: { _type: "reference", _ref: piece._id, _weak: true },
    pieceName: piece.name,
    size: meta.size || undefined,
    zone: meta.zone || undefined,
    email,
    name: session.customer_details?.name ?? shipTo?.name ?? undefined,
    shippingAddress: addressLines(shipTo?.address, shipTo?.name),
    subtotal: Number(meta.price ?? 0),
    shipping: Number(meta.shipping ?? 0),
    tax: (session.total_details?.amount_tax ?? 0) / 100,
    total: (session.amount_total ?? 0) / 100,
    collectorNumber: collector,
    certificateCode: certified ? certificateCode() : undefined,
    paidAt,
    status: "paid",
    sizeKey: sizeKey ?? undefined,
  };

  const { created, soldAfter } = await store.createOrderAndCount(order, piece._id, sizeKey, meta.holdKey || null);
  if (!created) return { status: "duplicate" };
  if (certified) {
    // The edition number is the sale's place in the edition: 1 for a one of one.
    const editionNumber = piece.editionType === "one-of-one" ? 1 : soldAfter;
    await store.setOrderFields(id, { editionNumber });
    order.editionNumber = editionNumber;
  }
  return { status: "recorded", order, editionOf: piece.editionType === "numbered" ? piece.quantity : null };
}

/** A charge, as Stripe's charge.refunded event carries it. */
export type RefundedCharge = { payment_intent?: string | null; refunded?: boolean; amount?: number; amount_refunded?: number };

/**
 * A refund: when the payment is returned in full, the order is marked
 * refunded and its unit goes back into stock (and its size's), once. A
 * partial refund (a gesture, a shipping difference) changes no stock.
 */
export async function processRefund(charge: RefundedCharge, store: OrderStore, now = new Date()): Promise<{ status: "restocked" | "ignored"; reason?: string }> {
  const full = charge.refunded === true || (charge.amount !== undefined && charge.amount_refunded !== undefined && charge.amount_refunded >= charge.amount);
  if (!full) return { status: "ignored", reason: "partial refund" };
  if (!charge.payment_intent) return { status: "ignored", reason: "no payment" };
  const order = await store.orderByPayment(charge.payment_intent);
  if (!order) return { status: "ignored", reason: "not a Shop order" };
  if (order.status === "refunded") return { status: "ignored", reason: "already refunded" };
  const done = await store.refundAndRestock(order, now.toISOString());
  return done ? { status: "restocked" } : { status: "ignored", reason: "changed meanwhile" };
}
