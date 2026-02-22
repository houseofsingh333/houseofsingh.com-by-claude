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
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "object",
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "pa", title: "Punjabi (ਪੰਜਾਬੀ)", type: "string" }),
      ],
    }),
    defineField({
      name: "spotifyPlaylistUrl",
      title: "Spotify Playlist Embed URL",
      type: "url",
      description:
        'The embed URL for your Spotify playlist (e.g. https://open.spotify.com/embed/playlist/...)',
    }),
  ],
});
