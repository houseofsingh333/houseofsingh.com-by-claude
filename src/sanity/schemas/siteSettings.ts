import { defineField, defineType } from "sanity";
import { imageAltFields } from "./imageFields";
import { SITE_COPY_FIELDS } from "../../lib/siteCopy";

/*
 * Site Settings, in tabs: General (title, SEO, social), Homepage chapters
 * (one section per chapter, I to VII, and the Coda), Menu, 404 page,
 * Newsletter card, and Privacy and Terms. Every text field on the chapter
 * tabs is optional: when empty, the text shown in its description is used
 * (lib/siteCopy.ts holds that text, and these fields are made from it).
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
      name: "practiceCaseStudies",
      title: "Recent studio work: hand picked case studies",
      type: "array",
      group: "homepage",
      fieldset: "chapter7",
      of: [{ type: "string" }],
      description:
        "Optional. Up to three case study slugs from the House of Singh Studios site (the last part of each case study's address), in the order to show them. When empty, the three most recent case studies are shown.",
      validation: (rule) => rule.max(3),
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

    /* ——— Global SEO defaults ——— */
    defineField({
      name: "defaultMetaDescription",
      title: "Default Meta Description",
      type: "text",
      rows: 3,
      group: "general",
      description:
        "Site-wide fallback description for pages that don't set their own. Aim for ~160 characters.",
      validation: (rule) =>
        rule
          .max(180)
          .warning("Descriptions longer than ~160 characters are often truncated."),
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
