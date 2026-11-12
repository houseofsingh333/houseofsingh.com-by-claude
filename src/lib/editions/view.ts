import type { GridPiece } from "@/components/editions/CollectionGrid";
import { available, canBuy, editionSize } from "./state";
import { EDITIONS_DEFAULTS } from "./defaults";
import { collectionTitle, dayIn, monthIn, pad2 } from "./format";
import type { CollectionState, EditionsCollection, EditionsPiece } from "./types";

/**
 * How many are left when it is few (at or under the threshold), else null;
 * sold out is not "few", and a one of one never shows a count (it reads
 * "One of one" instead).
 */
export function fewLeft(p: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes"> & { editionType?: EditionsPiece["editionType"] }, threshold: number): number | null {
  if (p.editionType === "one-of-one") return null;
  const left = available(p);
  return left > 0 && left <= threshold ? left : null;
}

export type MadeBy = { partner: string | null; about: { href: string; first: string } | null };

/**
 * Who made a piece, for Made by: House of Singh × a collaborator (with
 * "About" and their first name, linking to their page), × a maker or
 * workshop without a page (Made with), or House of Singh alone.
 */
export function madeBy(p: Pick<EditionsPiece, "collaborators" | "madeWith">): MadeBy {
  const people = knownCollaborators(p.collaborators);
  if (people.length) {
    const names = people.map((c) => c.name);
    const partner = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
    return { partner, about: { href: `/editions/collaborators/${people[0].slug}`, first: people[0].name.split(/\s+/)[0] } };
  }
  const own = p.madeWith?.trim();
  return { partner: own || null, about: null };
}

/** "7 of 8 pieces": how many pieces of the Collection are still available. */
export function stillAvailable(pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[]): string {
  const left = pieces.filter((p) => available(p) > 0).length;
  return `${left} of ${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"}`;
}

/** A piece as the Collection grid shows it. */
export function gridPiece(p: EditionsPiece, buyable = true, threshold = 3): GridPiece {
  return {
    fewLeft: fewLeft(p, threshold),
    oneOfOne: p.editionType === "one-of-one",
    partner: madeBy(p).partner,
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

/**
 * The Collection's filters: its own list, else every category it holds, in
 * order; only categories with at least one piece in the Collection. The
 * grid shows no filters at all for a single category.
 */
export function gridFilters(c: EditionsCollection, pieces: EditionsPiece[]): { id: string; label: string }[] {
  const held = new Set(pieces.map((p) => p.category?._id).filter(Boolean));
  const own = (c.filters ?? []).filter((f) => f.category && held.has(f.category._id)).map((f) => ({ id: f.category!._id, label: f.label?.trim() || f.category!.plural }));
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
const allSold = (pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[]) => pieces.length > 0 && pieces.every((p) => available(p) === 0);

/**
 * The closed Collection's sentence, true to what happened: "every piece
 * found its home" only when every piece sold; otherwise the line for a
 * Collection that closed with pieces left.
 */
export function closedSentence(c: Pick<EditionsCollection, "number" | "closedLine" | "closedUnsoldLine">, pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[]): string {
  if (allSold(pieces)) return c.closedLine?.trim() || EDITIONS_DEFAULTS.soldOutLine;
  return c.closedUnsoldLine?.trim() || `${collectionTitle(c.number)} has closed.`;
}

type MakingEntry = NonNullable<EditionsCollection["journal"]>[number];

/**
 * In the making, made safe: only entries that resolved and have a title and
 * an address, at most three; a missing date or photograph is left out of
 * that entry rather than breaking the section. A reference to a deleted or
 * unpublished entry, or an incomplete one, is skipped.
 */
export function makingEntries(raw: unknown): MakingEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: MakingEntry[] = [];
  for (const e of raw) {
    if (!e || typeof e !== "object") continue;
    const { _id, title, slug, date, image } = e as Partial<MakingEntry>;
    if (typeof title !== "string" || !title.trim() || typeof slug !== "string" || !slug.trim()) continue;
    out.push({
      _id: typeof _id === "string" && _id ? _id : slug,
      title: title.trim(),
      slug,
      date: typeof date === "string" && date ? date : null,
      image: image && typeof image === "object" && typeof (image as { url?: unknown }).url === "string" ? image : null,
    });
    if (out.length === 3) break;
  }
  return out;
}

/** A piece's collaborators, made safe: only those that resolved with a name and an address. */
export function knownCollaborators<T extends { name?: string | null; slug?: string | null }>(raw: (T | null)[] | null | undefined): (T & { name: string; slug: string })[] {
  return (raw ?? []).filter((c): c is T & { name: string; slug: string } => Boolean(c && typeof c.name === "string" && c.name && typeof c.slug === "string" && c.slug));
}

/** Placeholder answers (a question still to be written) show on previews and locally, never on the live site. */
export const showPlaceholders = (env: Record<string, string | undefined> = process.env) => env.VERCEL_ENV !== "production";

/** The questions the page shows: answered ones, and placeholders only where they may show. */
export const visibleQuestions = <Q extends { answer: string }>(questions: Q[], placeholders: boolean) => questions.filter((q) => q.answer || placeholders);

/**
 * Which sections the Shop page shows, for the page and its menu alike, so
 * the menu never offers a section that is not there: the Collection while
 * it can be bought (not in anticipation), How the release works only while
 * sealed, Questions when any question shows; Before you buy and For
 * artists always.
 */
export function shopSections(input: { state: CollectionState | null; anticipation: boolean; questions: number }) {
  const { state, anticipation } = input;
  return {
    collection: Boolean(state && canBuy(state) && !anticipation),
    how: state === "sealed",
    beforeYouBuy: true,
    questions: input.questions > 0,
    forArtists: true,
  };
}
