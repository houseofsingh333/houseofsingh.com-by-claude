import { available, canBuy, collectionState, sizeAvailable } from "./state";
import { freeUnits } from "./holds";
import { shippingPrice, zoneCountries, ZONES } from "./shipping";
import type { CollectionState, EditionsCollection, EditionsPiece, ShippingRoute, Zone } from "./types";
import { collectionTitle } from "./format";
import { EDITIONS_DEFAULTS } from "./defaults";

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
  | "no-shipping";

export const REFUSAL_WORDS: Record<BuyRefusal, string> = {
  "not-found": "This piece could not be found.",
  "not-open": "This Collection is not open.",
  "sold-out": "This piece is sold out.",
  "size-needed": "Choose a size first.",
  "size-sold-out": "This size is sold out.",
  held: "The last one is in someone's checkout just now. If it is not bought, it comes back within half an hour.",
  "no-shipping": "This piece cannot ship there yet. Write to us and we will find a way.",
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
 * One piece, quantity 1, in CAD. Shipping is a second line, so GST/HST
 * applies to it too, as it must in Canada; both lines carry the Shop's
 * dynamic tax rates, which match Canadian shipping addresses only. The
 * address can only be in the chosen zone's countries.
 */
export function checkoutParams(input: {
  piece: EditionsPiece;
  collectionNumber: number;
  size: { _key: string; label: string } | null;
  zone: Zone;
  shipping: number;
  taxRateIds: string[];
  siteUrl: string;
  imageUrl?: string | null;
  gstNumber?: string | null;
  /** The stock held for this checkout (lib/editions/holds.ts). */
  holdKey?: string | null;
  now?: Date;
}) {
  const { piece, size, zone, shipping, taxRateIds, siteUrl } = input;
  const zoneLabel = ZONES.find((z) => z.value === zone)?.label ?? zone;
  const taxes = taxRateIds.length > 0 ? { dynamic_tax_rates: taxRateIds } : {};
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
    collection: String(input.collectionNumber),
  };
  const seller = `Sold by ${EDITIONS_DEFAULTS.seller}${input.gstNumber ? `. GST/HST ${input.gstNumber}` : ""}.`;
  const now = input.now ?? new Date();
  return {
    mode: "payment",
    currency: "cad",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: cents(piece.price),
          tax_behavior: "exclusive",
          product_data: {
            name: size ? `${piece.name}, size ${size.label}` : piece.name,
            description: `${EDITIONS_DEFAULTS.brand}, ${collectionTitle(input.collectionNumber)}`,
            ...(input.imageUrl ? { images: [input.imageUrl] } : {}),
          },
        },
        ...taxes,
      },
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: cents(shipping),
          tax_behavior: "exclusive",
          product_data: { name: `Shipping to ${zoneLabel === "Elsewhere" ? "the rest of the world" : zoneLabel}` },
        },
        ...taxes,
      },
    ],
    shipping_address_collection: { allowed_countries: zoneCountries(zone) },
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
