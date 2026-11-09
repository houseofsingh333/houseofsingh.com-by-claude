import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { INDEXNOW_HOST, KEY_PATH, indexNowKey } from "@/lib/indexnow";
import { parseSanityDate } from "@/lib/dates";
import { journalMonthHref } from "@/lib/journalLinks";

/*
 * Called by a Sanity webhook when a journal entry or a project is created
 * or edited (the settings are in docs/indexnow.md). Sends that page, and
 * the pages that list it, to IndexNow. Does nothing until INDEXNOW_KEY and
 * SANITY_WEBHOOK_SECRET are both set in Vercel.
 */

const ORIGIN = `https://${INDEXNOW_HOST}`;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/** The secret in the request header matches, compared in constant time. */
function authorised(req: Request, secret: string): boolean {
  const given = Buffer.from(req.headers.get("x-webhook-secret") ?? "");
  const wanted = Buffer.from(secret);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/** The addresses to announce for a changed document. */
function urlsFor(doc: { _type?: unknown; slug?: unknown; date?: unknown } | null): string[] | null {
  const slug = typeof doc?.slug === "string" && SLUG.test(doc.slug) ? doc.slug : null;
  if (!slug) return null;
  if (doc?._type === "project") {
    return [`${ORIGIN}/projects/${slug}`, `${ORIGIN}/projects`, `${ORIGIN}/`];
  }
  if (doc?._type === "journalEntry") {
    const urls = [`${ORIGIN}/journal/${slug}`, `${ORIGIN}/journal`];
    if (typeof doc.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(doc.date)) {
      const d = parseSanityDate(doc.date);
      urls.push(`${ORIGIN}${journalMonthHref(d.getFullYear(), d.getMonth() + 1)}`);
    }
    return [...urls, `${ORIGIN}/`];
  }
  return null;
}

export async function POST(req: Request) {
  const key = indexNowKey();
  const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  // Not set up yet: nothing is sent.
  if (!key || !secret) return NextResponse.json({ ok: false, reason: "not configured" }, { status: 503 });
  if (!authorised(req, secret)) return NextResponse.json({ ok: false }, { status: 401 });

  const urlList = urlsFor(await req.json().catch(() => null));
  if (!urlList) return NextResponse.json({ ok: false, reason: "not a journal entry or project" }, { status: 400 });

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: INDEXNOW_HOST, key, keyLocation: `${ORIGIN}${KEY_PATH}`, urlList }),
      signal: AbortSignal.timeout(8000),
    });
    // 200 and 202 both mean accepted.
    return NextResponse.json({ ok: res.ok, status: res.status, urlList }, { status: res.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, reason: "IndexNow did not answer" }, { status: 502 });
  }
}
