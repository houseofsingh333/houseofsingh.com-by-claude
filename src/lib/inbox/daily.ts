import type { SanityClient } from "next-sanity";
import { contactKind, INBOX_TYPES, type MessageKind } from "./kinds";

/** A message still open: not marked Replied (or Reviewed) and not archived. */
export type OpenMessage = { _id: string; _type: string; name: string; kind?: MessageKind | null; intent?: string | null; submittedAt: string };

/** A saved message's type (older messages saved before types: from what they are). */
export function kindOf(m: Pick<OpenMessage, "_type" | "kind" | "intent">): MessageKind {
  if (m.kind) return m.kind;
  if (m._type === "editionsProposal") return "artists";
  if (m._type === "projectInterest") return "collaboration";
  return contactKind({}, m.intent ?? "");
}

export const DIGEST_DAYS = 7;

/** The messages of the last seven days not yet replied to, reviewed or archived, newest first. */
export async function openMessages(client: SanityClient, now = new Date()): Promise<OpenMessage[]> {
  const since = new Date(now.getTime() - DIGEST_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return client.fetch<OpenMessage[]>(
    `*[_type in $types && !(_id in path("drafts.**")) && submittedAt > $since && replied != true && archived != true] | order(submittedAt desc){ _id, _type, name, kind, intent, submittedAt }`,
    { types: [...INBOX_TYPES], since },
  );
}
