/*
 * IndexNow: tells Bing, Yandex, Seznam, Naver and others (not Google) that
 * a page is new or changed, so it is crawled within minutes instead of days.
 *
 * Both values live only in Vercel's environment variables, never in the
 * repo. Without them, nothing happens: the key file answers 404 and the
 * webhook route sends nothing.
 *   INDEXNOW_KEY           the key, public by design (served at KEY_PATH)
 *   SANITY_WEBHOOK_SECRET  shared with the Sanity webhook, private
 */

export const INDEXNOW_HOST = "houseofsingh.com";
/** Where the key is served. At the root, so it covers every address. */
export const KEY_PATH = "/indexnow-key.txt";

/** The key, when it is set and in the form IndexNow accepts (8 to 128 of a-z, A-Z, 0-9, -). */
export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}
