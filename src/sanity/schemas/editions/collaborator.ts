import { defineArrayMember, defineField, defineType } from "sanity";
import { isTestData, shopImage } from "./fields";

/** An artist or maker a piece was made with. Their page: /editions/collaborators/[address]. */
export const editionsCollaborator = defineType({
  name: "editionsCollaborator",
  title: "Editions: Collaborator",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required().max(60) }),
    defineField({ name: "slug", title: "Address", type: "slug", options: { source: "name", maxLength: 60 }, validation: (r) => r.required() }),
    defineField({ name: "discipline", title: "Discipline", type: "string", description: "For example: Silversmith.", validation: (r) => r.max(40) }),
    defineField({ name: "city", title: "City", type: "string", validation: (r) => r.max(40) }),
    shopImage("portrait", "Portrait"),
    defineField({ name: "text", title: "Short text", type: "text", rows: 4, description: "A few sentences about them and their work.", validation: (r) => r.max(600) }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "link",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", title: "Address", type: "url", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
          ],
        }),
      ],
    }),
    isTestData,
  ],
  preview: { select: { title: "name", subtitle: "discipline", media: "portrait" } },
});
