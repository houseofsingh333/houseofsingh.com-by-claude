import { available, canBuy, collectionState, sizeAvailable } from "./state";
import { freeUnits } from "./holds";
import { shippingPrice, zoneCountries, ZONES } from "./shipping";
import type { CollectionState, EditionsCollection, EditionsPiece, ShippingRoute, Zone } from "./types";
import { collectionTitle } from "./format";
import { EDITIONS_DEFAULTS } from "./defaults";
import { TAX_CODES, type TaxMode } from "./tax-rates";

/**
 * Buying a piece: the checks before Stripe, then the Checkout Session's
 * parameters. Pure functions, so they are tested without Stripe or Sanity
 * (scripts/editions-test.ts).
 */

export type BuyRefusal =
  | "not-found"
  | "not-open"
  | "sold-out"
  | "size-needed"
  | "size-sold-out"
  | "held"
  | "postal-needed"
  | "no-shipping";

export const REFUSAL_WORDS: Record<BuyRefusal, string> = {
  "not-found": "This piece could not be found.",
  "not-open": "This Collection is not open.",
  "sold-out": "This piece is sold out.",
  "size-needed": "Choose a size first.",
  "size-sold-out": "This size is sold out.",
  "postal-needed": "Enter your Canadian postal code: it sets the GST or HST for your province.",
  held: "The last one is in someone's checkout just now. If it is not bought, it comes back within half an hour.",
  "no-shipping": "This piece cannot ship there yet. Write to me and I will find a way.",
};

type PieceWithCollection = EditionsPiece & {
  collection: (EditionsCollection & { pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[] }) | null;
};

export type BuyCheck =
  | { ok: true; state: CollectionState; shipping: number; size: { _key: string; label: string } | null }
  | { ok: false; refusal: BuyRefusal };

export function checkPurchase(
  piece: PieceWithCollection | null,
  sizeKey: string | null,
  zone: Zone,
  routes: ShippingRoute[] | null,
  hasEarlyAccess: boolean,
  now: Date,
): BuyCheck {
  if (!piece || !piece.collection) return { ok: false, refusal: "not-found" };
  const state = collectionState(piece.collection, piece.collection.pieces, now, hasEarlyAccess);
  if (!canBuy(state)) return { ok: false, refusal: "not-open" };
  if (available(piece) === 0) return { ok: false, refusal: "sold-out" };
  let size: { _key: string; label: string } | null = null;
  if (piece.sizes && piece.sizes.length > 0) {
    if (!sizeKey) return { ok: false, refusal: "size-needed" };
    const s = piece.sizes.find((x) => x._key === sizeKey);
    if (!s) return { ok: false, refusal: "size-needed" };
    if (sizeAvailable(piece, sizeKey) === 0) return { ok: false, refusal: "size-sold-out" };
    size = { _key: s._key, label: s.label };
  }
  // Units in someone's checkout are not free, though not sold either
  // (holds run on real time, not the test clock).
  if (freeUnits(piece, size?._key ?? null, Date.now()) === 0) return { ok: false, refusal: "held" };
  const shipping = shippingPrice(routes, piece.shipsFrom, zone, piece.packedWeight);
  if (shipping === null) return { ok: false, refusal: "no-shipping" };
  return { ok: true, state, shipping, size };
}

const cents = (cad: number) => Math.round(cad * 100);

/**
 * One piece, quantity 1, in CAD, and shipping as a second line. No tax by
 * default (TAX_MODE "none"). With a future registration, GST/HST applies
 * to both lines in Canada: fixed tax rates ("fixed") or Stripe Tax
 * ("stripe"). The address can only be in the chosen zone's countries.
 */
export function checkoutParams(input: {
  piece: EditionsPiece;
  collectionNumber: number;
  size: { _key: string; label: string } | null;
  zone: Zone;
  shipping: number;
  /** Canada, fixed mode: the province's Stripe tax rate (from the postal code), and the province. */
  taxRate?: { id: string; province: string } | null;
  /** "none": no tax; "stripe": Stripe Tax works it out from the shipping address; "fixed": taxRate. Unset: "fixed" with a taxRate, else "none". */
  taxMode?: TaxMode;
  siteUrl: string;
  imageUrl?: string | null;
  gstNumber?: string | null;
  /** The stock held for this checkout (lib/editions/holds.ts). */
  holdKey?: string | null;
  now?: Date;
}) {
  const { piece, size, zone, shipping, siteUrl } = input;
  const zoneLabel = ZONES.find((z) => z.value === zone)?.label ?? zone;
  // Unset: fixed when a province's rate is given, otherwise none.
  const mode: TaxMode = input.taxMode ?? (input.taxRate ? "fixed" : "none");
  const stripeTax = mode === "stripe";
  // None: no tax at all. Fixed: the province's GST/HST on the piece and on
  // shipping. Stripe Tax: prices exclusive of tax, each with its tax code.
  const rate = mode === "fixed" ? (input.taxRate ?? null) : null;
  const taxes = rate ? { tax_rates: [rate.id] } : {};
  const metadata = {
    pieceId: piece._id,
    pieceSlug: piece.slug,
    pieceName: piece.name.slice(0, 450),
    size: size?.label ?? "",
    sizeKey: size?._key ?? "",
    zone,
    price: String(piece.price),
    shipping: String(shipping),
    holdKey: input.holdKey ?? "",
    taxProvince: rate?.province ?? "",
    taxMode: mode,
    collection: String(input.collectionNumber),
  };
  // A GST/HST number shows only while tax is charged (a future registration).
  const charged = stripeTax || Boolean(rate);
  const seller = `Sold by ${EDITIONS_DEFAULTS.seller}${charged && input.gstNumber ? `. GST/HST ${input.gstNumber}` : ""}.`;
  const now = input.now ?? new Date();
  return {
    mode: "payment",
    currency: "cad",
    // Payment methods are not set here: Stripe no longer accepts them on a
    // Checkout Session. They are managed in the Stripe Dashboard (cards and
    // Link on, Affirm and Klarna off, in sandbox and live: docs/editions-setup.md).
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: cents(piece.price),
          ...(stripeTax ? { tax_behavior: "exclusive" } : {}),
          product_data: {
            name: size ? `${piece.name}, size ${size.label}` : piece.name,
            description: `${EDITIONS_DEFAULTS.brand}, ${collectionTitle(input.collectionNumber)}`,
            ...(input.imageUrl ? { images: [input.imageUrl] } : {}),
            ...(stripeTax ? { tax_code: TAX_CODES.goods } : {}),
          },
        },
        ...taxes,
      },
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: cents(shipping),
          ...(stripeTax ? { tax_behavior: "exclusive" } : {}),
          product_data: {
            name: `Shipping to ${zoneLabel === "Elsewhere" ? "the rest of the world" : zoneLabel}`,
            ...(stripeTax ? { tax_code: TAX_CODES.shipping } : {}),
          },
        },
        ...taxes,
      },
    ],
    shipping_address_collection: { allowed_countries: zoneCountries(zone) },
    // Stripe Tax: the tax from the shipping address given at checkout.
    ...(stripeTax ? { automatic_tax: { enabled: true } } : {}),
    billing_address_collection: "auto",
    customer_creation: "if_required",
    metadata,
    payment_intent_data: { metadata, description: `${EDITIONS_DEFAULTS.brand}: ${piece.name}` },
    custom_text: { submit: { message: seller } },
    success_url: `${siteUrl}/editions/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/editions/${piece.slug}`,
    // Thirty minutes, Stripe's shortest: an unfinished checkout lets go soon.
    expires_at: Math.floor(now.getTime() / 1000) + 30 * 60 + 60,
  };
}
