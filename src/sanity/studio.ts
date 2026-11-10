/**
 * Sanity Studio configuration.
 * Imported by the embedded Studio route at /studio-sanity.
 */
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { projectId, dataset, apiVersion } from "./env";

/** Types the site writes as private records (never publicly readable). */
const PRIVATE_TYPES = new Set(["contactSubmission", "newsletterSubscriber"]);

/**
 * The Studio's contents, as before. Contact submissions and newsletter
 * subscribers are private records (ids beginning "private."), so their
 * lists are made explicitly by type, read with the Studio's own login.
 */
const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items(
      S.documentTypeListItems().map((item) => {
        const type = String(item.getId() ?? "");
        if (!PRIVATE_TYPES.has(type)) return item;
        const title = item.getTitle() ?? type;
        return S.listItem()
          .id(type)
          .title(title)
          .schemaType(type)
          .child(S.documentList().title(title).schemaType(type).apiVersion(apiVersion).filter("_type == $type").params({ type }));
      }),
    );

export default defineConfig({
  name: "houseofsingh-studio",
  title: "House of Singh",
  projectId,
  dataset,
  basePath: "/studio-sanity",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
