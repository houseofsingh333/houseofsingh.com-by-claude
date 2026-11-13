import { defineArrayMember, defineField, defineType } from "sanity";
import { ORIGINS, isTestData, requiredAlt } from "./fields";

export const EDITION_TYPES = [
  { title: "Numbered edition", value: "numbered" },
  { title: "Limited run", value: "limited" },
  { title: "One of one", value: "one-of-one" },
];

/**
 * A piece of a Collection. What is left is always computed: quantity less
 * the sold count (and, for clothing, each size's stock less its sold count).
 * The sold counts are kept up to date by the Stripe webhook and can be
 * adjusted by hand.
 */
export const editionsPiece = defineType({
  name: "editionsPiece",
  title: "Piece",
  type: "document",
  groups: [
    { name: "main", title: "Piece", default: true },
    { name: "words", title: "Words" },
    { name: "stock", title: "Price and stock" },
    { name: "shipping", title: "Shipping" },
  ],
  fields: [
    defineField({ name: "name", title: "Name", type: "string", group: "main", validation: (r) => r.required().max(60) }),
    defineField({
      name: "slug",
      title: "Address",
      type: "slug",
      group: "main",
      description: "The piece's address: houseofsingh.com/editions/[address].",
      options: { source: "name", maxLength: 60 },
      // These addresses are the Shop's own pages, so a piece cannot use them.
      validation: (r) =>
        r.required().custom((v: { current?: string } | undefined) =>
          v?.current && ["archive", "artists", "collaborators", "terms", "thank-you", "verify"].includes(v.current)
            ? "This address belongs to a Shop page. Choose another."
            : true,
        ),
    }),
    defineField({ name: "collection", title: "Collection", type: "reference", group: "main", to: [{ type: "editionsCollection" }], validation: (r) => r.required() }),
    defineField({ name: "category", title: "Category", type: "reference", group: "main", to: [{ type: "editionsCategory" }], validation: (r) => r.required() }),
    defineField({
      name: "order",
      title: "Order in the Collection",
      type: "number",
      group: "main",
      description: "Lower first.",
      initialValue: 10,
    }),
    defineField({
      name: "photographs",
      title: "Photographs",
      type: "array",
      group: "main",
      description: "The first is the photograph in the Collection; the others follow on the piece's page. Set each hotspot on the subject.",
      of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [requiredAlt] })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "statement",
      title: "Statement",
      type: "text",
      rows: 3,
      group: "words",
      description: "The piece in two calm sentences: what it is, and why it exists.",
      validation: (r) => r.required().max(320),
    }),
    defineField({
      name: "story",
      title: "Story",
      type: "array",
      group: "words",
      description: "Optional. The longer story of the piece.",
      of: [defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }], lists: [] })],
    }),
    defineField({
      name: "maker",
      title: "Maker line",
      type: "string",
      group: "words",
      description: "For the record (orders and the Studio). The piece page's Made by is built from the collaborators below, or else Made with.",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "madeWith",
      title: "Made with (a maker or workshop without a page)",
      type: "string",
      group: "words",
      description: "Shown as Made by: House of Singh × this name, for example \"a bindery in Toronto\". Leave empty when a collaborator below has a page (their name is used), or when House of Singh made it alone.",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "collaborators",
      title: "Collaborators",
      type: "array",
      group: "words",
      of: [defineArrayMember({ type: "reference", to: [{ type: "editionsCollaborator" }] })],
    }),
    defineField({ name: "details", title: "Details", type: "text", rows: 3, group: "words", description: "Materials, dimensions, how it is made." }),
    defineField({ name: "sizeAndFit", title: "Size and fit", type: "text", rows: 3, group: "words", description: "Clothing only." }),
    defineField({ name: "care", title: "Care", type: "text", rows: 2, group: "words" }),
    defineField({
      name: "journalEntry",
      title: "The making (Journal entry)",
      type: "reference",
      group: "words",
      to: [{ type: "journalEntry" }],
      description: "Optional. A Journal entry about how the piece was made.",
    }),
    defineField({
      name: "editionType",
      title: "Type",
      type: "string",
      group: "stock",
      options: { list: EDITION_TYPES, layout: "radio" },
      description: "Numbered editions and one of one pieces carry their number on each order.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "issueCertificate",
      title: "Issue a certificate",
      type: "boolean",
      group: "stock",
      initialValue: false,
      description: "Off by default. On: each buyer gets a certificate code, the certificate email and a certificate link on the thank you page. Off: no certificate at all.",
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      group: "stock",
      description: "How many exist. 1 for a one of one piece. For clothing, the sizes' stock is used instead.",
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: "price",
      title: "Price (CAD)",
      type: "number",
      group: "stock",
      description: "In Canadian dollars, before tax.",
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      group: "stock",
      description: "Clothing only. Each size with its own stock; the webhook counts what is sold in each.",
      of: [
        defineArrayMember({
          type: "object",
          name: "size",
          fields: [
            defineField({ name: "label", title: "Size", type: "string", validation: (r) => r.required().max(8) }),
            defineField({ name: "stock", title: "Stock", type: "number", validation: (r) => r.required().integer().min(0) }),
            defineField({ name: "sold", title: "Sold", type: "number", initialValue: 0, validation: (r) => r.integer().min(0) }),
          ],
          preview: { select: { title: "label", stock: "stock", sold: "sold" }, prepare: ({ title, stock, sold }) => ({ title, subtitle: `${sold ?? 0} of ${stock ?? 0} sold` }) },
        }),
      ],
    }),
    defineField({
      name: "soldCount",
      title: "Sold",
      type: "number",
      group: "stock",
      initialValue: 0,
      description: "Kept up to date by the checkout; adjust by hand only to correct it.",
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: "holds",
      title: "Held during checkout",
      type: "array",
      group: "stock",
      readOnly: true,
      description: "Units someone is paying for right now, each for about thirty minutes. Written by the checkout; they clear themselves.",
      of: [
        defineArrayMember({
          name: "hold",
          type: "object",
          fields: [
            defineField({ name: "size", title: "Size", type: "string" }),
            defineField({ name: "until", title: "Held until", type: "datetime" }),
          ],
          preview: { select: { size: "size", until: "until" }, prepare: ({ size, until }) => ({ title: size ? `Size ${size}` : "One unit", subtitle: until ? `Until ${new Date(until).toLocaleString("en-CA", { timeZone: "America/Toronto" })}` : "" }) },
        }),
      ],
    }),
    defineField({
      name: "packedWeight",
      title: "Packed weight (kg)",
      type: "number",
      group: "shipping",
      description: "The weight as shipped, packaging included. Chooses the shipping price.",
      validation: (r) => r.required().min(0.01),
    }),
    defineField({
      name: "shipsFrom",
      title: "Ships from",
      type: "string",
      group: "shipping",
      options: { list: ORIGINS, layout: "radio" },
      validation: (r) => r.required(),
    }),
    isTestData,
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", n: "collection.number", media: "photographs.0", test: "isTestData" },
    prepare: ({ title, n, media, test }) => ({
      title,
      subtitle: `Collection ${String(n ?? 0).padStart(2, "0")}${test ? " (test data)" : ""}`,
      media,
    }),
  },
});
