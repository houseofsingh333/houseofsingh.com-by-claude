/**
 * Sanity Studio configuration.
 * Imported by the embedded Studio route at /studio-sanity.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { projectId, dataset } from "./env";
import { MarkMadeAction, MarkShippedAction } from "./actions/orderActions";
import { ArchiveAction, MarkRepliedAction } from "./actions/inboxActions";
import { INBOX_TYPES } from "@/lib/inbox/kinds";
import { SINGLETON_TYPES, structure } from "./structure";

/** Every message sent through a form: Mark replied (or reviewed) and Archive. */
const IN_INBOX = new Set<string>(INBOX_TYPES);

export default defineConfig({
  name: "houseofsingh-studio",
  title: "House of Singh",
  projectId,
  dataset,
  basePath: "/studio-sanity",
  plugins: [structureTool({ structure })],
  // The login is kept in the browser (not a cookie) so the order actions
  // can show the website who is asking (sanity/actions/orderActions.tsx).
  auth: { loginMethod: "token" },
  document: {
    actions: (prev, context) =>
      context.schemaType === "editionsOrder"
        ? [MarkMadeAction, MarkShippedAction]
        : // A message: Mark replied (or reviewed) and Archive, before the Studio's own (no Publish: they save at once).
          IN_INBOX.has(context.schemaType)
          ? [MarkRepliedAction, ArchiveAction, ...prev.filter((a) => a.action !== "publish" && a.action !== "unpublish" && a.action !== "duplicate")]
          : // A single page is never duplicated (sanity/structure.ts).
            SINGLETON_TYPES.has(context.schemaType)
            ? prev.filter((a) => a.action !== "duplicate")
            : prev,
  },
  schema: {
    types: schemaTypes,
    // Single pages are not offered as new documents.
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
});
