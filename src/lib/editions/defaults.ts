/**
 * The approved wording of House of Singh Editions, from the canvas
 * ("Shop, the flow" and the tax and seller brief of 10 Nov). Shop settings
 * in Sanity can replace each piece; an empty field uses these.
 *
 * Plain module, no imports, so the Sanity schema can show them as hints.
 */
export const EDITIONS_DEFAULTS = {
  brand: "House of Singh Editions",
  seller: "House of Singh Studios Inc., operating House of Singh Editions",
  honestLine: "Made slowly, shipped in weeks. Shipping at cost.",
  taxLine: "Plus applicable tax for Canadian orders.",
  beforeYouBuyHeading: "What this is, and what it is not",
  beforeYouBuy: [
    "Not fast. Each piece is made and packed with care, in Canada or India. Expect weeks, not days.",
    "Not cheap. Everything is made in small numbers and priced for what it is.",
    "Never restocked. When a piece is gone, it is gone.",
    "Not always open. Collections are released twice a year; between them, the Shop rests.",
    "Made with others. Some pieces are made by hand, some with makers I trust, some with other artists. When a piece is a collaboration, both names stand on it.",
  ],
  returnsLine: "Unworn pieces may be returned within 14 days.",
  soldOutLine: "Every piece has found its home.",
  shippingLine: "Made and packed with care, shipped in 2 to 4 weeks, with tracking by email. Shipping at cost; import duties paid on arrival.",
  artistsHeading: "Make something with House of Singh",
  artistsInvitation:
    "Collections often include pieces made with other artists. If you work with your hands, a camera, cloth or metal, and something here speaks to you, propose an idea.",
  /** Above the footer on every Shop page, the address a link. */
  questionLine: "A question about a piece?",
  questionEmail: "editions@houseofsingh.com",
  /** Under the proposal form, after sending, and in the proposal email: only fitting proposals receive a reply. */
  proposalPromise: "Every proposal is read. If your idea fits a coming Collection, I will be in touch to talk it through.",
  artistsSteps: [
    { title: "Propose", text: "Your work and an idea, in a few lines." },
    { title: "A conversation", text: "If it fits a Collection, we talk and sketch together." },
    { title: "Made together", text: "Small numbers, both names, a fair shared return." },
    { title: "Released", text: "In the next Collection, with your own page." },
  ],
} as const;

/**
 * The terms of sale when Shop settings has none: seller, prices and tax,
 * shipping and duties, returns, contact. {gst} is the GST/HST number
 * (GST_NUMBER) and {returns} the returns line.
 */
export const DEFAULT_TERMS = [
  {
    title: "The seller",
    text: "Pieces are sold by House of Singh Studios Inc., operating House of Singh Editions, a company registered in Canada. GST/HST number: {gst}.",
  },
  {
    title: "Prices and tax",
    text: "Prices are in Canadian dollars and shown before tax. For orders shipped to an address in Canada, GST or HST is added at checkout at the rate of the province or territory you ship to. Orders shipped outside Canada carry no Canadian tax.",
  },
  {
    title: "Shipping and duties",
    text: "Pieces ship from Canada or India, made and packed with care, in 2 to 4 weeks, with tracking by email. Shipping is charged at what it costs and shown before you pay. Import duties and taxes in your country, where they apply, are paid on arrival.",
  },
  {
    title: "Returns",
    text: "{returns} Write to me before sending anything back, and I will tell you how.",
  },
  {
    title: "Contact",
    text: "A question about an order or a piece: write to editions@houseofsingh.com, with your order number if you have one.",
  },
] as const;
