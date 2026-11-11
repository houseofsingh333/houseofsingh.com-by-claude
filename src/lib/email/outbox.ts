import { randomUUID } from "node:crypto";
import { writeClient } from "@/sanity/writeClient";
import { emailConfig } from "./config";
import { resendSend, type Email } from "./resend";

/**
 * Every automatic email goes out through here, within Resend's daily limit
 * (RESEND_DAILY_LIMIT, 100 on the free plan). Each day's count is kept
 * privately in Sanity. Under the limit, an email is sent at once. Over it,
 * the email waits privately in Sanity and goes out the next day (the daily
 * job, api/email/daily), order and shipping emails first, then the oldest
 * first; none is ever dropped. Sign up confirmations stop a few short of
 * the limit (RESEND_SIGNUP_RESERVE), so a busy day of sign ups never holds
 * back an order email. An email that fails to send waits the same way.
 *
 * Written against a small store, so the same logic runs on Sanity and in
 * memory in tests (scripts/email-test.ts).
 */

export type Queued = { _id: string; priority: 1 | 2; createdAt: string; email: Email };

export interface OutboxStore {
  /** Claims one send for the day if the day's count is under `max`; false when full. */
  claim(day: string, max: number): Promise<boolean>;
  queue(item: Queued): Promise<void>;
  /** Queued emails, order and shipping first, then oldest first. */
  waiting(limit: number): Promise<Queued[]>;
  remove(id: string): Promise<void>;
}

export type Sender = (email: Email) => Promise<string>;

/** The day the limit counts, in UTC (when Resend's daily allowance resets). */
export const dayOf = (at: Date) => at.toISOString().slice(0, 10);

const ceiling = (priority: Email["priority"]) => {
  const { dailyLimit, signupReserve } = emailConfig();
  return priority === "order" ? dailyLimit : Math.max(1, dailyLimit - signupReserve);
};

const queuedItem = (email: Email, at: Date): Queued => ({
  _id: `private.email-queue-${randomUUID()}`,
  priority: email.priority === "order" ? 1 : 2,
  createdAt: at.toISOString(),
  email,
});

export type SendResult = "sent" | "queued";

export async function deliver(email: Email, store: OutboxStore, send: Sender, now = new Date()): Promise<SendResult> {
  if (!(await store.claim(dayOf(now), ceiling(email.priority)))) {
    await store.queue(queuedItem(email, now));
    return "queued";
  }
  try {
    await send(email);
    return "sent";
  } catch (error) {
    console.error(`Email (${email.kind}) not sent, queued:`, error instanceof Error ? error.message : error);
    await store.queue(queuedItem(email, now));
    return "queued";
  }
}

/** The daily job: sends what waited, order emails first, oldest first, until the day's limit. */
export async function drain(store: OutboxStore, send: Sender, now = new Date()): Promise<{ sent: number; left: number }> {
  let sent = 0;
  const waiting = await store.waiting(500);
  for (const item of waiting) {
    if (!(await store.claim(dayOf(now), ceiling(item.email.priority)))) {
      // Sign ups may be full while orders are not: keep going for orders only.
      if (item.priority === 2) continue;
      break;
    }
    try {
      await send(item.email);
      await store.remove(item._id);
      sent++;
    } catch (error) {
      console.error(`Queued email (${item.email.kind}) still not sent:`, error instanceof Error ? error.message : error);
    }
  }
  return { sent, left: waiting.length - sent };
}

/** The outbox on Sanity (private documents, read and written with the token). */
export function sanityOutbox(): OutboxStore {
  const client = writeClient;
  if (!client) throw new Error("SANITY_API_TOKEN is not set");
  return {
    async claim(day, max) {
      const id = `private.email-day-${day}`;
      await client.createIfNotExists({ _id: id, _type: "emailDay", day, count: 0 });
      for (let attempt = 0; attempt < 6; attempt++) {
        const doc = await client.getDocument<{ _rev: string; count: number }>(id);
        if (!doc) continue;
        if (doc.count >= max) return false;
        try {
          await client.patch(id).ifRevisionId(doc._rev).set({ count: doc.count + 1 }).commit();
          return true;
        } catch {
          // Another email took the slot first: read the count again.
        }
      }
      return false;
    },
    async queue(item) {
      await client.create({ ...item, _type: "emailQueued" });
    },
    async waiting(limit) {
      return client.fetch<Queued[]>(`*[_type == "emailQueued"] | order(priority asc, createdAt asc)[0...$limit]{ _id, priority, createdAt, email }`, { limit });
    },
    async remove(id) {
      await client.delete(id);
    },
  };
}

/**
 * Sends an email the website triggers. Without Resend set up nothing is
 * sent (and nothing queued): the site works, the email is skipped and
 * logged. Without Sanity (no token) there is no count or queue: sent
 * directly. Never throws: an email must not break the sign up or order.
 */
export async function sendEmail(email: Email): Promise<SendResult | "skipped"> {
  if (!emailConfig().resendKey) {
    console.warn(`RESEND_API_KEY is not set: the ${email.kind} email was not sent.`);
    return "skipped";
  }
  try {
    if (!writeClient) {
      await resendSend(email);
      return "sent";
    }
    return await deliver(email, sanityOutbox(), resendSend);
  } catch (error) {
    console.error(`Email (${email.kind}) failed:`, error instanceof Error ? error.message : error);
    return "skipped";
  }
}
