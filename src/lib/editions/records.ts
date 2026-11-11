import { randomUUID } from "node:crypto";
import { writeClient } from "@/sanity/writeClient";
import type { OrderPiece, OrderRecord, OrderStore } from "./orders";
import type { HoldStore } from "./holds";
import type { freeUnits } from "./holds";

/**
 * Private records on Sanity. Every document here is written with an ID
 * under the "private." path, which Sanity serves only with a token: the
 * dataset is public, these are not. Reading and writing needs
 * SANITY_API_TOKEN (server side only).
 */
export const privateId = (kind: string) => `private.editions-${kind}-${randomUUID()}`;

export async function saveProposal(p: { name: string; email: string; practice: string; link: string; idea: string }): Promise<void> {
  if (!writeClient) throw new Error("SANITY_API_TOKEN is not set");
  await writeClient.create({ _id: privateId("proposal"), _type: "editionsProposal", ...p, submittedAt: new Date().toISOString() });
}

const COUNTER_ID = "private.editions-counter";

/** The order store on Sanity (see orders.ts for what each step means). */
export function sanityOrderStore(): OrderStore {
  const client = writeClient;
  if (!client) throw new Error("SANITY_API_TOKEN is not set");
  return {
    async getPiece(id) {
      return client.fetch<OrderPiece | null>(`*[_id == $id][0]{ _id, name, editionType, issueCertificate, quantity, soldCount, sizes[]{ _key, label, stock, sold } }`, { id });
    },
    async getOrder(id) {
      return client.getDocument<OrderRecord>(id) as Promise<OrderRecord | null>;
    },
    async collectorNumber(id, email, at) {
      const existing = await client.getDocument<{ number: number }>(id);
      if (existing) return existing.number;
      // The next number, taken with optimistic locking so two first
      // purchases at the same moment never share one.
      await client.createIfNotExists({ _id: COUNTER_ID, _type: "editionsCounter", next: 1 });
      for (let attempt = 0; attempt < 5; attempt++) {
        const counter = await client.getDocument<{ _rev: string; next: number }>(COUNTER_ID);
        if (!counter) continue;
        try {
          await client
            .transaction()
            .patch(COUNTER_ID, (p) => p.ifRevisionId(counter._rev).set({ next: counter.next + 1 }))
            .createIfNotExists({ _id: id, _type: "editionsCollector", email, number: counter.next, firstPurchase: at })
            .commit();
          const saved = await client.getDocument<{ number: number }>(id);
          return saved?.number ?? counter.next;
        } catch {
          // Someone else took this number first: read the counter again.
        }
      }
      throw new Error("Could not assign a collector number");
    },
    async createOrderAndCount(order, pieceId, sizeKey, holdKey) {
      try {
        // The sale and its hold's release together: the held unit becomes
        // the sold one, so stock is never counted twice or oversold.
        await client
          .transaction()
          .create(order)
          .patch(pieceId, (p) => {
            let q = p.setIfMissing({ soldCount: 0 }).inc({ soldCount: 1 });
            if (sizeKey) q = q.inc({ [`sizes[_key=="${sizeKey}"].sold`]: 1 });
            if (holdKey && /^[a-f0-9]{18}$/.test(holdKey)) q = q.unset([`holds[_key=="${holdKey}"]`]);
            return q;
          })
          .commit();
      } catch (error) {
        const exists = await client.getDocument(order._id);
        if (exists) return { created: false, soldAfter: 0 };
        throw error;
      }
      const after = await client.getDocument<{ soldCount?: number }>(pieceId);
      return { created: true, soldAfter: after?.soldCount ?? 1 };
    },
    async setOrderFields(id, fields) {
      await client.patch(id).set(fields).commit();
    },
    async orderByPayment(paymentIntent) {
      return client.fetch<(OrderRecord & { _rev: string }) | null>(`*[_type == "editionsOrder" && paymentIntent == $pi][0]`, { pi: paymentIntent });
    },
    async refundAndRestock(order, at) {
      const rev = (order as OrderRecord & { _rev?: string })._rev;
      try {
        await client
          .transaction()
          .patch(order._id, (p) => (rev ? p.ifRevisionId(rev) : p).set({ status: "refunded", refundedAt: at }))
          .patch(order.piece._ref, (p) => {
            const q = p.dec({ soldCount: 1 });
            return order.sizeKey ? q.dec({ [`sizes[_key=="${order.sizeKey}"].sold`]: 1 }) : q;
          })
          .commit();
        return true;
      } catch {
        return false;
      }
    },
  };
}

/** An order by its Checkout Session (thank you page). */
export async function orderBySession(sessionId: string, id: string) {
  if (!writeClient) return null;
  return writeClient.fetch<OrderRecord | null>(`*[_id == $id && sessionId == $sessionId][0]`, { id, sessionId });
}

/** What a certificate shows: the piece, its number, the collector, the date (never the email). */
export type Certificate = {
  pieceName: string;
  editionNumber?: number | null;
  collectorNumber: number;
  paidAt: string;
  testMode?: boolean | null;
  piece?: { editionType: string; quantity: number; slug: string; collection?: { number: number; season: string } | null } | null;
};

export async function certificateByCode(code: string): Promise<Certificate | null> {
  if (!writeClient || !/^[A-Z0-9]{10}$/.test(code)) return null;
  return writeClient.fetch<Certificate | null>(
    `*[_type == "editionsOrder" && certificateCode == $code && status != "refunded"][0]{
      pieceName, editionNumber, collectorNumber, paidAt, testMode,
      "piece": piece->{ editionType, quantity, "slug": slug.current, "collection": collection->{ number, season } }
    }`,
    { code },
  );
}

/** The hold store on Sanity (lib/editions/holds.ts): holds live on the piece. */
export function sanityHoldStore(): HoldStore {
  const client = writeClient;
  if (!client) throw new Error("SANITY_API_TOKEN is not set");
  return {
    async read(pieceId) {
      return client.fetch<(HoldPiece & { _rev: string }) | null>(
        `*[_id == $id][0]{ _rev, quantity, soldCount, sizes[]{ _key, stock, sold }, holds[]{ _key, _type, size, until } }`,
        { id: pieceId },
      );
    },
    async write(pieceId, rev, holds) {
      await client.patch(pieceId).ifRevisionId(rev).set({ holds }).commit();
    },
    async remove(pieceId, key) {
      await client.patch(pieceId).unset([`holds[_key=="${key}"]`]).commit();
    },
  };
}
type HoldPiece = Parameters<typeof freeUnits>[0];
