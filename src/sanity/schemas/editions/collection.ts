import { defineArrayMember, defineField, defineType } from "sanity";
import { SHOP_COLOUR_OPTIONS } from "../../../lib/editions/palette";
import { AccessCodeInput } from "../../components/AccessCodeInput";
import { isTestData } from "./fields";

/**
 * A Collection of House of Singh Editions: released once, twice a year.
 * Its state (Sealed, Early access, Open, Closed) is never set by hand: it
 * follows from the three dates and from what is left in stock
 * (lib/editions/state.ts).
 */
export const editionsCollection = defineType({
  name: "editionsCollection",
  title: "Editions: Collection",
  type: "document",
  groups: [
    { name: "main", title: "Collection", default: true },
    { name: "dates", title: "Dates and access" },
    { name: "filters", title: "Filters" },
  ],
  fields: [
    defineField({
      name: "number",
      title: "Number",
      type: "number",
      group: "main",
      description: "1 for Collection 01, 2 for Collection 02. Shown as 01, 02, with its Gurmukhi numeral (੧, ੨) on the square.",
      validation: (rule) => rule.required().integer().min(1).max(99),
    }),
    defineField({
      name: "season",
      title: "Season",
      type: "string",
      group: "main",
      description: "For example: Vaisakhi 2027. Shown large on the square.",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "colour",
      title: "Square colour",
      type: "string",
      group: "main",
      description: "From the Shop palette (BRAND_BOOK.md). The square, and the spine in the archive.",
      options: { list: SHOP_COLOUR_OPTIONS, layout: "radio" },
      initialValue: "saffron",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "One sentence",
      type: "text",
      rows: 3,
      group: "main",
      description: "Beside the square while the Collection is sealed, in early access and open. One or two calm sentences.",
      validation: (rule) => rule.required().max(260),
    }),
    defineField({
      name: "releaseLine",
      title: "Before the release, the line above the title",
      type: "string",
      group: "main",
      description: "While sealed, followed by how many days are left. For example: Released on the eve of Vaisakhi. Empty: Releasing for the season.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "journalEntries",
      title: "In the making: Journal entries",
      type: "array",
      group: "main",
      description: "Up to three Journal entries about this Collection, shown as In the making. Empty: the section is hidden.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "journalEntry" }] })],
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: "closedLine",
      title: "When closed, every piece sold",
      type: "text",
      rows: 2,
      group: "main",
      description: "Beside the square once every piece is sold. For example: Every piece has found its home. Collection 02 is being made, for winter.",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "closedUnsoldLine",
      title: "When closed, pieces left",
      type: "text",
      rows: 2,
      group: "main",
      description: "Beside the square when the closing date passes with pieces unsold. For example: Collection 01 has closed. Collection 02 is being made, for winter. Empty: \"Collection 01 has closed.\"",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "essay",
      title: "Essay",
      type: "array",
      group: "main",
      description: "Optional. A longer note about the Collection, after the pieces.",
      of: [defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }], lists: [] })],
    }),
    defineField({
      name: "earlyAccessOpens",
      title: "Early access opens",
      type: "datetime",
      group: "dates",
      description: "From this moment, visitors with the early access link can buy. Times are entered in Toronto time.",
    }),
    defineField({
      name: "opens",
      title: "Opens to everyone",
      type: "datetime",
      group: "dates",
      description: "Before this the Collection is sealed (or in early access). The release time is shown in Toronto and India time.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "closes",
      title: "Closes",
      type: "datetime",
      group: "dates",
      description: "Optional. The Collection also closes when every piece is sold.",
    }),
    defineField({
      name: "earlyAccessCodeHash",
      title: "Early access code",
      type: "string",
      group: "dates",
      description: "Generate a code for the early access link. The code is shown once; only its fingerprint is saved.",
      components: { input: AccessCodeInput },
    }),
    defineField({
      name: "filters",
      title: "Filter names and order",
      type: "array",
      group: "filters",
      description: "Optional. Rename or reorder this Collection's filters. When empty, its categories are used in their own order, with their plural names.",
      of: [
        defineArrayMember({
          type: "object",
          name: "filter",
          fields: [
            defineField({ name: "category", title: "Category", type: "reference", to: [{ type: "editionsCategory" }], validation: (r) => r.required() }),
            defineField({ name: "label", title: "Shown as", type: "string", description: "Optional. Otherwise the category's plural name." }),
          ],
          preview: { select: { title: "label", subtitle: "category.plural" } },
        }),
      ],
    }),
    isTestData,
  ],
  orderings: [{ title: "Number", name: "number", by: [{ field: "number", direction: "desc" }] }],
  preview: {
    select: { number: "number", season: "season", test: "isTestData" },
    prepare: ({ number, season, test }) => ({
      title: `Collection ${String(number ?? 0).padStart(2, "0")}`,
      subtitle: `${season ?? ""}${test ? " (test data)" : ""}`,
    }),
  },
});
