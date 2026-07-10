import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const offsetImage = defineType({
  name: "offsetImage",
  title: "Offset Image",
  type: "object",
  icon: () => "◧",
  description:
    "One image offset to the left or right, with optional short text alongside it.",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [...imageAltFields, captionField],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "side",
      title: "Image Side",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 4,
      description: "Optional short text shown beside the image.",
    }),
  ],
  preview: {
    select: { media: "image", side: "side" },
    prepare({ media, side }) {
      return {
        title: "Offset Image",
        subtitle: `Image ${side || "left"}`,
        media,
      };
    },
  },
});
