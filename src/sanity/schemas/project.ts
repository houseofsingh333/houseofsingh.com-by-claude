import { defineArrayMember, defineField, defineType } from "sanity";
import { captionField, imageAltFields } from "./imageFields";
import { PROJECT_CATEGORIES, SLUG_NOTE } from "./rules";
import { inGroups } from "./groups";

/** The project form's tabs; Story opens first. */
const PROJECT_TABS = {
  story: ["title", "slug", "category", "year", "role", "shortIntro", "excerpt", "story", "isUpcoming", "showInterestForm", "author", "publishedAt", "updatedAt"],
  photographs: ["coverImage", "thumbnail", "photographs", "plates", "contentSections"],
  homepage: ["featuredOnHomepage", "homepageOrder"],
  search: ["seo"],
} as const;

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "story", title: "Story", default: true },
    { name: "photographs", title: "Photographs" },
    { name: "homepage", title: "Homepage" },
    { name: "search", title: "Search" },
  ],
  fields: inGroups([
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
      description: SLUG_NOTE,
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: `Required. One or more of: ${PROJECT_CATEGORIES.join(", ")}, separated by commas (for example "Photography, Collaborations"). The Projects page filters by these.`,
      validation: (rule) =>
        rule.required().custom((value) => {
          const parts = String(value ?? "").split(",").map((c) => c.trim()).filter(Boolean);
          const unknown = parts.filter((c) => !(PROJECT_CATEGORIES as readonly string[]).includes(c));
          return unknown.length ? `Not a category: ${unknown.join(", ")}. Use ${PROJECT_CATEGORIES.join(", ")}.` : true;
        }),
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
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const doc = context.document as { coverImage?: { asset?: unknown }; photographs?: unknown[] } | undefined;
            if ((value as { asset?: unknown } | undefined)?.asset || doc?.coverImage?.asset || doc?.photographs?.length) return true;
            return "Add a thumbnail (or a cover, or Photographs): the Projects page and the homepage need a photograph.";
          })
          .warning(),
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
      validation: (rule) => rule.required().warning("The Projects page shows it beside the title; without it the space stays empty."),
      description: "Short summary shown in project grid cards.",
    }),
    defineField({
      name: "photographs",
      title: "Photographs",
      type: "array",
      description:
        "Drag to reorder. Layout is chosen automatically from each photograph's shape: a landscape stands alone across the page, two portraits or squares become a pair, three a row, and a single portrait between landscapes sits to one side with the next paragraph of the story beside it. Change the Layout only when you want to. The first photograph is the cover and hero when no cover is set; the first four take turns on the Projects page when no plate photographs are set.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            ...imageAltFields,
            captionField,
            defineField({
              name: "layout",
              title: "Layout",
              type: "string",
              initialValue: "auto",
              description: "Auto chooses from the photograph's shape.",
              options: {
                layout: "dropdown",
                list: [
                  { title: "Auto", value: "auto" },
                  { title: "Full width", value: "fullWidth" },
                  { title: "Full bleed", value: "fullBleed" },
                  { title: "Half", value: "half" },
                  { title: "Offset left", value: "offsetLeft" },
                  { title: "Offset right", value: "offsetRight" },
                  { title: "Start a new row", value: "newRow" },
                ],
              },
            }),
          ],
          preview: {
            select: { media: "asset", alt: "alt", caption: "caption", layout: "layout", w: "asset.metadata.dimensions.width", h: "asset.metadata.dimensions.height", file: "asset.originalFilename" },
            prepare({ media, alt, caption, layout, w, h, file }) {
              const shape = w && h ? (w / h > 1.05 ? "Landscape" : w / h < 0.95 ? "Portrait" : "Square") : "";
              const lay = !layout || layout === "auto" ? "Auto" : String(layout).replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
              return { media, title: file || alt || "Photograph", subtitle: [shape, lay, caption].filter(Boolean).join(", ") };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "story",
      title: "Story text",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      description:
        "The story, paragraph by paragraph. With Photographs set, the paragraphs are placed between the photographs automatically (one after every two groups, never two in a row). A heading stays with the paragraph after it.",
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
  ], PROJECT_TABS),
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});
