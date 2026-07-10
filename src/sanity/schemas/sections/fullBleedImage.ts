import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const fullBleedImage = defineType({
  name: "fullBleedImage",
  title: "Full Bleed Image",
  type: "object",
  icon: () => "🌄",
  description:
    "One image that breaks edge to edge for a dramatic beat. Optional caption.",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [...imageAltFields, captionField],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { media: "image", alt: "image.alt" },
    prepare({ media, alt }) {
      return {
        title: alt || "Full Bleed Image",
        subtitle: "Edge-to-edge image",
        media,
      };
    },
  },
});
