/*
 * IndexNow: tells Bing, Yandex, Seznam, Naver and others (not Google) that
 * a page is new or changed, so it is crawled within minutes instead of days.
 *
 * Both values live only in Vercel's environment variables, never in the
 * repo. Without them, nothing happens: the key file answers 404 and the
 * webhook route sends nothing (and says so, at GET /api/indexnow).
 *   INDEXNOW_KEY           the key, public by design (served at KEY_PATH)
 *   SANITY_WEBHOOK_SECRET  shared with the Sanity webhook, private
 *
 * Setup and checking: docs/indexnow.md.
 */
import { parseSanityDate } from "@/lib/dates";
import { journalMonthHref } from "@/lib/journalLinks";

export const INDEXNOW_HOST = "houseofsingh.com";
export const ORIGIN = `https://${INDEXNOW_HOST}`;
/** Where the key is served. At the root, so it covers every address. */
export const KEY_PATH = "/indexnow-key.txt";
/** The shared IndexNow endpoint: one submission reaches Bing and every other participant. */
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
/** IndexNow accepts at most this many addresses in one submission. */
const MAX_URLS = 10_000;

/** The key, when it is set and in the form IndexNow accepts (8 to 128 of a-z, A-Z, 0-9, -). */
export function indexNowKey(env: Record<string, string | undefined> = process.env): string | null {
  const key = env.INDEXNOW_KEY?.trim();
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/** What a Sanity webhook sends (its projection, docs/indexnow.md). */
export type ChangedDocument = { _type?: unknown; slug?: unknown; date?: unknown } | null | undefined;

/**
 * The addresses to announce when a document is published: the page itself
 * and the pages that show it. Null for a document no public page shows.
 */
export function urlsForDocument(doc: ChangedDocument): string[] | null {
  const type = typeof doc?._type === "string" ? doc._type : null;
  const slug = typeof doc?.slug === "string" && SLUG.test(doc.slug) ? doc.slug : null;
  switch (type) {
    case "project":
      return slug ? [`${ORIGIN}/projects/${slug}`, `${ORIGIN}/projects`, `${ORIGIN}/`] : null;
    case "journalEntry": {
      if (!slug) return null;
      const urls = [`${ORIGIN}/journal/${slug}`, `${ORIGIN}/journal`];
      if (typeof doc?.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(doc.date)) {
        const d = parseSanityDate(doc.date);
        urls.push(`${ORIGIN}${journalMonthHref(d.getFullYear(), d.getMonth() + 1)}`);
      }
      return [...urls, `${ORIGIN}/`];
    }
    // The home page's slides, and the About and Contact pages.
    case "heroSlide":
      return [`${ORIGIN}/`];
    case "aboutPage":
      return [`${ORIGIN}/about`, `${ORIGIN}/`];
    case "contactPage":
      return [`${ORIGIN}/contact`];
    // The Shop's opening page (its other pages are kept out of search engines).
    case "editionsCollection":
    case "editionsSettings":
      return [`${ORIGIN}/editions`];
    default:
      return null;
  }
}

export type SubmitResult = { ok: boolean; status: number; message: string; count: number };

/** What IndexNow's answer means (https://www.indexnow.org/documentation). */
export function explain(status: number): string {
  switch (status) {
    case 200:
      return "accepted";
    case 202:
      return "received; IndexNow is checking the key file";
    case 400:
      return "rejected: bad request";
    case 403:
      return "rejected: the key file does not match the key";
    case 422:
      return "rejected: an address is not on houseofsingh.com, or the key is not valid";
    case 429:
      return "rejected: too many submissions, try later";
    default:
      return `unexpected answer ${status}`;
  }
}

/**
 * Sends addresses to IndexNow (one request per 10,000). Only addresses on
 * this site are sent. `fetcher` is the network (the tests pass a stand-in).
 */
export async function submitToIndexNow(urls: string[], key: string, fetcher: typeof fetch = fetch): Promise<SubmitResult> {
  const own = [...new Set(urls.filter((u) => u.startsWith(`${ORIGIN}/`)))];
  if (!own.length) return { ok: false, status: 0, message: "no addresses on houseofsingh.com to send", count: 0 };
  let last: SubmitResult = { ok: true, status: 200, message: "accepted", count: 0 };
  for (let i = 0; i < own.length; i += MAX_URLS) {
    const urlList = own.slice(i, i + MAX_URLS);
    try {
      const res = await fetcher(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: INDEXNOW_HOST, key, keyLocation: `${ORIGIN}${KEY_PATH}`, urlList }),
        signal: AbortSignal.timeout(8000),
      });
      // 200 and 202 both mean IndexNow has the addresses.
      last = { ok: res.status === 200 || res.status === 202, status: res.status, message: explain(res.status), count: last.count + urlList.length };
      if (!last.ok) return last;
    } catch {
      return { ok: false, status: 0, message: "IndexNow did not answer", count: last.count };
    }
  }
  return last;
}
