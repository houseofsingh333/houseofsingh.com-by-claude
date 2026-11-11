import { defineArrayMember, defineField, defineType } from "sanity";
import { EDITIONS_DEFAULTS } from "../../../lib/editions/defaults";

/**
 * Shop settings (one document): the honest notes, the returns line, the
 * invitation for artists and the terms of sale. Every field is optional;
 * an empty one uses the approved wording in lib/editions/defaults.ts.
 */
export const editionsSettings = defineType({
  name: "editionsSettings",
  title: "Editions: Shop settings",
  type: "document",
  groups: [
    { name: "shop", title: "The Shop", default: true },
    { name: "artists", title: "For artists" },
    { name: "terms", title: "Terms of sale" },
  ],
  fields: [
    defineField({
      name: "honestLine",
      title: "The honest line",
      type: "string",
      group: "shop",
      description: `At the bottom of the opening view. When empty: ${EDITIONS_DEFAULTS.honestLine}`,
    }),
    defineField({
      name: "beforeYouBuy",
      title: "Before you buy",
      type: "array",
      group: "shop",
      description: "The five notes, in order. When empty, the approved five are used (lib/editions/defaults.ts). Shipping, tax and duties are on each piece and in the terms of sale, not here.",
      of: [defineArrayMember({ type: "text", rows: 2 })],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: "returnsLine",
      title: "Returns",
      type: "text",
      rows: 2,
      group: "shop",
      description: `In every piece's Shipping and returns, and the terms of sale. When empty: ${EDITIONS_DEFAULTS.returnsLine}`,
    }),
    defineField({
      name: "artistsHeading",
      title: "Heading",
      type: "string",
      group: "artists",
      description: `When empty: ${EDITIONS_DEFAULTS.artistsHeading}`,
    }),
    defineField({
      name: "artistsInvitation",
      title: "Invitation",
      type: "text",
      rows: 4,
      group: "artists",
      description: `On the Shop page and on For artists. When empty: ${EDITIONS_DEFAULTS.artistsInvitation}`,
    }),
    defineField({
      name: "artistsSteps",
      title: "The four steps",
      type: "array",
      group: "artists",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Text", type: "string", validation: (r) => r.required() }),
          ],
        }),
      ],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "proposalsFor",
      title: "Proposals are open for",
      type: "string",
      group: "artists",
      description: "For example: Collection 02.",
    }),
    defineField({
      name: "proposalDeadline",
      title: "Proposal deadline",
      type: "date",
      group: "artists",
    }),
    defineField({
      name: "terms",
      title: "Terms of sale",
      type: "array",
      group: "terms",
      description: "Optional. When empty, the terms in lib/editions/defaults.ts are shown (seller, prices and tax, shipping and duties, returns, contact).",
      of: [
        defineArrayMember({
          type: "object",
          name: "termsSection",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Text", type: "text", rows: 4, validation: (r) => r.required() }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Shop settings" }) },
});
