/**
 * Sanity Studio configuration.
 * Imported by the embedded Studio route at /studio-sanity.
 */
import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { projectId, dataset, apiVersion } from "./env";
import { MarkMadeAction, MarkShippedAction } from "./actions/orderActions";
import SmallSupplierView from "./components/SmallSupplierView";
import ContentRules from "./components/ContentRules";
import { ArchiveAction, MarkRepliedAction } from "./actions/inboxActions";
import { INBOX_TYPES, KIND_LABEL, KINDS } from "@/lib/inbox/kinds";

/** Single documents of the Shop: edited in place, never listed or duplicated. */
const EDITIONS_SINGLETONS = new Set(["editionsShipping", "editionsSettings", "editionsSmallSupplier"]);

/** Types the site writes as private records (never publicly readable). */
const PRIVATE_TYPES = new Set(["newsletterSubscriber"]);

/** Every message sent through a form lives in the Inbox, not in the lists below it. */
const IN_INBOX = new Set<string>(INBOX_TYPES);

/**
 * The Studio's contents: everything as before, then House of Singh
 * Editions in its own section (Collections, pieces, categories,
 * collaborators, shipping rates and Shop settings, and the private
 * records the site writes: orders, collectors, notify requests and
 * proposals), and the private small supplier tracker.
 */
const structure: StructureResolver = (S) => {
  /** A list of Inbox messages, newest first. */
  const messages = (id: string, title: string, filter: string, params: Record<string, unknown> = {}) =>
    S.listItem()
      .id(id)
      .title(title)
      .child(
        S.documentList()
          .id(id)
          .title(title)
          .apiVersion(apiVersion)
          .filter(`_type in $types && !(_id in path("drafts.**")) && (${filter})`)
          .params({ types: [...INBOX_TYPES], ...params })
          .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
      );
  // A message's type: older ones saved before types are read from what they are.
  const kindIs = `coalesce(kind, select(_type == "editionsProposal" => "artists", _type == "projectInterest" => "collaboration", "other")) == $kind`;
  const inbox = S.listItem()
    .id("inbox")
    .title("Inbox")
    .child(
      S.list()
        .id("inbox-list")
        .title("Inbox")
        .items([
          messages("inbox-new", "New", "replied != true && archived != true"),
          messages("inbox-replied", "Replied and reviewed", "replied == true && archived != true"),
          messages("inbox-archived", "Archived", "archived == true"),
          S.divider(),
          ...KINDS.map((k) => messages(`inbox-${k}`, KIND_LABEL[k], `${kindIs} && archived != true`, { kind: k })),
        ]),
    );
  return S.list()
    .title("Content")
    .items([
      // Every message sent through the site (approved 13 Nov): contact, project interest, For artists.
      inbox,
      S.divider(),
      // What the Studio checks before publishing, in plain English (sanity/guardrails.ts).
      S.listItem().id("content-rules").title("Content rules").child(S.component(ContentRules).id("content-rules-page").title("Content rules")),
      S.divider(),
      ...S.documentTypeListItems()
        .filter((item) => !String(item.getId() ?? "").startsWith("editions") && !IN_INBOX.has(String(item.getId())) && !["signupPending", "emailQueued", "emailDay"].includes(String(item.getId())))
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
                        ["Check tax", "checkTax == true"],
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
                ["signupPending", "Sign ups waiting for Kit"],
                ["emailQueued", "Emails waiting to send"],
              ].map(([type, title]) =>
                S.listItem()
                  .title(title)
                  .child(S.documentList().title(title).schemaType(type).apiVersion(apiVersion).filter("_type == $type").params({ type })),
              ),
              S.divider(),
              // Private (id "private."): the paid orders by calendar quarter,
              // and the other revenue Maninder adds (lib/editions/smallSupplier.ts).
              S.listItem()
                .title("Small supplier tracker")
                .child(
                  S.document()
                    .title("Small supplier tracker")
                    .schemaType("editionsSmallSupplier")
                    .documentId("private.editions-small-supplier")
                    .views([S.view.component(SmallSupplierView).title("Quarters"), S.view.form().title("Other revenue")]),
                ),
            ]),
        ),
    ]);
};

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
          : prev,
  },
  schema: {
    types: schemaTypes,
    // Singletons are not offered as new documents.
    templates: (templates) => templates.filter(({ schemaType }) => !EDITIONS_SINGLETONS.has(schemaType)),
  },
});
