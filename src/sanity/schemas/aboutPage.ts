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
      type: "string",
      description:
        "Large opening quote displayed hero-style at the top of the page.",
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
      type: "array",
      of: [{ type: "string" }],
      description:
        'Displayed as stacked role titles (e.g. "Creative Director", "Photographer").',
    }),
    defineField({
      name: "founderBio",
      title: "Founder Bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Bio paragraphs beside the portrait.",
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
      type: "array",
      of: [{ type: "block" }],
      description: "Description of the House of Singh identity.",
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
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Description",
              type: "string",
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
            select: { title: "title", subtitle: "year" },
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
              type: "text",
              validation: (rule) => rule.required(),
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
