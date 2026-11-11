import { randomBytes } from "node:crypto";
import type { EditionsHold, EditionsSize } from "./types";

/**
 * Holding stock during checkout, so the Shop never sells what it does not
 * have. When a Checkout Session is created, one unit (of the size, where
 * the piece has sizes) is held on the piece for as long as the session can
 * be paid, about thirty minutes. Paying turns the hold into a sale in one
 * transaction (orders.ts); an expired or failed session releases it; a
 * hold past its time no longer counts, whatever happens to the webhook.
 *
 * The holds live on the piece itself (a list of { key, size, until }), so
 * "is one left?" and "hold it" are one write, locked to the piece's
 * revision: two buyers at the same moment cannot both take the last one.
 * Written against a small store, so it is tested in memory.
 */

export const HOLD_MINUTES = 32;

type Stock = { quantity: number; soldCount?: number | null; sizes?: Pick<EditionsSize, "_key" | "stock" | "sold">[] | null; holds?: EditionsHold[] | null };

/** Holds still in force at a moment. */
export const activeHolds = (holds: EditionsHold[] | null | undefined, now = Date.now()) =>
  (holds ?? []).filter((h) => Date.parse(h.until) > now);

/** Units held now, for one size or (no size) for the piece. */
export function heldCount(holds: EditionsHold[] | null | undefined, sizeKey: string | null, now = Date.now()): number {
  return activeHolds(holds, now).filter((h) => (sizeKey ? h.size === sizeKey : true)).length;
}

/** Units free to buy: stock less sold less held. */
export function freeUnits(piece: Stock, sizeKey: string | null, now = Date.now()): number {
  if (piece.sizes && piece.sizes.length > 0) {
    if (sizeKey) {
      const s = piece.sizes.find((x) => x._key === sizeKey);
      return s ? Math.max(0, (s.stock ?? 0) - (s.sold ?? 0) - heldCount(piece.holds, sizeKey, now)) : 0;
    }
    return piece.sizes.reduce((n, s) => n + Math.max(0, (s.stock ?? 0) - (s.sold ?? 0) - heldCount(piece.holds, s._key, now)), 0);
  }
  return Math.max(0, (piece.quantity ?? 0) - (piece.soldCount ?? 0) - heldCount(piece.holds, null, now));
}

export interface HoldStore {
  /** The piece as it is now, with its revision. */
  read(pieceId: string): Promise<(Stock & { _rev: string }) | null>;
  /** Replaces the holds, only if the piece is still at this revision (else throws). */
  write(pieceId: string, rev: string, holds: EditionsHold[]): Promise<void>;
  /** Removes one hold, whatever the revision. */
  remove(pieceId: string, key: string): Promise<void>;
}

export type HoldResult = { ok: true; key: string; until: string } | { ok: false; reason: "sold-out" | "size-sold-out" | "held" | "busy" };

/**
 * Holds one unit for a checkout. Refuses when nothing is free: "held" when
 * the last ones are only held (they may come back), else sold out.
 */
export async function placeHold(store: HoldStore, pieceId: string, sizeKey: string | null, now = Date.now()): Promise<HoldResult> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const piece = await store.read(pieceId);
    if (!piece) return { ok: false, reason: "sold-out" };
    if (freeUnits(piece, sizeKey, now) < 1) {
      const withoutHolds = freeUnits({ ...piece, holds: [] }, sizeKey, now);
      return { ok: false, reason: withoutHolds > 0 ? "held" : sizeKey ? "size-sold-out" : "sold-out" };
    }
    const key = randomBytes(9).toString("hex");
    const until = new Date(now + HOLD_MINUTES * 60_000).toISOString();
    // Expired holds are dropped as the new one is written.
    const holds = [...activeHolds(piece.holds, now), { _key: key, _type: "hold" as const, size: sizeKey, until }];
    try {
      await store.write(pieceId, piece._rev, holds);
      return { ok: true, key, until };
    } catch {
      // Someone else changed the piece first: read it again.
    }
  }
  return { ok: false, reason: "busy" };
}

/** Lets a hold go (the checkout expired, failed, or could not be created). */
export async function releaseHold(store: HoldStore, pieceId: string, key: string): Promise<void> {
  if (!/^[a-f0-9]{18}$/.test(key)) return;
  await store.remove(pieceId, key);
}
