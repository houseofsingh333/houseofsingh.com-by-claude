import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "string",
    }),
    defineField({
      name: "spotifyPlaylistUrl",
      title: "Spotify Playlist Embed URL",
      type: "url",
      description:
        "The embed URL for your Spotify playlist (e.g. https://open.spotify.com/embed/playlist/...)",
    }),

    /* ——— Global SEO defaults ——— */
    defineField({
      name: "defaultMetaDescription",
      title: "Default Meta Description",
      type: "text",
      rows: 3,
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
      description: "Used in structured data and Open Graph (e.g. House of Singh).",
    }),
    defineField({
      name: "founderName",
      title: "Founder Name",
      type: "string",
      description: "Used in Person/Organization structured data (e.g. Maninder Singh).",
    }),
    defineField({
      name: "sameAs",
      title: "Social Profiles",
      type: "array",
      of: [{ type: "url" }],
      description:
        "Full URLs to official social profiles (Instagram, etc.). Output as sameAs links in structured data.",
    }),
    defineField({
      name: "googleVerification",
      title: "Google Site Verification Code",
      type: "string",
      description:
        "The content value from Google Search Console's HTML-tag verification method.",
    }),
  ],
});
