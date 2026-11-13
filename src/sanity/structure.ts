/**
 * The Studio's sidebar (approved 13 Nov), in five groups: Inbox, Website,
 * Shop, Settings and, folded at the bottom, System. Only where things are
 * found and what they are called in the Studio changed: no type, field or
 * document was renamed, moved or removed.
 *
 * Single pages (About, the Contact page, Site settings, Navigation,
 * Spotlight, Shop settings, Shipping rates, the Small supplier tracker)
 * open straight into their form, and are never offered as new or
 * duplicated (sanity/studio.ts). Each opens the very document the website
 * reads: the first published one of its type, as the site's own queries
 * ask for it (`*[_type == "aboutPage"][0]`).
 */
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { apiVersion } from "./env";
import SmallSupplierView from "./components/SmallSupplierView";
import ContentRules from "./components/ContentRules";
import { INBOX_TYPES, KIND_LABEL, KINDS } from "@/lib/inbox/kinds";
export { SINGLETON_TYPES, PLACED_TYPES } from "./structureMap";

/** The query the website uses for a single page: its first published document. */
const SITE_READS = `*[_type == $type && !(_id in path("drafts.**"))][0]._id`;

export const structure: StructureResolver = (S, context) => {
  const client = context.getClient({ apiVersion });

  /** A single page, opened straight into its form: the document the site reads. */
  const single = (type: string, title: string) =>
    S.listItem()
      .id(type)
      .title(title)
      .schemaType(type)
      .child(async () => {
        try {
          const id = (await client.fetch<string | null>(SITE_READS, { type })) ?? type;
          return S.document().schemaType(type).documentId(id).title(title);
        } catch {
          // Sanity out of reach for a moment: the plain list, never a new empty page.
          return S.documentTypeList(type).title(title);
        }
      });

  /** Every document of a type, by its Studio name. */
  const all = (type: string, title: string) => S.documentTypeListItem(type).title(title);

  /** A private record type (ids under "private."), listed with the Studio's own login. */
  const records = (type: string, title: string) =>
    S.listItem()
      .id(type)
      .title(title)
      .schemaType(type)
      .child(S.documentList().id(type).title(title).schemaType(type).apiVersion(apiVersion).filter("_type == $type").params({ type }));

  /** A folder of items. */
  const folder = (id: string, title: string, items: Parameters<ReturnType<StructureBuilder["list"]>["items"]>[0]) =>
    S.listItem().id(id).title(title).child(S.list().id(id).title(title).items(items));

  // ——— Inbox: every message sent through the site (contact, project interest, For artists) ———
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
  const inbox = folder("inbox", "Inbox", [
    messages("inbox-new", "New", "replied != true && archived != true"),
    messages("inbox-replied", "Replied and reviewed", "replied == true && archived != true"),
    messages("inbox-archived", "Archived", "archived == true"),
    S.divider(),
    ...KINDS.map((k) => messages(`inbox-${k}`, KIND_LABEL[k], `${kindIs} && archived != true`, { kind: k })),
    S.divider(),
    records("contactSubmission", "Contact messages"),
    records("projectInterest", "Project interest"),
    records("editionsProposal", "For artists proposals"),
  ]);

  // ——— Website: the pages, in the order of the menu ———
  const website = folder("website", "Website", [
    folder("home", "Home", [all("heroSlide", "Home slides"), single("spotlight", "Spotlight")]),
    single("aboutPage", "About"),
    all("project", "Projects"),
    all("journalEntry", "Journal"),
    single("contactPage", "Contact page"),
  ]);

  // ——— Shop: House of Singh Editions ———
  const orders = S.listItem()
    .id("orders")
    .title("Orders")
    .child(
      S.list()
        .id("orders")
        .title("Orders")
        .items(
          [
            ["orders-check-tax", "Check tax", "checkTax == true"],
            ["orders-to-make", "To make", 'status == "paid" || !defined(status)'],
            ["orders-being-made", "Being made", 'status == "made"'],
            ["orders-shipped", "Shipped", 'status == "shipped"'],
            ["orders-refunded", "Refunded", 'status == "refunded"'],
            ["orders-all", "All orders", "true"],
          ].map(([id, title, filter]) =>
            S.listItem()
              .id(id)
              .title(title)
              .child(
                S.documentList()
                  .id(id)
                  .title(title)
                  .schemaType("editionsOrder")
                  .apiVersion(apiVersion)
                  .filter(`_type == "editionsOrder" && (${filter})`)
                  .defaultOrdering([{ field: "paidAt", direction: "desc" }]),
              ),
          ),
        ),
    );
  const shop = folder("shop", "Shop", [
    all("editionsCollection", "Collection"),
    all("editionsPiece", "Pieces"),
    all("editionsCollaborator", "Collaborators"),
    orders,
    S.divider(),
    folder("shop-settings", "Shop settings", [
      single("editionsSettings", "Shop settings"),
      single("editionsShipping", "Shipping rates"),
      all("editionsCategory", "Categories"),
    ]),
    // Private (id "private."): the paid orders by calendar quarter, and the
    // other revenue Maninder adds (lib/editions/smallSupplier.ts).
    S.listItem()
      .id("small-supplier")
      .title("Small supplier tracker")
      .schemaType("editionsSmallSupplier")
      .child(
        S.document()
          .title("Small supplier tracker")
          .schemaType("editionsSmallSupplier")
          .documentId("private.editions-small-supplier")
          .views([S.view.component(SmallSupplierView).title("Quarters"), S.view.form().title("Other revenue")]),
      ),
  ]);

  // ——— Settings: what applies across the site ———
  const settings = folder("settings", "Settings", [
    single("siteSettings", "Site settings"),
    single("navigation", "Navigation"),
    // What the Studio checks before publishing, in plain English (sanity/guardrails.ts).
    S.listItem().id("content-rules").title("Content rules").child(S.component(ContentRules).id("content-rules-page").title("Content rules")),
    all("redirect", "Redirects"),
  ]);

  // ——— System: the records the site keeps by itself, rarely opened ———
  const system = folder("system", "System", [
    records("newsletterSubscriber", "Newsletter records"),
    records("emailQueued", "Emails waiting to send"),
    records("signupPending", "Sign ups waiting for Kit"),
    records("editionsCollector", "Collectors"),
    records("editionsNotify", "Notify me records"),
    S.divider(),
    // Every Navigation document, so none is out of reach (two exist; the site reads the first).
    all("navigation", "Every Navigation document"),
  ]);

  return S.list()
    .id("root")
    .title("House of Singh")
    .items([inbox, S.divider(), website, shop, settings, S.divider(), system]);
};
