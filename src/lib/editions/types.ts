import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageAsset } from "@/lib/sanityImage";

export type ShopImage = SanityImageAsset;

export type EditionsCategory = {
  _id: string;
  singular: string;
  plural: string;
  descriptor: string;
  order?: number | null;
};

export type EditionsSize = { _key: string; label: string; stock: number; sold?: number | null };

export type EditionsCollaborator = {
  _id: string;
  name: string;
  slug: string;
  discipline?: string | null;
  city?: string | null;
  portrait?: ShopImage | null;
  text?: string | null;
  links?: { _key: string; label: string; url: string }[] | null;
};

export type EditionsPiece = {
  _id: string;
  name: string;
  slug: string;
  order?: number | null;
  collectionId: string;
  category: EditionsCategory | null;
  editionType: "numbered" | "limited" | "one-of-one";
  quantity: number;
  price: number;
  sizes?: EditionsSize[] | null;
  soldCount?: number | null;
  photographs: ShopImage[];
  statement: string;
  story?: PortableTextBlock[] | null;
  maker: string;
  collaborators?: Pick<EditionsCollaborator, "_id" | "name" | "slug">[] | null;
  details?: string | null;
  sizeAndFit?: string | null;
  care?: string | null;
  packedWeight: number;
  shipsFrom: "canada" | "india";
  journal?: { title: string; slug: string } | null;
  isTestData?: boolean | null;
};

export type EditionsCollection = {
  _id: string;
  number: number;
  season: string;
  colour: string;
  intro: string;
  closedLine?: string | null;
  closedUnsoldLine?: string | null;
  essay?: PortableTextBlock[] | null;
  earlyAccessOpens?: string | null;
  opens: string;
  closes?: string | null;
  earlyAccessCodeHash?: string | null;
  filters?: { _key: string; label?: string | null; category: EditionsCategory | null }[] | null;
  isTestData?: boolean | null;
};

export type ShippingBand = { upToKg: number; price: number };
export type ShippingRoute = { origin: "canada" | "india"; zone: Zone; bands: ShippingBand[] };
export type Zone = "canada" | "united-states" | "world";

export type EditionsSettings = {
  honestLine?: string | null;
  beforeYouBuy?: string[] | null;
  returnsLine?: string | null;
  artistsHeading?: string | null;
  artistsInvitation?: string | null;
  artistsSteps?: { _key: string; title: string; text: string }[] | null;
  proposalsFor?: string | null;
  proposalDeadline?: string | null;
  terms?: { _key: string; title: string; text: string }[] | null;
};

/** The state of a Collection, computed (lib/editions/state.ts), never stored. */
export type CollectionState = "sealed" | "early" | "open" | "closed";
