/**
 * The email check the sign up forms make before sending (the same rule as
 * the server's), and the site's own message when it fails. The forms turn
 * the browser's own bubble off (noValidate), so the message is in the
 * site's voice and colour, the same in every browser (audit S7).
 */
export const EMAIL_HINT = "Please enter a full email address, for example name@example.com.";

export function looksLikeEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
