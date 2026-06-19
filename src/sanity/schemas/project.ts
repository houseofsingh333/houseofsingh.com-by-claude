import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
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
      name: "category",
      title: "Category",
      type: "string",
      description: "e.g. Photography, Design, Collaborations",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Hero image shown at the top of the project page. Recommended: JPEG, min 1920px wide.",
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
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Card image. Recommended: JPEG, min 1600px wide, 4:3 ratio.",
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
      name: "shortIntro",
      title: "Short Intro",
      type: "text",
      rows: 3,
      description: "Brief introduction shown below the title.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown in project grid cards.",
    }),
    defineField({
      name: "contentSections",
      title: "Content Sections",
      type: "array",
      description:
        "Build the project page by adding sections in order. Each section controls its own text and images — reorder to change the narrative flow.",
      of: [
        { type: "textSection" },
        { type: "imageSingle" },
        { type: "imagePair" },
        { type: "imageGrid" },
        { type: "stickyChapter" },
      ],
    }),
    defineField({
      name: "featuredOnHomepage",
      title: "Show on Homepage",
      type: "boolean",
      description:
        "If enabled, this project appears in the homepage Projects section.",
      initialValue: false,
    }),
    defineField({
      name: "homepageOrder",
      title: "Homepage Order",
      type: "number",
      description:
        "Controls manual order of projects in the homepage section. Lower number appears first.",
    }),
    defineField({
      name: "isUpcoming",
      title: "Upcoming Project",
      type: "boolean",
      description:
        "Mark this project as upcoming — it will display an 'Upcoming' label on the card and detail page.",
      initialValue: false,
    }),
    defineField({
      name: "showInterestForm",
      title: "Show Interest Form",
      type: "boolean",
      description:
        "If enabled, an interest/nomination form appears at the bottom of the project detail page.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});
