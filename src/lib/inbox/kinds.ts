/**
 * The Inbox (approved 13 Nov): every message sent through the site, by
 * type. Shared by the forms' routes, the emails and the Studio.
 */

export type MessageKind = "commercial" | "collaboration" | "press" | "artists" | "other";

export const KIND_LABEL: Record<MessageKind, string> = {
  commercial: "Commercial project",
  collaboration: "Collaboration",
  press: "Press",
  artists: "Shop artists",
  other: "Something else",
};

export const KINDS = Object.keys(KIND_LABEL) as MessageKind[];

/** The three kinds of document the Inbox holds. */
export const INBOX_TYPES = ["contactSubmission", "projectInterest", "editionsProposal"] as const;

const has = (body: Record<string, unknown>, keys: string[]) => keys.some((k) => typeof body[k] === "string" && (body[k] as string).trim() !== "");

/**
 * A contact message's type, from the questions that were answered (each
 * choice asks its own), so renaming a choice in Sanity never breaks it;
 * the choice's words are the fallback.
 */
export function contactKind(body: Record<string, unknown>, intent: string): MessageKind {
  if (has(body, ["projectName", "projectDescription", "budget", "timeline"])) return "commercial";
  if (has(body, ["collabType", "portfolioLink", "socialHandle", "collabDescription", "collabTimeline"])) return "collaboration";
  if (has(body, ["mediaOutlet", "inquiryType", "deadline", "mediaDescription"])) return "press";
  const i = intent.toLowerCase();
  if (/commercial|project|hire|brand/.test(i)) return "commercial";
  if (/collab/.test(i)) return "collaboration";
  if (/media|press|feature|interview/.test(i)) return "press";
  return "other";
}

/**
 * A name safe to say back to the person who typed it: no link or web
 * address (so the form cannot be used to send someone a link), letters
 * only, at most three words and 40 characters. Empty when nothing safe is
 * left, and the greeting then reads simply "Thank you."
 */
export function safeName(name: string): string {
  const raw = (name ?? "").trim();
  if (!raw || /:\/\/|www\.|@|\b[a-z0-9-]+\.(com|net|org|io|co|ca|ru|cn|info|biz|xyz|top|app|me|ly|gg|link|site|online|shop)\b/i.test(raw)) return "";
  const words = raw
    .replace(/[^\p{L}\p{M}' .-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !/^[.'-]+$/.test(w))
    .slice(0, 3);
  const out = words.join(" ").slice(0, 40).trim();
  return out;
}
