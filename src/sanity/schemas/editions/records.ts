import { defineField, defineType } from "sanity";

/*
 * Private records of House of Singh Editions. The site writes them with IDs
 * under the "private." path (lib/editions/records.ts): Sanity never serves
 * a document with a dot in its ID without a token, so although the dataset
 * is public, these are readable only in the Studio and by the server. They
 * are written by the site, not edited by hand, so every field is read only.
 */

const readOnly = { readOnly: true } as const;

export const editionsNotify = defineType({
  name: "editionsNotify",
  title: "Editions: Notify request",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "collection", title: "For", type: "string", description: "The Collection they asked to hear about." }),
    defineField({ name: "consent", title: "Consent", type: "boolean", description: "Agreed to hear about releases and early access." }),
    defineField({ name: "submittedAt", title: "Date", type: "datetime" }),
  ],
  preview: { select: { title: "email", subtitle: "collection" } },
});

export const editionsProposal = defineType({
  name: "editionsProposal",
  title: "Editions: Collaboration proposal",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "practice", title: "What they make", type: "string" }),
    defineField({ name: "link", title: "Link to their work", type: "string" }),
    defineField({ name: "idea", title: "Their idea", type: "text" }),
    defineField({ name: "submittedAt", title: "Date", type: "datetime" }),
  ],
  preview: { select: { title: "name", subtitle: "practice" } },
});

export const editionsOrder = defineType({
  name: "editionsOrder",
  title: "Editions: Order",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "sessionId", title: "Stripe Checkout Session", type: "string" }),
    defineField({ name: "paymentIntent", title: "Stripe payment", type: "string" }),
    defineField({ name: "testMode", title: "Test mode", type: "boolean" }),
    defineField({ name: "piece", title: "Piece", type: "reference", to: [{ type: "editionsPiece" }], weak: true }),
    defineField({ name: "pieceName", title: "Piece name", type: "string" }),
    defineField({ name: "size", title: "Size", type: "string" }),
    defineField({ name: "zone", title: "Shipping zone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "shippingAddress", title: "Shipping address", type: "text" }),
    defineField({ name: "subtotal", title: "Piece (CAD)", type: "number" }),
    defineField({ name: "shipping", title: "Shipping (CAD)", type: "number" }),
    defineField({ name: "tax", title: "Tax (CAD)", type: "number" }),
    defineField({ name: "total", title: "Total (CAD)", type: "number" }),
    defineField({ name: "collectorNumber", title: "Collector number", type: "number" }),
    defineField({ name: "editionNumber", title: "Edition number", type: "number", description: "Numbered editions: this piece's number in the edition." }),
    defineField({ name: "certificateCode", title: "Certificate code", type: "string" }),
    defineField({ name: "paidAt", title: "Paid", type: "datetime" }),
  ],
  orderings: [{ title: "Newest", name: "paid", by: [{ field: "paidAt", direction: "desc" }] }],
  preview: { select: { title: "pieceName", subtitle: "email", n: "collectorNumber" } },
});

export const editionsCollector = defineType({
  name: "editionsCollector",
  title: "Editions: Collector",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "number", title: "Collector number", type: "number", description: "Lifelong, assigned in order of first purchase." }),
    defineField({ name: "firstPurchase", title: "First purchase", type: "datetime" }),
  ],
  orderings: [{ title: "Number", name: "number", by: [{ field: "number", direction: "asc" }] }],
  preview: { select: { title: "email", n: "number" }, prepare: ({ title, n }) => ({ title, subtitle: `Collector No. ${n ?? "?"}` }) },
});
