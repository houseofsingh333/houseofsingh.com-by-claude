/**
 * The consent wording beneath each sign up field, and how it is recorded.
 * Canada's anti spam law (CASL) asks a request for consent to say what the
 * emails are for, who sends them, and that consent can be withdrawn; the
 * wording below does, and is kept with each person in Kit as given, with
 * the form and the moment (docs/email.md).
 */
export const CONSENT = {
  letters: "Occasional letters from Maninder Singh at House of Singh, Toronto. Unsubscribe anytime, from any letter.",
  shop: "Emails from House of Singh Editions, Toronto, about this Collection's release and early access. Unsubscribe anytime.",
} as const;

/** What is kept in Kit: the words shown, where, and when. */
export const consentRecord = (kind: keyof typeof CONSENT, where: string, at = new Date()) =>
  `${CONSENT[kind]} (Agreed on ${where}, ${at.toISOString()})`;
