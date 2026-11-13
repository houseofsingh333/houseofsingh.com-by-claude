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
 * A message to Maninder from a form (priority "notice") comes before
 * everything: it is tried three times on the spot, then waits, and is
 * tried again every fifteen minutes (retryNotices, called by the site
 * watch through api/email/retry). Each waiting email counts its attempts;
 * a notice still waiting after STUCK_AFTER attempts, or two hours, is
 * "stuck", and the site watch opens an alert (docs/monitoring.md).
 *
 * Written against a small store, so the same logic runs on Sanity and in
 * memory in tests (scripts/email-test.ts).
 */

export type Queued = { _id: string; priority: 0 | 1 | 2; createdAt: string; email: Email; attempts?: number };

/** A waiting notice is stuck after this many attempts, or after STUCK_AGE_MS. */
export const STUCK_AFTER = 4;
export const STUCK_AGE_MS = 2 * 60 * 60 * 1000;

export interface OutboxStore {
  /** Claims one send for the day if the day's count is under `max`; false when full. */
  claim(day: string, max: number): Promise<boolean>;
  queue(item: Queued): Promise<void>;
  /** Queued emails, order and shipping first, then oldest first. */
  waiting(limit: number): Promise<Queued[]>;
  remove(id: string): Promise<void>;
  /** Counts one more failed attempt on a waiting email. */
  bump(id: string): Promise<void>;
}

export type Sender = (email: Email) => Promise<string>;

/** The day the limit counts, in UTC (when Resend's daily allowance resets). */
export const dayOf = (at: Date) => at.toISOString().slice(0, 10);

const ceiling = (priority: Email["priority"]) => {
  const { dailyLimit, signupReserve } = emailConfig();
  return priority === "signup" ? Math.max(1, dailyLimit - signupReserve) : dailyLimit;
};

const queuedItem = (email: Email, at: Date): Queued => ({
  _id: `private.email-queue-${randomUUID()}`,
  priority: email.priority === "notice" ? 0 : email.priority === "order" ? 1 : 2,
  createdAt: at.toISOString(),
  email,
  attempts: 1,
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The pauses between a notice's attempts on the spot (three tries in all). */
export const NOTICE_RETRY_MS = [600, 1500];

export type SendResult = "sent" | "queued";

export async function deliver(email: Email, store: OutboxStore, send: Sender, now = new Date(), retryMs = NOTICE_RETRY_MS): Promise<SendResult> {
  if (!(await store.claim(dayOf(now), ceiling(email.priority)))) {
    await store.queue(queuedItem(email, now));
    return "queued";
  }
  // A notice is tried three times before it waits; anything else once.
  const pauses = email.priority === "notice" ? retryMs : [];
  for (let attempt = 0; ; attempt++) {
    try {
      await send(email);
      return "sent";
    } catch (error) {
      if (attempt < pauses.length) {
        await wait(pauses[attempt]);
        continue;
      }
      console.error(`Email (${email.kind}) not sent, queued:`, error instanceof Error ? error.message : error);
      await store.queue(queuedItem(email, now));
      return "queued";
    }
  }
}

/** Whether a waiting notice has failed too often, or waited too long. */
export const isStuck = (item: Queued, now: Date) =>
  item.priority === 0 && ((item.attempts ?? 1) >= STUCK_AFTER || now.getTime() - Date.parse(item.createdAt) > STUCK_AGE_MS);

/**
 * Every fifteen minutes (the site watch, api/email/retry): tries the
 * waiting notices again. Returns how many went, how many still wait, and
 * how many are stuck (the site watch then opens an alert).
 */
export async function retryNotices(store: OutboxStore, send: Sender, now = new Date()): Promise<{ sent: number; waiting: number; stuck: number }> {
  const notices = (await store.waiting(500)).filter((i) => i.priority === 0);
  let sent = 0;
  let stuck = 0;
  for (const item of notices) {
    try {
      if (!(await store.claim(dayOf(now), ceiling(item.email.priority)))) throw new Error("the day's sending limit is reached");
      await send(item.email);
      await store.remove(item._id);
      sent++;
    } catch (error) {
      console.error(`Notice (${item.email.kind}) still not sent:`, error instanceof Error ? error.message : error);
      await store.bump(item._id);
      if (isStuck({ ...item, attempts: (item.attempts ?? 1) + 1 }, now)) stuck++;
    }
  }
  return { sent, waiting: notices.length - sent, stuck };
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
      await store.bump(item._id).catch(() => {});
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
      return client.fetch<Queued[]>(`*[_type == "emailQueued"] | order(priority asc, createdAt asc)[0...$limit]{ _id, priority, createdAt, email, attempts }`, { limit });
    },
    async remove(id) {
      await client.delete(id);
    },
    async bump(id) {
      await client.patch(id).setIfMissing({ attempts: 1 }).inc({ attempts: 1 }).commit();
    },
  };
}

/**
 * Sends an email the website triggers. Without Resend set up nothing is
 * sent (and nothing queued): the site works, the email is skipped and
 * logged. Without Sanity (no token) there is no count or queue: sent
 * directly. If the queue itself cannot be reached (Sanity down), a notice
 * is still sent straight to Resend: a message must reach Maninder even
 * then. Never throws: an email must not break the form, sign up or order.
 * "failed": not sent and not queued (only when Sanity and Resend both fail).
 */
export async function sendEmail(email: Email): Promise<SendResult | "skipped" | "failed"> {
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
    if (email.priority !== "notice") return "skipped";
    for (const pause of [0, ...NOTICE_RETRY_MS]) {
      await wait(pause);
      try {
        await resendSend(email);
        return "sent";
      } catch {
        // Try again.
      }
    }
    return "failed";
  }
}
