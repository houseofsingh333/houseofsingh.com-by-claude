/**
 * The consent wording beneath each sign up field, and how it is recorded.
 * Canada's anti spam law (CASL) asks a request for consent to say what the
 * emails are for, who sends them, and that consent can be withdrawn, with
 * a way to reach the sender (the Contact and Privacy pages, linked in the
 * footer of every page). The visible wording is kept short (Shop design
 * round 2) and still names the sender, the purpose and the way out; Kit
 * keeps, with each person, those exact words, the sender in full, the
 * form and the moment (docs/email.md).
 */
export const CONSENT = {
  letters: "Occasional letters from House of Singh. Unsubscribe anytime.",
  shop: "Release news and early access only, from House of Singh Editions. Unsubscribe anytime.",
} as const;

/** Who sends each kind, in full, as recorded with the consent. */
const SENDER = {
  letters: "Maninder Singh at House of Singh, Toronto",
  shop: "Maninder Singh, House of Singh Editions, Toronto",
} as const;

/** What is kept in Kit: the words shown, who sends, where, and when. */
export const consentRecord = (kind: keyof typeof CONSENT, where: string, at = new Date()) =>
  `${CONSENT[kind]} (Sender: ${SENDER[kind]}. Agreed on ${where}, ${at.toISOString()})`;
