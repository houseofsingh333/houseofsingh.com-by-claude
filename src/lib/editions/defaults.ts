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
  /** Before you buy (Shop design round 2): five short titles, one line each. */
  beforeYouBuy: [
    { title: "Not fast", text: "Made and packed with care. Weeks, not days." },
    { title: "Not cheap", text: "Small numbers, honestly priced." },
    { title: "Never restocked", text: "When a piece is gone, it is gone." },
    { title: "Not always open", text: "Twice a year. Between, the Shop rests." },
    { title: "Made with others", text: "By hand, with makers I trust, with artists." },
  ],
  /** How the release works: three steps. */
  howItWorks: [
    { title: "Join the list", text: "Leave your email above. One note when the Collection is ready, nothing more." },
    { title: "Early access", text: "The list gets in 24 hours before everyone, with a private link." },
    { title: "Opens to everyone", text: "At the times above. When a piece is gone, it is gone." },
  ],
  /**
   * Questions, folding. An empty answer is a placeholder: shown marked on
   * previews, left out on the live site until it is written.
   */
  questions: [
    { question: "Where do you ship?", answer: "Canada, the United States, India and most of the world. Shipping is charged at cost and shown before you buy." },
    { question: "How long will my piece take?", answer: "Two to four weeks. You will have an email when it is being made, and another with tracking when it ships." },
    { question: "Will I pay import duties?", answer: "Orders outside Canada may pay import duties on arrival, set by your country." },
    { question: "Can I buy more than one?", answer: "One piece per person, so more people can own one." },
    { question: "Can I return a piece?", answer: "" },
    { question: "How can I pay?", answer: "By card, Apple Pay, Google Pay or Link, through Stripe's secure checkout." },
  ],
  /** The cities the release time is shown in, in order (IANA time zones). */
  releaseCities: [
    { label: "Vancouver", timeZone: "America/Vancouver" },
    { label: "Toronto", timeZone: "America/Toronto" },
    { label: "London", timeZone: "Europe/London" },
    { label: "Amritsar", timeZone: "Asia/Kolkata" },
    { label: "Melbourne", timeZone: "Australia/Melbourne" },
  ],
  /** "House of Singh × …": the rolling words, the last held longest. */
  artistsWords: ["a weaver", "a potter", "a woodworker", "a jeweller", "you"],
  /** Beneath "Make something with House of Singh" on the Shop page. */
  artistsTeaser: "Collections often include pieces made with other artists. Propose one we could make together.",
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
