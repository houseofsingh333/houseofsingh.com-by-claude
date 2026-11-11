import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { projectId } from "@/sanity/env";
import { readJsonBody } from "@/lib/read-json-body";
import type { OrderRecord } from "@/lib/editions/orders";
import { sendMadeEmail, sendShippedEmail } from "@/lib/email/orders";

/**
 * The Studio's order actions, "Made" and "Shipped" (sanity/actions): each
 * moves the order on and emails the buyer through Resend. Only someone
 * signed in to this Sanity project may call it: the Studio sends its own
 * login token, which is checked with Sanity before anything changes.
 * Marking an order twice sends no second email.
 */
const ROLES = new Set(["administrator", "editor", "developer"]);

async function studioUser(request: Request): Promise<{ id: string; name?: string } | null> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token.length < 20) return null;
  const res = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/users/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
  if (!res?.ok) return null;
  const me = (await res.json().catch(() => null)) as { id?: string; name?: string; role?: string; roles?: { name: string }[] } | null;
  if (!me?.id) return null;
  const roles = [me.role, ...(me.roles ?? []).map((r) => r.name)].filter(Boolean) as string[];
  if (roles.length && !roles.some((r) => ROLES.has(r))) return null;
  return { id: me.id, name: me.name };
}

export async function POST(request: Request) {
  const user = await studioUser(request);
  if (!user) return NextResponse.json({ error: "Sign in to the Studio again, then try once more." }, { status: 401 });
  if (!writeClient) return NextResponse.json({ error: "SANITY_API_TOKEN is not set." }, { status: 500 });

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body as { id?: string; action?: string; trackingNumber?: string; trackingUrl?: string };
  const id = typeof body.id === "string" ? body.id.replace(/^drafts\./, "") : "";
  if (!/^private\.editions-order-[A-Za-z0-9_-]+$/.test(id)) return NextResponse.json({ error: "Not an order." }, { status: 400 });

  const order = await writeClient.getDocument<OrderRecord & { _rev: string }>(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status === "refunded") return NextResponse.json({ error: "This order was refunded." }, { status: 409 });
  const now = new Date().toISOString();

  if (body.action === "made") {
    if (order.status === "made" || order.status === "shipped") return NextResponse.json({ ok: true, status: order.status, email: "already sent" });
    await writeClient.patch(id).ifRevisionId(order._rev).set({ status: "made", madeAt: now }).commit();
    const email = await sendMadeEmail(order);
    return NextResponse.json({ ok: true, status: "made", email });
  }

  if (body.action === "shipped") {
    const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim().slice(0, 60) : "";
    let trackingUrl = typeof body.trackingUrl === "string" ? body.trackingUrl.trim().slice(0, 400) : "";
    if (!trackingNumber) return NextResponse.json({ error: "Add the tracking number." }, { status: 400 });
    if (trackingUrl && !/^https:\/\//i.test(trackingUrl)) trackingUrl = "";
    if (order.status === "shipped" && order.trackingNumber === trackingNumber) return NextResponse.json({ ok: true, status: "shipped", email: "already sent" });
    const fields = { status: "shipped" as const, shippedAt: now, trackingNumber, ...(trackingUrl ? { trackingUrl } : {}), ...(order.madeAt ? {} : { madeAt: now }) };
    await writeClient.patch(id).ifRevisionId(order._rev).set(fields).commit();
    const email = await sendShippedEmail({ ...order, ...fields });
    return NextResponse.json({ ok: true, status: "shipped", email });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
