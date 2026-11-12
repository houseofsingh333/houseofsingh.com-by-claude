import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { KEY_PATH, ORIGIN, indexNowKey, submitToIndexNow, urlsForDocument } from "@/lib/indexnow";
import { sitemapEntries } from "@/lib/sitemapEntries";
import { siteMode } from "@/lib/editions/enabled";

/*
 * IndexNow (docs/indexnow.md).
 *
 * POST, from the Sanity webhook, when a document is published: sends the
 * changed page, and the pages that show it, to IndexNow.
 * POST {"all": true}, with the same secret header: sends every address in
 * the sitemap (the first submission, or after a long gap).
 * GET: whether IndexNow is set up here (no secrets in the answer), so the
 * setup can be checked from a browser.
 *
 * Every answer says what IndexNow replied, and the result is logged in
 * Vercel, so a submission can be followed end to end.
 */

/** The secret in the request header matches, compared in constant time. */
function authorised(req: Request, secret: string): boolean {
  const given = Buffer.from(req.headers.get("x-webhook-secret") ?? "");
  const wanted = Buffer.from(secret);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

export async function GET() {
  const key = indexNowKey();
  const secret = Boolean(process.env.SANITY_WEBHOOK_SECRET?.trim());
  return NextResponse.json({
    configured: Boolean(key && secret),
    key: key ? "set" : "missing: add INDEXNOW_KEY in Vercel (Production) and redeploy",
    keyFile: key ? `${ORIGIN}${KEY_PATH}` : null,
    webhookSecret: secret ? "set" : "missing: add SANITY_WEBHOOK_SECRET in Vercel (Production) and redeploy",
  });
}

export async function POST(req: Request) {
  const key = indexNowKey();
  const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  // Not set up yet: nothing is sent, and the answer says what is missing.
  if (!key || !secret) {
    console.warn("[indexnow] not configured: INDEXNOW_KEY or SANITY_WEBHOOK_SECRET is missing");
    return NextResponse.json({ ok: false, reason: "not configured (see GET /api/indexnow)" }, { status: 503 });
  }
  if (!authorised(req, secret)) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { all?: unknown; _type?: unknown; slug?: unknown; date?: unknown } | null;
  let urlList: string[] | null;
  if (body?.all === true) {
    urlList = (await sitemapEntries()).map((e) => e.url);
  } else {
    urlList = urlsForDocument(body);
    // With the Shop off, /editions is not a page (404): never announced.
    if (urlList && siteMode() === "off") urlList = urlList.filter((u) => !u.endsWith("/editions"));
    if (!urlList?.length) return NextResponse.json({ ok: false, reason: "no public page shows this document" }, { status: 400 });
  }

  const result = await submitToIndexNow(urlList, key);
  console.log(`[indexnow] ${urlList.length} addresses sent, ${result.count} accepted: IndexNow ${result.status} (${result.message})`);
  return NextResponse.json({ ...result, urlList: body?.all === true ? undefined : urlList }, { status: result.ok ? 200 : 502 });
}
