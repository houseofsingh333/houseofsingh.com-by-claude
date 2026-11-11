import { defineArrayMember, defineField, defineType } from "sanity";
import { EDITIONS_DEFAULTS } from "../../../lib/editions/defaults";

/**
 * Shop settings (one document): the honest notes, the questions, the
 * release cities, the returns line, the invitation for artists (with the
 * rolling words) and the terms of sale. Every field is optional;
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
      name: "fewLeft",
      title: "Few left, at or under",
      type: "number",
      group: "shop",
      description: "When a piece has this many or fewer left, its card and page say so (\"2 left\"). Empty: 3.",
      validation: (r) => r.min(1).max(20).integer(),
    }),
    defineField({
      name: "nextCollection",
      title: "The next Collection, by name",
      type: "string",
      group: "shop",
      description: "For a sold out piece: Notify me of this name, for example \"Collection 02\". Empty: the next Collection.",
      validation: (r) => r.max(40),
    }),
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
      description: "Five notes, each a short title and one line. When empty, the approved five are used (lib/editions/defaults.ts). Shipping, tax and duties are on each piece and in the terms of sale, not here.",
      of: [
        defineArrayMember({
          type: "object",
          name: "note",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required().max(30) }),
            defineField({ name: "text", title: "One line", type: "string", validation: (r) => r.required().max(80) }),
          ],
        }),
      ],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: "questions",
      title: "Questions",
      type: "array",
      group: "shop",
      description: "Good to know, folding questions. When empty, the approved questions are used. A question with no answer is shown marked on previews and left out on the live site.",
      of: [
        defineArrayMember({
          type: "object",
          name: "question",
          fields: [
            defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
    defineField({
      name: "releaseCities",
      title: "Release time, cities",
      type: "array",
      group: "shop",
      description: "The cities the release time is shown in, in order. Empty: Vancouver, Toronto, London, Amritsar, Melbourne.",
      of: [
        defineArrayMember({
          type: "object",
          name: "city",
          fields: [
            defineField({ name: "label", title: "City", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "timeZone",
              title: "Time zone",
              type: "string",
              description: "Its time zone name, for example America/Toronto, Europe/London, Asia/Kolkata (India), Australia/Melbourne.",
              validation: (r) => r.required().regex(/^[A-Za-z]+(\/[A-Za-z_+-]+)+$/, { name: "time zone" }),
            }),
          ],
          preview: { select: { title: "label", subtitle: "timeZone" } },
        }),
      ],
      validation: (r) => r.max(6),
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
      name: "artistsTeaser",
      title: "On the Shop page, beneath the heading",
      type: "text",
      rows: 2,
      group: "artists",
      description: `When empty: ${EDITIONS_DEFAULTS.artistsTeaser}`,
    }),
    defineField({
      name: "artistsWords",
      title: "House of Singh × …, the rolling words",
      type: "array",
      group: "artists",
      description: `In order; the last is held longest. When empty: ${EDITIONS_DEFAULTS.artistsWords.join(", ")}.`,
      of: [defineArrayMember({ type: "string", validation: (r) => r.max(20) })],
      validation: (r) => r.max(8),
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
