import { defineField, defineType } from "sanity";

export const projectCategory = defineType({
  name: "projectCategory",
  title: "Project Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      description:
        "Preview image shown in the homepage accordion. Recommended: landscape, at least 1200 × 800 px.",
      options: { hotspot: true },
    }),
    defineField({
      name: "previewGif",
      title: "Preview GIF",
      type: "file",
      description:
        "Animated GIF for the homepage category preview. If provided, takes priority over preview images. Keep under 2 MB for fast loading.",
      options: { accept: "image/gif" },
    }),
    defineField({
      name: "previewImages",
      title: "Preview Images",
      type: "array",
      description:
        "Images that crossfade in the homepage category preview. Used when no GIF is uploaded. Recommended: 2–4 images, landscape, at least 1200 × 800 px.",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
  preview: {
    select: { title: "title", media: "thumbnail" },
  },
});
