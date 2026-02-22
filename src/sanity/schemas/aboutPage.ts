import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    /* ——— 1 · Intro Quote ——— */
    defineField({
      name: "introQuote",
      title: "Intro Quote",
      type: "object",
      description: "Large opening quote displayed hero-style at the top of the page.",
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),

    /* ——— 2 · Founder Section ——— */
    defineField({
      name: "founderName",
      title: "Founder Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "founderRoles",
      title: "Founder Roles",
      type: "object",
      description: 'Displayed as stacked role titles (e.g. "Creative Director", "Photographer").',
      fields: [
        defineField({ name: "en", title: "English", type: "array", of: [{ type: "string" }] }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "array", of: [{ type: "string" }] }),
      ],
    }),
    defineField({
      name: "founderBio",
      title: "Founder Bio",
      type: "object",
      description: "Bio paragraphs beside the portrait.",
      fields: [
        defineField({ name: "en", title: "English", type: "array", of: [{ type: "block" }] }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "array", of: [{ type: "block" }] }),
      ],
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      description:
        "Founder portrait. Recommended: JPEG, minimum 2400 px long edge, portrait orientation (3:4).",
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

    /* ——— 3 · The Moniker ——— */
    defineField({
      name: "monikerLogo",
      title: "Moniker Logo",
      type: "image",
      description: "House of Singh logo shown in The Moniker section.",
    }),
    defineField({
      name: "monikerText",
      title: "Moniker Text",
      type: "object",
      description: "Description of the House of Singh identity.",
      fields: [
        defineField({ name: "en", title: "English", type: "array", of: [{ type: "block" }] }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "array", of: [{ type: "block" }] }),
      ],
    }),

    /* ——— 4 · Timeline ——— */
    defineField({
      name: "milestones",
      title: "Timeline Milestones",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "year",
              title: "Year",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "object",
              fields: [
                defineField({ name: "en", title: "English", type: "string", validation: (r) => r.required() }),
                defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
              ],
            }),
            defineField({
              name: "text",
              title: "Description",
              type: "object",
              fields: [
                defineField({ name: "en", title: "English", type: "string" }),
                defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
              ],
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              description: "JPEG preferred. Use PNG only if transparency is needed.",
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                  description: "Describe the image for screen readers.",
                  validation: (rule) =>
                    rule.required().warning("Alt text is recommended."),
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title.en", subtitle: "year" },
          },
        },
      ],
    }),

    /* ——— 5 · Testimonials ——— */
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Quote",
              type: "object",
              fields: [
                defineField({ name: "en", title: "English", type: "text", validation: (r) => r.required() }),
                defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "text" }),
              ],
            }),
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "role",
              title: "Role",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        },
      ],
    }),

    /* ——— SEO ——— */
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description: "Override the default page title for search engines.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "string",
      description: "Meta description for search engines.",
    }),
  ],
  preview: {
    select: { title: "founderName" },
  },
});
