import type { Email } from "@/lib/email/resend";
import { messageNoticeEmail, type InboxMessage } from "@/lib/email/templates";

export type SendOutcome = "sent" | "queued" | "skipped" | "failed";

/**
 * A message sent through a form (contact, project interest, For artists):
 * never lost (approved 13 Nov).
 *
 * 1. Saved privately in Sanity first (the Studio's Inbox).
 * 2. Then emailed to Maninder at once (EMAIL_NOTIFY_TO), the whole
 *    message, replying writes to the sender; the email queue's highest
 *    priority, tried three times on the spot, then every fifteen minutes,
 *    and the site watch raises an alert if it is stuck (lib/email/outbox).
 * 3. Then a short confirmation to the sender, which never repeats their
 *    words or any link they typed.
 *
 * The sender is told it worked when the message is safe in at least one
 * place: saved, or on its way to Maninder (if Sanity is down, the email
 * alone still carries it). Only when both fail do they see an error and
 * can send it again. Written against small functions so tests can run it
 * without Sanity or Resend (scripts/inbox-test.ts).
 */
export async function receive(input: {
  message: InboxMessage;
  /** Saves the message; returns its document id. */
  save: () => Promise<string>;
  /** Records on the saved message that Maninder was emailed (best effort). */
  markNotified?: (id: string, outcome: SendOutcome) => Promise<void>;
  /** The confirmation to the sender, or null for none. */
  thanks: Email | null;
  send: (email: Email) => Promise<SendOutcome>;
  notifyTo: string;
}): Promise<{ ok: boolean; saved: boolean; notified: SendOutcome; thanked: SendOutcome | "none" }> {
  let id: string | null = null;
  try {
    id = await input.save();
  } catch (error) {
    console.error("A message could not be saved; emailing it all the same:", error instanceof Error ? error.message : error);
  }
  const notified = await input.send(messageNoticeEmail(input.notifyTo, input.message)).catch((): SendOutcome => "failed");
  if (id && input.markNotified) await input.markNotified(id, notified).catch(() => {});
  const carried = notified === "sent" || notified === "queued";
  const ok = Boolean(id) || carried;
  let thanked: SendOutcome | "none" = "none";
  if (ok && input.thanks) thanked = await input.send(input.thanks).catch((): SendOutcome => "failed");
  return { ok, saved: Boolean(id), notified, thanked };
}
