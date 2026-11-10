import { defineField, defineType } from "sanity";
import { linkRule } from "./rules";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Navigation Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "An address on this site starting with / (for example /journal) or a full https:// address.",
              validation: (rule) => linkRule(rule.required()),
            }),
            defineField({
              name: "external",
              title: "Opens in new tab",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
            }),
          ],
        },
      ],
    }),
  ],
});
