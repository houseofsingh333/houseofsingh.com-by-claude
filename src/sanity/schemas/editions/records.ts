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
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Paid, then Made and Shipped (the actions at the foot of this order, each of which emails the buyer). Refunded when the payment is returned in full.",
      options: { list: [{ title: "Paid", value: "paid" }, { title: "Being made", value: "made" }, { title: "Shipped", value: "shipped" }, { title: "Refunded", value: "refunded" }] },
    }),
    defineField({ name: "madeAt", title: "Marked as being made", type: "datetime" }),
    defineField({ name: "shippedAt", title: "Shipped", type: "datetime" }),
    defineField({ name: "trackingNumber", title: "Tracking number", type: "string" }),
    defineField({ name: "trackingUrl", title: "Tracking address", type: "url" }),
    defineField({ name: "refundedAt", title: "Refunded", type: "datetime" }),
    defineField({ name: "sizeKey", title: "Size key", type: "string", hidden: true }),
  ],
  orderings: [{ title: "Newest", name: "paid", by: [{ field: "paidAt", direction: "desc" }] }],
  preview: {
    select: { title: "pieceName", email: "email", status: "status", test: "testMode" },
    prepare: ({ title, email, status, test }) => ({
      title: `${title ?? "Order"}${test ? " (test)" : ""}`,
      subtitle: `${{ paid: "Paid", made: "Being made", shipped: "Shipped", refunded: "Refunded" }[status as string] ?? "Paid"} · ${email ?? ""}`,
    }),
  },
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

/** A sign up kept while Kit could not be reached; deleted once Kit has it (lib/email/signups.ts). */
export const signupPending = defineType({
  name: "signupPending",
  title: "Email: Sign up waiting for Kit",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "tag", title: "Tag", type: "string" }),
    defineField({ name: "kind", title: "Kind", type: "string" }),
    defineField({ name: "consent", title: "Consent as given", type: "text" }),
    defineField({ name: "createdAt", title: "Signed up", type: "datetime" }),
    defineField({ name: "attempts", title: "Tries", type: "number" }),
    defineField({ name: "lastError", title: "Last error", type: "string" }),
  ],
  preview: { select: { title: "email", subtitle: "tag" } },
});

/** An email waiting for the next day's allowance (lib/email/outbox.ts). */
export const emailQueued = defineType({
  name: "emailQueued",
  title: "Email: Waiting to send",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "priority", title: "Priority", type: "number", description: "1: order and shipping; 2: sign ups and proposals." }),
    defineField({ name: "createdAt", title: "Queued", type: "datetime" }),
    defineField({
      name: "email",
      title: "Email",
      type: "object",
      fields: [
        defineField({ name: "to", title: "To", type: "string" }),
        defineField({ name: "subject", title: "Subject", type: "string" }),
        defineField({ name: "kind", title: "Kind", type: "string" }),
        defineField({ name: "priority", title: "Priority", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text" }),
        defineField({ name: "html", title: "HTML", type: "text", hidden: true }),
      ],
    }),
  ],
  orderings: [{ title: "Next to send", name: "next", by: [{ field: "priority", direction: "asc" }, { field: "createdAt", direction: "asc" }] }],
  preview: { select: { title: "email.subject", subtitle: "email.to" } },
});

/** The day's count of emails sent (lib/email/outbox.ts). */
export const emailDay = defineType({
  name: "emailDay",
  title: "Email: Sent that day",
  type: "document",
  ...readOnly,
  fields: [defineField({ name: "day", title: "Day (UTC)", type: "string" }), defineField({ name: "count", title: "Sent", type: "number" })],
  preview: { select: { title: "day", n: "count" }, prepare: ({ title, n }) => ({ title, subtitle: `${n ?? 0} sent` }) },
});
