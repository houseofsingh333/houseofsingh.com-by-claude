import type { APIRequestContext, BrowserContext } from "@playwright/test";
import { test, expect, BASE, ORIGIN, LOCAL } from "./helpers";

/*
 * The crawl: every page of the site, from the home page and the sitemap,
 * following every link on the site's own host. Fails on a page that does
 * not answer, a broken link to the site itself, a console error, a script
 * error or a failed request to the site. Links to other sites are checked
 * once and listed in the report, without failing: some (Instagram,
 * LinkedIn) refuse automated visitors whatever the link.
 *
 * Against Production: BASE_URL=https://houseofsingh.com npx playwright test crawl --project desktop
 */

const LIMIT = Number(process.env.CRAWL_LIMIT || 600);
// Vercel's own scripts (Speed Insights) exist only on Vercel.
const vercelOnly = (text: string) => LOCAL && /\/_vercel\//.test(text);
const own = (u: URL) => u.origin === ORIGIN;
const FILE = /\.(xml|txt|ics|png|jpe?g|webp|avif|svg|pdf|ico|webmanifest|json)$/i;

type Record = { href: string; from: string; status: number; problems: string[] };

async function visit(context: BrowserContext, href: string, from: string, found: (link: string, on: string) => void): Promise<Record> {
  const page = await context.newPage();
  const record: Record = { href, from, status: 0, problems: [] };
  page.on("console", (m) => {
    const text = `${m.text()} ${m.location()?.url ?? ""}`;
    if (m.type() === "error" && !vercelOnly(text)) record.problems.push(`console: ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => record.problems.push(`script error: ${String(e.message).slice(0, 300)}`));
  page.on("response", (r) => {
    const u = new URL(r.url());
    if (own(u) && r.status() >= 400 && !vercelOnly(u.pathname) && u.href !== href) record.problems.push(`failed request: ${r.status()} ${u.pathname}${u.search}`);
  });
  try {
    const res = await page.goto(href, { waitUntil: "load", timeout: 45_000 });
    record.status = res?.status() ?? 0;
    // Let the lazy parts (embeds, the journal strip, deferred images) start.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(700);
    for (const l of await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => (a as HTMLAnchorElement).href))) found(l, href);
  } catch (e) {
    record.problems.push(`did not load: ${(e as Error).message.split("\n")[0]}`);
  }
  await page.close();
  return record;
}

async function status(request: APIRequestContext, href: string): Promise<number | string> {
  const u = new URL(href);
  const headers: { [k: string]: string } = { "user-agent": "Mozilla/5.0 (link check)" };
  if (own(u) && process.env.VERCEL_AUTOMATION_BYPASS_SECRET) headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  for (const method of ["head", "get"] as const) {
    try {
      const r = await request[method](href, { headers, timeout: 20_000, maxRedirects: 5, failOnStatusCode: false });
      if (method === "head" && (r.status() === 405 || r.status() === 403 || r.status() >= 500)) continue;
      return r.status();
    } catch (e) {
      if (method === "get") return `error ${(e as Error).message.split("\n")[0].slice(0, 80)}`;
    }
  }
  return "no answer";
}

test("the crawl: no broken links, no console errors", async ({ context, request }, info) => {
  test.setTimeout(20 * 60_000);
  const queue = new Map<string, string>();
  const seen = new Set<string>();
  const linkFrom = new Map<string, string>();
  const found = (link: string, on: string) => {
    let url: URL;
    try {
      url = new URL(link, BASE);
    } catch {
      return;
    }
    url.hash = "";
    if (!/^https?:$/.test(url.protocol)) return;
    if (!linkFrom.has(url.href)) linkFrom.set(url.href, on);
    if (!own(url) || seen.has(url.href) || queue.has(url.href)) return;
    // Files and the Studio are checked as links only.
    if (FILE.test(url.pathname) || url.pathname.startsWith("/api/") || url.pathname.startsWith("/studio")) return;
    queue.set(url.href, on);
  };

  found(`${BASE}/`, "(start)");
  const sitemap = await request.get(`${BASE}/sitemap.xml`, { headers: process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {} });
  expect(sitemap.status(), "the sitemap answers").toBe(200);
  // The sitemap names the live addresses; visit their paths on the site under test.
  for (const m of (await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) found(new URL(new URL(m[1].replace(/&amp;/g, "&")).pathname, BASE).href, "sitemap.xml");

  const pages: Record[] = [];
  while (queue.size && seen.size < LIMIT) {
    const batch = [...queue.entries()].slice(0, 4);
    for (const [href] of batch) {
      queue.delete(href);
      seen.add(href);
    }
    pages.push(...(await Promise.all(batch.map(([href, from]) => visit(context, href, from, found)))));
  }

  // Every link once: the site's own by the status its visit gave, the rest by asking.
  const broken: string[] = [];
  const outside: string[] = [];
  const hrefs = [...linkFrom.keys()];
  for (let i = 0; i < hrefs.length; i += 8) {
    await Promise.all(
      hrefs.slice(i, i + 8).map(async (href) => {
        const visited = pages.find((p) => p.href === href);
        const s = visited ? visited.status : await status(request, href);
        if (typeof s === "number" && s < 400) return;
        (own(new URL(href)) ? broken : outside).push(`${s} ${href}  (on ${linkFrom.get(href)})`);
      }),
    );
  }

  const noisy = pages.filter((p) => p.status >= 400 || p.problems.length).map((p) => `${p.status} ${p.href} (from ${p.from})\n    ${p.problems.join("\n    ")}`);
  info.annotations.push({ type: "crawl", description: `${pages.length} pages visited, ${hrefs.length} links checked` });
  if (outside.length) info.annotations.push({ type: "links to other sites not answering", description: outside.join("\n") });
  expect(noisy, "pages with problems").toEqual([]);
  expect(broken, "broken links to the site itself").toEqual([]);
});
