/**
 * scripts/indexnow-test.ts
 *
 * Checks for IndexNow (src/lib/indexnow.ts), without the network:
 *
 *   npx tsx scripts/indexnow-test.ts
 *
 * Which addresses each published document announces, the key rule, and
 * what is sent to IndexNow and how its answers are read (with a stand-in
 * for the network).
 */
import { INDEXNOW_ENDPOINT, indexNowKey, submitToIndexNow, urlsForDocument } from "../src/lib/indexnow";

let failed = 0;
const check = (ok: boolean, label: string, detail = "") => {
  console.log(`${ok ? "pass" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failed++;
};
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const O = "https://houseofsingh.com";

// Which pages a published document announces.
check(same(urlsForDocument({ _type: "project", slug: "zamana" }), [`${O}/projects/zamana`, `${O}/projects`, `${O}/`]), "a project: its page, Projects and Home");
check(same(urlsForDocument({ _type: "journalEntry", slug: "the-saddle", date: "2026-07-05" }), [`${O}/journal/the-saddle`, `${O}/journal`, `${O}/journal/archive/2026/7`, `${O}/`]), "an entry: its page, the Journal, its month and Home");
check(same(urlsForDocument({ _type: "heroSlide" }), [`${O}/`]), "a hero slide: Home");
check(same(urlsForDocument({ _type: "aboutPage" }), [`${O}/about`, `${O}/`]), "the About page: About and Home");
check(same(urlsForDocument({ _type: "contactPage" }), [`${O}/contact`]), "the Contact page");
check(same(urlsForDocument({ _type: "editionsCollection", slug: "collection-01" }), [`${O}/editions`]), "a Collection: the Shop page only");
check(urlsForDocument({ _type: "editionsOrder" }) === null && urlsForDocument({ _type: "project", slug: "../x" }) === null && urlsForDocument(null) === null, "private records, bad addresses and nothing: no announcement");

// The key.
check(indexNowKey({ INDEXNOW_KEY: " 0123abcd0123abcd0123abcd0123abcd " }) === "0123abcd0123abcd0123abcd0123abcd", "a 32 character key is read (spaces trimmed)");
check(indexNowKey({ INDEXNOW_KEY: "short" }) === null && indexNowKey({}) === null && indexNowKey({ INDEXNOW_KEY: "has space in it!" }) === null, "a missing or malformed key is refused");

// What is sent, and how IndexNow's answer is read.
type Sent = { url: string; body: { host: string; key: string; keyLocation: string; urlList: string[] } };
const stand = (status: number | "down") => {
  const sent: Sent[] = [];
  const fetcher = (async (url: string, init: RequestInit) => {
    sent.push({ url, body: JSON.parse(String(init.body)) });
    if (status === "down") throw new Error("offline");
    return new Response(null, { status });
  }) as unknown as typeof fetch;
  return { sent, fetcher };
};
(async () => {
  const key = "0123abcd0123abcd0123abcd0123abcd";
  {
    const { sent, fetcher } = stand(200);
    const r = await submitToIndexNow([`${O}/`, `${O}/about`, `${O}/about`, "https://example.com/x"], key, fetcher);
    check(r.ok && r.count === 2 && sent.length === 1, "200: accepted; duplicates and other sites left out", `${r.count} sent`);
    const b = sent[0]?.body;
    check(sent[0]?.url === INDEXNOW_ENDPOINT && b?.host === "houseofsingh.com" && b?.key === key && b?.keyLocation === `${O}/indexnow-key.txt`, "the request: endpoint, host, key and key file");
  }
  {
    const { fetcher } = stand(202);
    const r = await submitToIndexNow([`${O}/`], key, fetcher);
    check(r.ok && /checking the key/.test(r.message), "202: received while IndexNow checks the key file");
  }
  {
    const { fetcher } = stand(403);
    const r = await submitToIndexNow([`${O}/`], key, fetcher);
    check(!r.ok && r.status === 403 && /key file/.test(r.message), "403: reported as a key file mismatch");
  }
  {
    const { fetcher } = stand("down");
    const r = await submitToIndexNow([`${O}/`], key, fetcher);
    check(!r.ok && r.status === 0, "no answer: reported, nothing thrown");
  }
  {
    const { sent, fetcher } = stand(200);
    const many = Array.from({ length: 10_050 }, (_, i) => `${O}/journal/entry-${i}`);
    const r = await submitToIndexNow(many, key, fetcher);
    check(r.ok && sent.length === 2 && sent[0].body.urlList.length === 10_000 && r.count === 10_050, "more than 10,000 addresses go in two requests");
  }
  {
    const { sent, fetcher } = stand(200);
    const r = await submitToIndexNow(["https://example.com/"], key, fetcher);
    check(!r.ok && sent.length === 0, "nothing on this site: nothing sent");
  }
  console.log(failed ? `\n${failed} failed` : "\nall passed");
  process.exit(failed ? 1 : 0);
})();
