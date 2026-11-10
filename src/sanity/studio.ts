/**
 * Sanity Studio configuration.
 * Imported by the embedded Studio route at /studio-sanity.
 */
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { projectId, dataset, apiVersion } from "./env";
import { MarkMadeAction, MarkShippedAction } from "./actions/orderActions";

/** Single documents of the Shop: edited in place, never listed or duplicated. */
const EDITIONS_SINGLETONS = new Set(["editionsShipping", "editionsSettings"]);

/** Types the site writes as private records (never publicly readable). */
const PRIVATE_TYPES = new Set(["contactSubmission", "newsletterSubscriber"]);

/**
 * The Studio's contents: everything as before, then House of Singh
 * Editions in its own section (Collections, pieces, categories,
 * collaborators, shipping rates and Shop settings, and the private
 * records the site writes: orders, collectors, notify requests and
 * proposals).
 */
const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...S.documentTypeListItems()
        .filter((item) => !String(item.getId() ?? "").startsWith("editions") && !["signupPending", "emailQueued", "emailDay"].includes(String(item.getId())))
        // Contact submissions and newsletter subscribers are private
        // records (ids beginning "private."), so they are listed by type
        // with the Studio's own token, like the Shop's records below.
        .map((item) =>
          PRIVATE_TYPES.has(String(item.getId()))
            ? S.listItem()
                .id(String(item.getId()))
                .title(item.getTitle() ?? "")
                .schemaType(String(item.getId()))
                .child(
                  S.documentList()
                    .title(item.getTitle() ?? "")
                    .schemaType(String(item.getId()))
                    .apiVersion(apiVersion)
                    .filter("_type == $type")
                    .params({ type: String(item.getId()) }),
                )
            : item,
        ),
      S.divider(),
      S.listItem()
        .title("House of Singh Editions")
        .child(
          S.list()
            .title("House of Singh Editions")
            .items([
              S.documentTypeListItem("editionsCollection").title("Collections"),
              S.documentTypeListItem("editionsPiece").title("Pieces"),
              S.documentTypeListItem("editionsCategory").title("Categories"),
              S.documentTypeListItem("editionsCollaborator").title("Collaborators"),
              S.listItem().title("Shipping rates").child(S.document().schemaType("editionsShipping").documentId("editionsShipping")),
              S.listItem().title("Shop settings").child(S.document().schemaType("editionsSettings").documentId("editionsSettings")),
              S.divider(),
              S.listItem()
                .title("Orders")
                .child(
                  S.list()
                    .title("Orders")
                    .items(
                      [
                        ["To make", 'status == "paid" || !defined(status)'],
                        ["Being made", 'status == "made"'],
                        ["Shipped", 'status == "shipped"'],
                        ["Refunded", 'status == "refunded"'],
                        ["All orders", "true"],
                      ].map(([title, filter]) =>
                        S.listItem()
                          .title(title)
                          .child(
                            S.documentList()
                              .title(title)
                              .schemaType("editionsOrder")
                              .apiVersion(apiVersion)
                              .filter(`_type == "editionsOrder" && (${filter})`)
                              .defaultOrdering([{ field: "paidAt", direction: "desc" }]),
                          ),
                      ),
                    ),
                ),
              ...[
                ["editionsCollector", "Collectors"],
                ["editionsNotify", "Notify requests"],
                ["editionsProposal", "Collaboration proposals"],
                ["signupPending", "Sign ups waiting for Kit"],
                ["emailQueued", "Emails waiting to send"],
              ].map(([type, title]) =>
                S.listItem()
                  .title(title)
                  .child(S.documentList().title(title).schemaType(type).apiVersion(apiVersion).filter("_type == $type").params({ type })),
              ),
            ]),
        ),
    ]);

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
    actions: (prev, context) => (context.schemaType === "editionsOrder" ? [MarkMadeAction, MarkShippedAction] : prev),
  },
  schema: {
    types: schemaTypes,
    // Singletons are not offered as new documents.
    templates: (templates) => templates.filter(({ schemaType }) => !EDITIONS_SINGLETONS.has(schemaType)),
  },
});
