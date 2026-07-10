import { defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";

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
      fields: imageAltFields,
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Card image. Recommended: JPEG, min 1600px wide, 4:3 ratio.",
      fields: imageAltFields,
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
        // Nine designed layout blocks
        { type: "textSection" },
        { type: "fullWidthImage" },
        { type: "fullBleedImage" },
        { type: "imagePair" },
        { type: "imageRow3" },
        { type: "offsetImage" },
        { type: "textWithImage" },
        { type: "horizontalGallery" },
        { type: "pullQuote" },
        // Legacy blocks — kept so existing projects keep working
        { type: "imageSingle" },
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
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "Credited author for structured data.",
      initialValue: "Maninder Singh",
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      description: "When this project was first published. Used for SEO and structured data.",
    }),
    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
      description: "When this project was last meaningfully updated. Used for SEO and structured data.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});
