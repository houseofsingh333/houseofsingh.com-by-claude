import { randomUUID } from "node:crypto";
import { writeClient } from "@/sanity/writeClient";
import { kitSubscribe, kitUnsubscribe, type Signup } from "./kit";

/**
 * A sign up (the footer newsletter, the Shop's Notify me) goes to Kit. Once
 * Kit has it, no copy of the email is kept on the website. When Kit cannot
 * be reached (or is not set up yet), the sign up is kept privately in
 * Sanity and the daily job (api/email/daily) tries Kit again, so nobody is
 * lost; once Kit has it, the private copy is deleted.
 */

/** A sign up (or, with action "unsubscribe", a request to leave) waiting for Kit. */
export type PendingSignup = Signup & { _id: string; createdAt: string; attempts: number; lastError?: string; action?: "subscribe" | "unsubscribe" };

export interface PendingStore {
  keep(p: PendingSignup): Promise<void>;
  list(limit: number): Promise<PendingSignup[]>;
  update(id: string, fields: Partial<PendingSignup>): Promise<void>;
  remove(id: string): Promise<void>;
}

export type Subscribe = (s: Signup) => Promise<void>;
export type Unsubscribe = (email: string) => Promise<void>;

export async function signUp(s: Signup, store: PendingStore | null, subscribe: Subscribe = kitSubscribe, now = new Date()): Promise<"kit" | "kept"> {
  try {
    await subscribe(s);
    return "kit";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Kit sign up failed, kept privately to retry:", message);
    if (!store) throw error;
    await store.keep({ ...s, _id: `private.signup-pending-${randomUUID()}`, createdAt: now.toISOString(), attempts: 1, lastError: message.slice(0, 300) });
    return "kept";
  }
}

/** The daily job: tries Kit again for every kept sign up. */
export async function retryPending(store: PendingStore, subscribe: Subscribe = kitSubscribe, unsubscribe: Unsubscribe = kitUnsubscribe): Promise<{ moved: number; left: number }> {
  const pending = await store.list(500);
  let moved = 0;
  for (const p of pending) {
    try {
      if (p.action === "unsubscribe") await unsubscribe(p.email);
      else await subscribe({ email: p.email, tag: p.tag, kind: p.kind, consent: p.consent });
      await store.remove(p._id);
      moved++;
    } catch (error) {
      await store.update(p._id, { attempts: p.attempts + 1, lastError: (error instanceof Error ? error.message : String(error)).slice(0, 300) });
    }
  }
  return { moved, left: pending.length - moved };
}

/**
 * Leaving: the person is unsubscribed in Kit. Any sign up of theirs still
 * waiting for Kit is dropped first, so a retry never signs them up again.
 * If Kit cannot be reached, the request is kept privately and the daily job
 * tries again; the person is told they are unsubscribed either way.
 */
export async function leave(email: string, store: PendingStore | null, unsubscribe: Unsubscribe = kitUnsubscribe, now = new Date()): Promise<"kit" | "kept"> {
  if (store) {
    for (const p of await store.list(500)) if (p.email.toLowerCase() === email.toLowerCase() && p.action !== "unsubscribe") await store.remove(p._id);
  }
  try {
    await unsubscribe(email);
    return "kit";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Kit unsubscribe failed, kept privately to retry:", message);
    if (!store) throw error;
    await store.keep({ _id: `private.signup-pending-${randomUUID()}`, email, tag: "", kind: "letters", consent: "", action: "unsubscribe", createdAt: now.toISOString(), attempts: 1, lastError: message.slice(0, 300) });
    return "kept";
  }
}

export function sanityPending(): PendingStore | null {
  const client = writeClient;
  if (!client) return null;
  return {
    async keep(p) {
      await client.create({ ...p, _type: "signupPending" });
    },
    async list(limit) {
      return client.fetch<PendingSignup[]>(`*[_type == "signupPending"] | order(createdAt asc)[0...$limit]`, { limit });
    },
    async update(id, fields) {
      await client.patch(id).set(fields).commit();
    },
    async remove(id) {
      await client.delete(id);
    },
  };
}
