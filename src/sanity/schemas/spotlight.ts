import { defineField, defineType } from "sanity";

export const spotlight = defineType({
  name: "spotlight",
  title: "Spotlight",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Show on Homepage",
      type: "boolean",
      description: "Controls whether the Spotlight section renders on the homepage.",
      initialValue: false,
    }),
    defineField({
      name: "spotlightImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Full-bleed background image. Recommended: JPEG, min 2400px wide.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { enabled?: boolean } | undefined;
          if (doc?.enabled && !value) {
            return "A background image is required when the spotlight is enabled.";
          }
          return true;
        }),
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) =>
            rule.required().warning("Alt text is strongly recommended."),
        }),
      ],
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "e.g. Upcoming, Featured, Now Showing",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teaser",
      title: "Teaser Text",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkText",
      title: "Link Text",
      type: "string",
      description: "e.g. View Project, Coming Soon, Learn More",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkUrl",
      title: "Link URL",
      type: "string",
      description: "Internal path like /projects/my-project or external URL",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category Tag",
      type: "string",
      description: "Shown as vertical text on the right side. Optional.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "label" },
  },
});
