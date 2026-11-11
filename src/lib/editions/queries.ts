import { _imageAsset } from "@/sanity/queries";

/** GROQ for House of Singh Editions (public content only; private records in records.ts). */

const _category = `{ _id, singular, plural, descriptor, order }`;

const _piece = `{
  _id, name, "slug": slug.current, order, "collectionId": collection._ref,
  "category": category->${_category},
  editionType, issueCertificate, quantity, price, sizes[]{ _key, label, stock, sold }, soldCount, holds[]{ _key, size, until },
  "photographs": photographs[]${_imageAsset},
  statement, story, maker, madeWith,
  "collaborators": (collaborators[]->{ _id, name, "slug": slug.current })[defined(slug) && defined(name)],
  details, sizeAndFit, care, packedWeight, shipsFrom,
  "journal": journalEntry->{ title, "slug": slug.current },
  isTestData
}`;

const _collection = `{
  _id, number, season, colour, intro, closedLine, closedUnsoldLine, essay,
  earlyAccessOpens, opens, closes, earlyAccessCodeHash, releaseLine,
  // The brackets matter: without them the filter and slice apply to each
  // entry rather than to the list, and every entry comes back null.
  "journal": (journalEntries[]->{ _id, title, "slug": slug.current, date, "image": coverImage${_imageAsset} })[defined(slug) && defined(title)][0...3],
  "filters": filters[]{ _key, label, "category": category->${_category} },
  isTestData
}`;

/** Every Collection, newest first, with its pieces (the Shop and the archive). */
export const editionsCollectionsQuery = `*[_type == "editionsCollection" && defined(number)] | order(number desc){
  ...${_collection},
  "pieces": *[_type == "editionsPiece" && collection._ref == ^._id] | order(order asc, name asc)${_piece}
}`;

/** One piece by its address, with its Collection and the Collection's pieces in order (for state, and the next piece). */
export const editionsPieceQuery = `*[_type == "editionsPiece" && slug.current == $slug][0]{
  ...${_piece},
  "collection": collection->{
    ...${_collection},
    "pieces": *[_type == "editionsPiece" && collection._ref == ^._id] | order(order asc, name asc){ _id, name, "slug": slug.current, quantity, soldCount, sizes[]{ _key, stock, sold }, "photo": photographs[0]${_imageAsset} }
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
