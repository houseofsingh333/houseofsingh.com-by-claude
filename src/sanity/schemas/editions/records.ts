import { defineField, defineType } from "sanity";
import { inboxFields, inboxPreview } from "../inboxFields";

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
  title: "Notify request",
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
  title: "For artists proposal",
  type: "document",
  // In the Inbox: what they sent stays read only; the ticks and notes save as they are clicked.
  liveEdit: true,
  fields: [
    ...inboxFields("Reviewed"),
    defineField({ name: "name", title: "Name", type: "string", ...readOnly }),
    defineField({ name: "email", title: "Email", type: "string", ...readOnly }),
    defineField({ name: "practice", title: "What they make", type: "string", ...readOnly }),
    defineField({ name: "link", title: "Link to their work", type: "string", ...readOnly }),
    defineField({ name: "idea", title: "Their idea", type: "text", ...readOnly }),
    defineField({ name: "submittedAt", title: "Date", type: "datetime", ...readOnly }),
  ],
  preview: inboxPreview("artists"),
});

export const editionsOrder = defineType({
  name: "editionsOrder",
  title: "Order",
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
    defineField({ name: "checkTax", title: "Check tax", type: "boolean", description: "The province taxed (from the postal code before Buy) differs from the province of the shipping address. Check the GST or HST charged, and refund the difference or ask for it." }),
    defineField({ name: "taxProvince", title: "Taxed for", type: "string" }),
    defineField({ name: "shipProvince", title: "Ships to (province)", type: "string" }),
    defineField({ name: "sizeKey", title: "Size key", type: "string", hidden: true }),
  ],
  orderings: [{ title: "Newest", name: "paid", by: [{ field: "paidAt", direction: "desc" }] }],
  preview: {
    select: { title: "pieceName", email: "email", status: "status", test: "testMode", checkTax: "checkTax" },
    prepare: ({ title, email, status, test, checkTax }) => ({
      title: `${checkTax ? "Check tax: " : ""}${title ?? "Order"}${test ? " (test)" : ""}`,
      subtitle: `${{ paid: "Paid", made: "Being made", shipped: "Shipped", refunded: "Refunded" }[status as string] ?? "Paid"} · ${email ?? ""}`,
    }),
  },
});

export const editionsCollector = defineType({
  name: "editionsCollector",
  title: "Collector",
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
  title: "Sign up waiting for Kit",
  type: "document",
  ...readOnly,
  fields: [
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "action", title: "Action", type: "string", description: "subscribe (the default) or unsubscribe: someone who left while Kit could not be reached." }),
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
  title: "Email waiting to send",
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
        defineField({ name: "sender", title: "From", type: "string", description: "letters: Maninder; editions: the Shop." }),
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
  title: "Emails sent that day",
  type: "document",
  ...readOnly,
  fields: [defineField({ name: "day", title: "Day (UTC)", type: "string" }), defineField({ name: "count", title: "Sent", type: "number" })],
  preview: { select: { title: "day", n: "count" }, prepare: ({ title, n }) => ({ title, subtitle: `${n ?? 0} sent` }) },
});

/**
 * The small supplier tracker (lib/editions/smallSupplier.ts), one private
 * document: "private.editions-small-supplier". Maninder adds here any other
 * personal taxable revenue, by calendar quarter; the Shop's own orders are
 * counted from the orders themselves. Unlike the records above, this one
 * is edited by hand. The thresholds already emailed about are kept by the
 * daily job, read only.
 */
export const editionsSmallSupplier = defineType({
  name: "editionsSmallSupplier",
  title: "Small supplier tracker",
  type: "document",
  // Saved as typed, with no draft: the daily job reads what is there.
  liveEdit: true,
  fields: [
    defineField({
      name: "otherRevenue",
      title: "Other taxable revenue",
      description:
        "Any other personal taxable revenue, by calendar quarter (for example photography or design work invoiced in your own name), in Canadian dollars. The Shop's orders are counted automatically: do not add them here.",
      type: "array",
      of: [
        {
          type: "object",
          name: "quarterRevenue",
          fields: [
            defineField({
              name: "quarter",
              title: "Quarter",
              type: "string",
              description: "The calendar quarter, written as 2026-Q4 (Q1 January to March, Q2 April to June, Q3 July to September, Q4 October to December).",
              validation: (r) => r.required().regex(/^\d{4}-Q[1-4]$/, { name: "quarter", invert: false }).error("Write the quarter as 2026-Q4."),
            }),
            defineField({ name: "amount", title: "Amount (CAD)", type: "number", validation: (r) => r.required().min(0) }),
            defineField({ name: "note", title: "Note", type: "string", description: "What it was, for your records." }),
          ],
          preview: { select: { q: "quarter", a: "amount", n: "note" }, prepare: ({ q, a, n }) => ({ title: `${q ?? "Quarter?"}: CA$${(a ?? 0).toLocaleString("en-CA")}`, subtitle: n }) },
        },
      ],
    }),
    defineField({
      name: "alertsActive",
      title: "Thresholds already emailed",
      description: "Kept by the daily job, so each threshold is emailed once.",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
  ],
  preview: { prepare: () => ({ title: "Small supplier tracker" }) },
});
