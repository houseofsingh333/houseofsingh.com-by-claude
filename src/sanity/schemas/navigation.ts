import { defineField, defineType } from "sanity";
import { captionField, imageAltFields } from "./imageFields";

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
              validation: (rule) => rule.required(),
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
            defineField({
              name: "image",
              title: "Menu photograph",
              type: "image",
              options: { hotspot: true },
              description:
                "Optional. Shown in the menu while this page is hovered or focused. When empty, a photograph from the page itself is used.",
              fields: [...imageAltFields, captionField],
            }),
          ],
        },
      ],
    }),
  ],
});
