import { addressOf, emailConfig } from "./config";

/** One email, ready to send. */
export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** For the daily count and the queue: order and shipping before sign ups. */
  priority: "order" | "signup";
  /** What it is, for the logs and the queue (never the address). */
  kind: string;
  /** Who sends it: Maninder (the newsletter welcome) or the Shop (everything else). */
  sender: "letters" | "editions";
  /** Where a reply goes, when not back to the sender (the proposal copy: to the artist). */
  replyTo?: string;
  /** Extra headers (List-Unsubscribe on the sign up emails). */
  headers?: Record<string, string>;
};

class ResendError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Sends one email through Resend's API (plain fetch). */
export async function resendSend(email: Email): Promise<string> {
  const { resendKey, resendBase, fromLetters, fromEditions } = emailConfig();
  // Each email comes from its sender, and replies go back to that sender.
  const from = email.sender === "letters" ? fromLetters : fromEditions;
  if (!resendKey) throw new ResendError("RESEND_API_KEY is not set", 0);
  const res = await fetch(`${resendBase}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: email.replyTo || addressOf(from),
      ...(email.headers ? { headers: email.headers } : {}),
      tags: [{ name: "kind", value: email.kind.replace(/[^a-zA-Z0-9_-]/g, "_") }],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok || !data.id) throw new ResendError(data.message ?? `Resend answered ${res.status}`, res.status);
  return data.id;
}

