#!/usr/bin/env node
/**
 * tests/crawl.mjs
 *
 * Visits every page of a running site in a real browser and reports broken
 * links and console errors:
 *
 *   node tests/crawl.mjs https://houseofsingh.com
 *
 * Starts from the home page and the sitemap, follows every link on the
 * site's own host, and for each page records: its status, console errors,
 * uncaught page errors and failed requests to the site itself (4xx and 5xx).
 * Every link found (inside the site and out) is then checked once; links to
 * other sites are reported apart, since some (Instagram, LinkedIn) refuse
 * automated visitors whatever the link.
 *
 * Needs Playwright with its Chromium (not a dependency of the site), as the
 * other tests here do. Exits with 1 if a page of the site is broken or logs
 * an error.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = new URL((process.argv[2] || "http://localhost:3000").replace(/\/$/, ""));
const LIMIT = Number(process.env.CRAWL_LIMIT || 600);
const same = (u) => u.host === BASE.host;
// Vercel's own scripts (Speed Insights) exist only on Vercel: off it they
// answer 404, which says nothing about the site.
const local = !/vercel\.app$|houseofsingh\.com$/.test(BASE.hostname);
const vercelOnly = (text) => local && /\/_vercel\//.test(text);
const clean = (u) => {
  const url = new URL(u, BASE);
  url.hash = "";
  return url;
};

const queue = new Map(); // href -> where it was first seen
const seen = new Set();
const linkFrom = new Map(); // every link -> first page that had it
const pages = [];

function add(href, from) {
  let url;
  try {
    url = clean(href);
  } catch {
    return;
  }
  if (!/^https?:$/.test(url.protocol)) return;
  if (!linkFrom.has(url.href)) linkFrom.set(url.href, from);
  if (!same(url) || seen.has(url.href) || queue.has(url.href)) return;
  // Files, not pages: checked as links only.
  if (/\.(xml|txt|ics|png|jpe?g|webp|avif|svg|pdf|ico|webmanifest|json)$/i.test(url.pathname) || url.pathname.startsWith("/api/") || url.pathname.startsWith("/studio")) return;
  queue.set(url.href, from);
}

add(BASE.href, "(start)");
try {
  const xml = await (await fetch(new URL("/sitemap.xml", BASE))).text();
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) add(m[1].replace(/&amp;/g, "&"), "sitemap.xml");
} catch (e) {
  console.log(`sitemap not read: ${e.message}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  try {
    sessionStorage.setItem("hos_intro_seen", "1");
    sessionStorage.setItem("hos_newsletter_dismissed", "1");
  } catch {}
});

async function visit(href, from) {
  const page = await context.newPage();
  const record = { href, from, status: 0, console: [], errors: [], failed: [] };
  page.on("console", (m) => {
    if (m.type() !== "error" || vercelOnly(`${m.text()} ${m.location()?.url ?? ""}`)) return;
    record.console.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => record.errors.push(String(e.message || e).slice(0, 300)));
  page.on("response", (r) => {
    const u = new URL(r.url());
    if (same(u) && r.status() >= 400 && !vercelOnly(u.pathname)) record.failed.push(`${r.status()} ${u.pathname}${u.search}`);
  });
  try {
    const res = await page.goto(href, { waitUntil: "load", timeout: 45000 });
    record.status = res?.status() ?? 0;
    // Let lazy parts (embeds, the journal strip, deferred images) start.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(800);
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href));
    for (const l of links) add(l, href);
  } catch (e) {
    record.errors.push(`load failed: ${e.message.split("\n")[0]}`);
  }
  await page.close();
  pages.push(record);
}

while (queue.size && seen.size < LIMIT) {
  const batch = [...queue.entries()].slice(0, 4);
  for (const [href] of batch) {
    queue.delete(href);
    seen.add(href);
  }
  await Promise.all(batch.map(([href, from]) => visit(href, from)));
  process.stdout.write(`\r${seen.size} pages`);
}
await browser.close();
console.log("");

// Every link once: the site's own by status, the rest as reported by their hosts.
async function status(href) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(href, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "Mozilla/5.0 (link check)" } });
      if (method === "HEAD" && (r.status === 405 || r.status === 403 || r.status >= 500)) continue;
      return r.status;
    } catch (e) {
      if (method === "GET") return `error ${e.cause?.code || e.message}`;
    }
  }
}
const brokenOwn = [];
const outside = [];
const hrefs = [...linkFrom.keys()];
for (let i = 0; i < hrefs.length; i += 8) {
  await Promise.all(
    hrefs.slice(i, i + 8).map(async (href) => {
      const visited = pages.find((p) => p.href === href);
      const s = visited ? visited.status : await status(href);
      const ok = typeof s === "number" && s < 400;
      if (!ok) (same(new URL(href)) ? brokenOwn : outside).push(`${s} ${href}  (on ${linkFrom.get(href)})`);
    }),
  );
}

const noisy = pages.filter((p) => p.status >= 400 || p.console.length || p.errors.length || p.failed.length);
console.log(`pages visited: ${pages.length}; links checked: ${hrefs.length}`);
for (const p of noisy) {
  console.log(`\n${p.status} ${p.href}  (from ${p.from})`);
  for (const c of p.console) console.log(`  console: ${c}`);
  for (const e of p.errors) console.log(`  error: ${e}`);
  for (const f of p.failed) console.log(`  failed request: ${f}`);
}
console.log(`\nbroken links on the site: ${brokenOwn.length}`);
for (const b of brokenOwn) console.log(`  ${b}`);
console.log(`links to other sites not answering 2xx or 3xx: ${outside.length}`);
for (const o of outside) console.log(`  ${o}`);
const fail = noisy.length + brokenOwn.length;
console.log(fail ? `\n${fail} problems on the site` : "\nno broken links, no console errors");
process.exit(fail ? 1 : 0);
