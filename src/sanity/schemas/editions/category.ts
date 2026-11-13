import { defineField, defineType } from "sanity";
import { isTestData } from "./fields";

/** A kind of piece (prints, clothing, objects). A free list, in its own order. */
export const editionsCategory = defineType({
  name: "editionsCategory",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "singular", title: "Singular name", type: "string", description: "For example: Print.", validation: (r) => r.required().max(30) }),
    defineField({ name: "plural", title: "Plural name", type: "string", description: "For example: Prints. Used for the filters.", validation: (r) => r.required().max(30) }),
    defineField({
      name: "descriptor",
      title: "Caption descriptor",
      type: "string",
      description: "Beneath each piece's name in the Collection, for example: archival print.",
      validation: (r) => r.required().max(40),
    }),
    defineField({ name: "order", title: "Order", type: "number", description: "Lower first.", initialValue: 10 }),
    isTestData,
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "plural", subtitle: "descriptor" } },
});
