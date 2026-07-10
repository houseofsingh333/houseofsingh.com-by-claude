import { defineField, defineType } from "sanity";
import { imageAltFields, captionField } from "../imageFields";

export const fullWidthImage = defineType({
  name: "fullWidthImage",
  title: "Full Width Image",
  type: "object",
  icon: () => "🖼",
  description: "One image spanning the content column, with an optional caption.",
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
    select: { media: "image", caption: "image.caption", alt: "image.alt" },
    prepare({ media, caption, alt }) {
      return {
        title: caption || alt || "Full Width Image",
        subtitle: "Full width image",
        media,
      };
    },
  },
});
