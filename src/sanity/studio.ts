/**
 * Sanity Studio configuration.
 * Imported by the embedded Studio route at /studio-sanity.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { projectId, dataset } from "./env";

export default defineConfig({
  name: "houseofsingh-studio",
  title: "House of Singh",
  projectId,
  dataset,
  basePath: "/studio-sanity",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
