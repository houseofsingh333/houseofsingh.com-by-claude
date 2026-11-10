import { _imageAsset } from "@/sanity/queries";

/** GROQ for House of Singh Editions (public content only; private records in records.ts). */

const _category = `{ _id, singular, plural, descriptor, order }`;

const _piece = `{
  _id, name, "slug": slug.current, order, "collectionId": collection._ref,
  "category": category->${_category},
  editionType, quantity, price, sizes[]{ _key, label, stock, sold }, soldCount,
  "photographs": photographs[]${_imageAsset},
  statement, story, maker,
  "collaborators": collaborators[]->{ _id, name, "slug": slug.current },
  details, sizeAndFit, care, packedWeight, shipsFrom,
  "journal": journalEntry->{ title, "slug": slug.current },
  isTestData
}`;

const _collection = `{
  _id, number, season, colour, intro, closedLine, closedUnsoldLine, essay,
  earlyAccessOpens, opens, closes, earlyAccessCodeHash,
  "filters": filters[]{ _key, label, "category": category->${_category} },
  isTestData
}`;

/** Every Collection, newest first, with its pieces (the Shop and the archive). */
export const editionsCollectionsQuery = `*[_type == "editionsCollection" && defined(number)] | order(number desc){
  ...${_collection},
  "pieces": *[_type == "editionsPiece" && collection._ref == ^._id] | order(order asc, name asc)${_piece}
}`;

/** One piece by its address, with its Collection and the Collection's pieces (for state). */
export const editionsPieceQuery = `*[_type == "editionsPiece" && slug.current == $slug][0]{
  ...${_piece},
  "collection": collection->{
    ...${_collection},
    "pieces": *[_type == "editionsPiece" && collection._ref == ^._id]{ quantity, soldCount, sizes[]{ _key, stock, sold } }
  }
}`;

/** Every piece's address (static paths are not used: pages read live state). */
export const editionsCollaboratorQuery = `*[_type == "editionsCollaborator" && slug.current == $slug][0]{
  _id, name, "slug": slug.current, discipline, city, "portrait": portrait${_imageAsset}, text, links,
  "pieces": *[_type == "editionsPiece" && references(^._id)] | order(order asc){
    ...${_piece},
    "collection": collection->{ number, season, opens, closes, earlyAccessOpens }
  }
}`;

export const editionsSettingsQuery = `*[_type == "editionsSettings"][0]`;

export const editionsShippingQuery = `*[_type == "editionsShipping"][0].routes[]{ origin, zone, bands[]{ upToKg, price } }`;
