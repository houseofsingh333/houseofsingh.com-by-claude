import type { CollectionState, EditionsCollection, EditionsPiece } from "./types";
import { clockIn } from "./format";

/** How many of a piece are left: by size when it has sizes, else quantity less sold. */
export function available(piece: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">): number {
  if (piece.sizes && piece.sizes.length > 0) {
    return piece.sizes.reduce((n, s) => n + Math.max(0, (s.stock ?? 0) - (s.sold ?? 0)), 0);
  }
  return Math.max(0, (piece.quantity ?? 0) - (piece.soldCount ?? 0));
}

/** How many of one size are left. */
export function sizeAvailable(piece: Pick<EditionsPiece, "sizes">, sizeKey: string): number {
  const s = piece.sizes?.find((x) => x._key === sizeKey);
  return s ? Math.max(0, (s.stock ?? 0) - (s.sold ?? 0)) : 0;
}

/** The edition's full size: the sizes' stock together, or the quantity. */
export function editionSize(piece: Pick<EditionsPiece, "quantity" | "sizes">): number {
  if (piece.sizes && piece.sizes.length > 0) return piece.sizes.reduce((n, s) => n + (s.stock ?? 0), 0);
  return piece.quantity ?? 0;
}

/**
 * A Collection's state, from its dates and stock (never set by hand):
 * - closed: past its closing date, or open with every piece sold;
 * - open: from "Opens to everyone";
 * - early: from "Early access opens", for a visitor holding the code
 *   (otherwise it still reads as sealed);
 * - sealed: before all of that.
 */
export function collectionState(
  collection: Pick<EditionsCollection, "opens" | "closes" | "earlyAccessOpens">,
  pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[],
  now: Date,
  hasEarlyAccess: boolean,
): CollectionState {
  const t = now.getTime();
  const opens = Date.parse(collection.opens);
  const closes = collection.closes ? Date.parse(collection.closes) : Infinity;
  const early = collection.earlyAccessOpens ? Date.parse(collection.earlyAccessOpens) : Infinity;
  const soldOut = pieces.length > 0 && pieces.every((p) => available(p) === 0);
  if (t >= closes) return "closed";
  if (t >= opens) return soldOut ? "closed" : "open";
  if (t >= early && hasEarlyAccess) return soldOut ? "closed" : "early";
  return "sealed";
}

/** Whether pieces can be bought in this state. */
export const canBuy = (state: CollectionState) => state === "open" || state === "early";

/** "9 pm in Toronto, 6:30 am in India": a release time for both places. */
export function releaseTimes(iso: string): string {
  return `${clockIn(iso, "America/Toronto")} in Toronto, ${clockIn(iso, "Asia/Kolkata")} in India`;
}

/** "in 23 hours", "in 3 days": how long until a moment, roughly. */
export function untilWords(iso: string, now: Date): string {
  const ms = Date.parse(iso) - now.getTime();
  if (ms <= 0) return "now";
  const hours = Math.round(ms / 3_600_000);
  if (hours < 1) return "within the hour";
  if (hours < 48) return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.round(hours / 24);
  return `in ${days} days`;
}
