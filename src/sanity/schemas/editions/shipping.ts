import { defineArrayMember, defineField, defineType } from "sanity";
import { ORIGINS, ZONES } from "./fields";

/**
 * The shipping table: for each origin (Canada, India) and zone (Canada,
 * United States, rest of the world), weight bands with a price in CAD,
 * filled by hand from Canada Post's standard prices (docs/editions-setup.md).
 * A piece's packed weight picks the first band it fits in.
 */
export const editionsShipping = defineType({
  name: "editionsShipping",
  title: "Editions: Shipping rates",
  type: "document",
  fields: [
    defineField({
      name: "routes",
      title: "Routes",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "route",
          fields: [
            defineField({ name: "origin", title: "From", type: "string", options: { list: ORIGINS }, validation: (r) => r.required() }),
            defineField({ name: "zone", title: "To", type: "string", options: { list: ZONES }, validation: (r) => r.required() }),
            defineField({
              name: "bands",
              title: "Weight bands",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "band",
                  fields: [
                    defineField({ name: "upToKg", title: "Up to (kg)", type: "number", validation: (r) => r.required().min(0.01) }),
                    defineField({ name: "price", title: "Price (CAD)", type: "number", validation: (r) => r.required().min(0) }),
                  ],
                  preview: { select: { kg: "upToKg", price: "price" }, prepare: ({ kg, price }) => ({ title: `Up to ${kg} kg`, subtitle: `CA$${price}` }) },
                }),
              ],
              validation: (r) => r.required().min(1),
            }),
          ],
          preview: {
            select: { origin: "origin", zone: "zone", bands: "bands" },
            prepare: ({ origin, zone, bands }) => ({ title: `${origin ?? "?"} to ${zone ?? "?"}`, subtitle: `${(bands ?? []).length} bands` }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Shipping rates" }) },
});
