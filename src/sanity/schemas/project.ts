import { defineArrayMember, defineField, defineType } from "sanity";
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
      name: "year",
      title: "Year",
      type: "number",
      description:
        "The year of the work, shown beside the category under the title. Optional.",
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Hero photograph at the top of the project page, shown about 16:9 on desktop and 4:5 on phone: set the hotspot on the subject. Without one the page uses the thumbnail. Recommended: JPEG, min 2400px wide.",
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
      name: "plates",
      title: "Plate photographs",
      type: "array",
      description:
        "Optional. Up to four photographs that take turns on the Projects page, in this order. When empty, the cover and the first images of the content sections are used.",
      validation: (rule) => rule.max(4),
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Describe the photograph for screen readers. Required.",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description:
        "Optional. Your role on the project, for example Photographer or Curator. Shown on the Projects page beside the category and year, only when filled.",
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
        "Build the project page by adding sections in order. Each section controls its own text and images. Reorder sections to change the narrative flow.",
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
        "The order of projects on the homepage, the Projects page and the Next project link at the end of each project. Lower number appears first; projects without a number come after, newest first.",
    }),
    defineField({
      name: "isUpcoming",
      title: "Upcoming Project",
      type: "boolean",
      description:
        "Mark this project as upcoming. It will display an 'Upcoming' label on the card and detail page.",
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
