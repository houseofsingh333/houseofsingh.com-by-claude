import { defineField, defineType } from "sanity";

export const stickyChapter = defineType({
  name: "stickyChapter",
  title: "Sticky Chapter",
  type: "object",
  icon: () => "📌",
  description:
    "Desktop: two-column layout where the left text sticks while right-side images scroll. Mobile: single column.",
  fields: [
    defineField({
      name: "stickyText",
      title: "Sticky Text",
      type: "array",
      of: [{ type: "block" }],
      description:
        "This text stays fixed on the left while images scroll on the right (desktop only).",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "images",
      title: "Chapter Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (rule) =>
                rule.required().warning("Alt text is recommended."),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(6)
          .error("Sticky chapter requires 1–6 images."),
    }),
    defineField({
      name: "layoutPreset",
      title: "Layout Preset",
      type: "string",
      options: {
        list: [
          {
            title: "Hero then Grid",
            value: "heroThenGrid",
          },
          {
            title: "Grid then Hero",
            value: "gridThenHero",
          },
          {
            title: "All Singles",
            value: "allSingles",
          },
        ],
        layout: "radio",
      },
      initialValue: "heroThenGrid",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { preset: "layoutPreset" },
    prepare({ preset }) {
      const labels: Record<string, string> = {
        heroThenGrid: "Hero → Grid",
        gridThenHero: "Grid → Hero",
        allSingles: "All Singles",
      };
      return {
        title: `Sticky Chapter — ${labels[preset] || preset}`,
        subtitle: "Sticky text + scrolling images",
      };
    },
  },
});
