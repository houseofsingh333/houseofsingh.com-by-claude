import type { GridPiece } from "@/components/editions/CollectionGrid";
import { available, editionSize } from "./state";
import { EDITIONS_DEFAULTS } from "./defaults";
import { collectionTitle, dayIn, monthIn, pad2 } from "./format";
import type { CollectionState, EditionsCollection, EditionsPiece } from "./types";

/** A piece as the Collection grid shows it. */
export function gridPiece(p: EditionsPiece, buyable = true): GridPiece {
  return {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    soldOut: available(p) === 0,
    hasSizes: Boolean(p.sizes?.length),
    categoryId: p.category?._id ?? null,
    descriptor: p.category?.descriptor || p.category?.singular || "",
    image: p.photographs?.[0] ?? null,
    buyable,
  };
}

/** The Collection's filters: its own list, else every category it holds, in order. */
export function gridFilters(c: EditionsCollection, pieces: EditionsPiece[]): { id: string; label: string }[] {
  const own = (c.filters ?? []).filter((f) => f.category).map((f) => ({ id: f.category!._id, label: f.label?.trim() || f.category!.plural }));
  if (own.length) return own;
  const seen = new Map<string, { id: string; label: string; order: number }>();
  for (const p of pieces) {
    if (p.category && !seen.has(p.category._id)) seen.set(p.category._id, { id: p.category._id, label: p.category.plural, order: p.category.order ?? 99 });
  }
  return [...seen.values()].sort((a, b) => a.order - b.order).map(({ id, label }) => ({ id, label }));
}

const SEASONS = ["spring", "summer", "autumn", "fall", "winter"];

/** "Winter 2027" → "winter"; "Vaisakhi 2027" → "Vaisakhi". */
export function seasonWord(season: string): string {
  const word = season.replace(/\s*\d{4}\s*$/, "").trim();
  return SEASONS.includes(word.toLowerCase()) ? word.toLowerCase() : word;
}

/** The line above the Collection's title, by state. */
export function stateLine(c: EditionsCollection, state: CollectionState, now: Date, until: string): string {
  if (state === "closed") return `Closed · ${monthIn(c.closes ?? now.toISOString())}`;
  if (state === "early") return `Early access · Opens to everyone ${until}`;
  if (state === "open") return c.closes ? `Open · Until ${dayIn(c.closes)}` : "Open";
  return `Releasing for ${seasonWord(c.season)} · ${dayIn(c.opens)}`;
}

/** "Collection 01 · Vaisakhi 2027". */
export const collectionLine = (c: Pick<EditionsCollection, "number" | "season">) => `${collectionTitle(c.number)} · ${c.season}`;

/** "No. 01 · Vaisakhi 2027", on a spine. */
export const spineLine = (c: Pick<EditionsCollection, "number" | "season">) => `No. ${pad2(c.number)} · ${c.season}`;

/** "Limited run of 40 · 27 available", "Edition of 25 · 18 available", "One of one". */
export function editionLine(p: EditionsPiece): string {
  const size = editionSize(p);
  const left = available(p);
  if (p.editionType === "one-of-one") return left > 0 ? "One of one" : "One of one · Sold";
  const kind = p.editionType === "numbered" ? `Edition of ${size}` : `Limited run of ${size}`;
  return left > 0 ? `${kind} · ${left} available` : `${kind} · Sold out`;
}

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** 2 → "Two Collections". */
export const collectionsInWords = (n: number) => `${WORDS[n] ?? n} ${n === 1 ? "Collection" : "Collections"}`;

/** Whether every piece of a Collection has been sold. */
export const allSold = (pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[]) => pieces.length > 0 && pieces.every((p) => available(p) === 0);

/**
 * The closed Collection's sentence, true to what happened: "every piece
 * found its home" only when every piece sold; otherwise the line for a
 * Collection that closed with pieces left.
 */
export function closedSentence(c: Pick<EditionsCollection, "number" | "closedLine" | "closedUnsoldLine">, pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[]): string {
  if (allSold(pieces)) return c.closedLine?.trim() || EDITIONS_DEFAULTS.soldOutLine;
  return c.closedUnsoldLine?.trim() || `${collectionTitle(c.number)} has closed.`;
}
