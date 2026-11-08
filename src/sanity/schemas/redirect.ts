import { defineField, defineType } from "sanity";
import { linkRule } from "./rules";

/*
 * A redirect: an old address that should now lead somewhere else, for
 * example after a project's slug was changed. The site checks these
 * before it shows its "page not found".
 */
export const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  fields: [
    defineField({
      name: "from",
      title: "Old address",
      type: "string",
      description: "The address that no longer exists, starting with /, for example /projects/old-name.",
      validation: (rule) =>
        rule.required().custom((v) => (/^\/(?!\/)[^\s?#]*$/.test(String(v ?? "")) ? true : "Start with / and leave out the domain, for example /projects/old-name")),
    }),
    defineField({
      name: "to",
      title: "New address",
      type: "string",
      description: "Where it should lead: an address on this site starting with /, or a full https:// address.",
      validation: (rule) => linkRule(rule.required()),
    }),
    defineField({
      name: "permanent",
      title: "Permanent",
      type: "boolean",
      initialValue: true,
      description: "Leave on for a page that has moved for good (search engines then move it too).",
    }),
  ],
  preview: {
    select: { from: "from", to: "to" },
    prepare: ({ from, to }) => ({ title: from || "(old address)", subtitle: `leads to ${to || "(new address)"}` }),
  },
});
