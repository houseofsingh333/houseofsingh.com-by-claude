import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { editionsPieceQuery, editionsShippingQuery } from "./queries";
import type { EditionsCollection, EditionsPiece, ShippingRoute } from "./types";

/**
 * Reads for the moment of buying: straight from Sanity's API, never a
 * cache, so stock and the Collection's state are as they are now.
 */
const freshClient = createClient({ projectId, dataset, apiVersion, useCdn: false });

export type FreshPiece = EditionsPiece & {
  collection: (EditionsCollection & { pieces: Pick<EditionsPiece, "quantity" | "soldCount" | "sizes">[] }) | null;
};

export async function freshPiece(slug: string): Promise<FreshPiece | null> {
  return freshClient.fetch<FreshPiece | null>(editionsPieceQuery, { slug }, { cache: "no-store" });
}

export async function freshShipping(): Promise<ShippingRoute[] | null> {
  return freshClient.fetch<ShippingRoute[] | null>(editionsShippingQuery, {}, { cache: "no-store" });
}
