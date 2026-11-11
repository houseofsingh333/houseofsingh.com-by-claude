import { cookies } from "next/headers";
import { sanityFetch } from "@/sanity/fetch";
import { ACCESS_COOKIE, hasAccess } from "./access";
import { editionsCollectionsQuery, editionsSettingsQuery, editionsShippingQuery } from "./queries";
import { collectionState, shopNow } from "./state";
import { EDITIONS_DEFAULTS } from "./defaults";
import type { CollectionState, EditionsCollection, EditionsPiece, EditionsSettings, ShippingRoute } from "./types";

export type CollectionWithPieces = EditionsCollection & { pieces: EditionsPiece[] };
export type CollectionView = CollectionWithPieces & { state: CollectionState; early: boolean };

/** The visitor's early access cookie (a code's fingerprint), if any. */
export async function accessCookie(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

/**
 * Every Collection with its state for this visitor, newest first. Content
 * is cached for a minute; the state is computed now, per request.
 */
export async function loadCollections(): Promise<CollectionView[]> {
  const [collections, cookie] = await Promise.all([
    sanityFetch<CollectionWithPieces[] | null>({ query: editionsCollectionsQuery, revalidate: 60 }),
    accessCookie(),
  ]);
  const now = shopNow();
  return (collections ?? []).map((c) => {
    const early = hasAccess(cookie, c.earlyAccessCodeHash);
    return { ...c, pieces: c.pieces ?? [], early, state: collectionState(c, c.pieces ?? [], now, early) };
  });
}

export async function loadSettings(): Promise<EditionsSettings> {
  return (await sanityFetch<EditionsSettings | null>({ query: editionsSettingsQuery, revalidate: 60 })) ?? {};
}

export async function loadShipping(): Promise<ShippingRoute[]> {
  return (await sanityFetch<ShippingRoute[] | null>({ query: editionsShippingQuery, revalidate: 60 })) ?? [];
}

/** Whether a time zone name is one this server knows (a mistyped city is left out, not shown wrong). */
function validZone(zone: string | null | undefined): boolean {
  if (!zone) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** Shop settings with the approved wording wherever a field is empty. */
export function withDefaults(s: EditionsSettings) {
  const notes = (s.beforeYouBuy ?? []).filter((n) => n?.title?.trim() && n?.text?.trim()).map(({ title, text }) => ({ title, text }));
  const questions = (s.questions ?? []).filter((q) => q?.question?.trim()).map(({ question, answer }) => ({ question, answer: answer?.trim() || "" }));
  const cities = (s.releaseCities ?? []).filter((c) => c?.label?.trim() && validZone(c.timeZone)).map(({ label, timeZone }) => ({ label, timeZone }));
  const words = (s.artistsWords ?? []).map((w) => w?.trim()).filter(Boolean) as string[];
  return {
    honestLine: s.honestLine?.trim() || EDITIONS_DEFAULTS.honestLine,
    beforeYouBuy: notes.length ? notes : EDITIONS_DEFAULTS.beforeYouBuy.map((n) => ({ ...n })),
    questions: questions.length ? questions : EDITIONS_DEFAULTS.questions.map((q) => ({ ...q })),
    releaseCities: cities.length ? cities : EDITIONS_DEFAULTS.releaseCities.map((c) => ({ ...c })),
    artistsWords: words.length ? words : [...EDITIONS_DEFAULTS.artistsWords],
    artistsTeaser: s.artistsTeaser?.trim() || EDITIONS_DEFAULTS.artistsTeaser,
    returnsLine: s.returnsLine?.trim() || EDITIONS_DEFAULTS.returnsLine,
    artistsHeading: s.artistsHeading?.trim() || EDITIONS_DEFAULTS.artistsHeading,
    artistsInvitation: s.artistsInvitation?.trim() || EDITIONS_DEFAULTS.artistsInvitation,
    artistsSteps: s.artistsSteps?.length ? s.artistsSteps.map(({ title, text }) => ({ title, text })) : [...EDITIONS_DEFAULTS.artistsSteps],
    proposalsFor: s.proposalsFor?.trim() || null,
    proposalDeadline: s.proposalDeadline || null,
    terms: s.terms?.length ? s.terms.map(({ title, text }) => ({ title, text })) : null,
  };
}
