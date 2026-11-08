import { defineArrayMember, defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";
import { SITE_COPY_FIELDS } from "../../lib/siteCopy";

/*
 * Site Settings, in tabs: General (title, SEO, social), Homepage chapters
 * (one section per chapter, I to VII, and the Coda), Menu, 404 page,
 * Newsletter card, Privacy and Terms, Projects page and Journal page. Every
 * text field on the chapter tabs is optional: when empty, the text shown in
 * its description is used (lib/siteCopy.ts holds that text, and these fields
 * are made from it). The Journal page's line is the exception: empty hides it.
 */

const textFields = SITE_COPY_FIELDS.map((f) =>
  defineField({
    name: f.name,
    title: f.title,
    type: "multiline" in f && f.multiline ? "text" : "string",
    ...("multiline" in f && f.multiline ? { rows: 2 } : {}),
    group: f.group,
    ...("fieldset" in f ? { fieldset: f.fieldset } : {}),
    description: `Optional. When empty: ${f.text}`,
  }),
);

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "homepage", title: "Homepage chapters" },
    { name: "menu", title: "Menu" },
    { name: "notFound", title: "404 page" },
    { name: "newsletter", title: "Newsletter card" },
    { name: "legal", title: "Privacy and Terms" },
    { name: "projects", title: "Projects page" },
    { name: "journal", title: "Journal page" },
  ],
  fieldsets: [
    { name: "chapter1", title: "Chapter I, the hero", options: { collapsible: true, collapsed: true } },
    { name: "chapter2", title: "Chapter II, the artist", options: { collapsible: true, collapsed: true } },
    { name: "chapter3", title: "Chapter III, the work", options: { collapsible: true, collapsed: true } },
    { name: "chapter4", title: "Chapter IV, in the studio now", options: { collapsible: true, collapsed: true } },
    { name: "chapter5", title: "Chapter V, the notebook", options: { collapsible: true, collapsed: true } },
    { name: "chapter6", title: "Chapter VI, the record", options: { collapsible: true, collapsed: true } },
    { name: "chapter7", title: "Chapter VII, the practice", options: { collapsible: true, collapsed: true } },
    { name: "coda", title: "Coda, the footer", options: { collapsible: true, collapsed: true } },
    { name: "privacy", title: "Privacy: In short lines", options: { collapsible: true, collapsed: true } },
    { name: "terms", title: "Terms: In short lines", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "string",
      group: "general",
    }),

    /* ——— Homepage chapters: the pieces that are not plain text ——— */
    defineField({
      name: "spotifyPlaylistUrl",
      title: "Spotify Playlist Embed URL",
      type: "url",
      group: "homepage",
      fieldset: "chapter6",
      description:
        "The embed URL for your Spotify playlist (e.g. https://open.spotify.com/embed/playlist/...)",
    }),
    defineField({
      name: "listeningSleeve",
      title: "Record sleeve",
      type: "image",
      group: "homepage",
      fieldset: "chapter6",
      options: { hotspot: true },
      description:
        "Optional. A square image for the record sleeve. When empty, a plain sleeve with the crest is shown.",
      fields: imageAltFields,
    }),
    defineField({
      name: "studioWorkCards",
      title: "Studio work cards",
      type: "array",
      group: "homepage",
      fieldset: "chapter7",
      description:
        "Optional. Up to three cards shown under Recent studio work, in this order. With none, the row and its label are hidden.",
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "studioWorkCard",
          title: "Studio work card",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                  description: "Describe the image for screen readers. Required.",
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
            defineField({
              name: "clientName",
              title: "Client name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "link",
              title: "Link",
              type: "url",
              description: "The full address of the case study, for example https://studios.houseofsingh.com/... It opens in a new tab.",
              validation: (rule) => rule.required().uri({ scheme: ["https", "http"] }),
            }),
          ],
          preview: { select: { title: "clientName", subtitle: "link", media: "image" } },
        }),
      ],
    }),

    /* ——— 404 page ——— */
    defineField({
      name: "notFoundImage",
      title: "Photograph",
      type: "image",
      group: "notFound",
      options: { hotspot: true },
      description:
        "Optional. The photograph on the page not found (404) page. When empty, the cover of the Range day journal entry is used.",
      fields: imageAltFields,
    }),

    /* ——— Every text: generated from lib/siteCopy.ts ——— */
    ...textFields,
    defineField({
      name: "journalTagline",
      title: "Line under Journal",
      type: "string",
      group: "journal",
      description:
        "Optional. The short line under the Journal heading, for example: A diary in photographs. Leave empty to hide it.",
    }),

    /* ——— Global SEO defaults ——— */
    defineField({
      name: "defaultMetaDescription",
      title: "Default Meta Description",
      type: "text",
      rows: 3,
      group: "general",
      description:
        "Site-wide fallback description for pages that don't set their own. Aim for 120 to 155 characters.",
      validation: (rule) =>
        rule
          .max(155)
          .warning("Descriptions longer than 155 characters are often cut off in search results."),
    }),
    defineField({
      name: "organizationName",
      title: "Organization / Brand Name",
      type: "string",
      group: "general",
      description: "Used in structured data and Open Graph (e.g. House of Singh).",
    }),
    defineField({
      name: "founderName",
      title: "Founder Name",
      type: "string",
      group: "general",
      description: "Used in Person/Organization structured data (e.g. Maninder Singh).",
    }),
    defineField({
      name: "sameAs",
      title: "Social Profiles",
      type: "array",
      group: "general",
      of: [{ type: "url" }],
      description:
        "Full URLs to official social profiles (Instagram, etc.). Output as sameAs links in structured data.",
    }),
    defineField({
      name: "googleVerification",
      title: "Google Site Verification Code",
      type: "string",
      group: "general",
      description:
        "The content value from Google Search Console's HTML-tag verification method.",
    }),
  ],
});
