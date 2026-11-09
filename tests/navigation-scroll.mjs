#!/usr/bin/env node
/**
 * tests/navigation-scroll.mjs
 *
 * Behaviour tests for where a page opens (the bug of 9 Nov: new pages
 * opened at the previous page's depth). Run against any running build,
 * on desktop and on a phone:
 *
 *   node tests/navigation-scroll.mjs http://localhost:3000
 *
 * Needs Playwright with its Chromium (not a dependency of the site; on a
 * machine without it: npx -y playwright@1 install chromium, then run with
 * NODE_PATH pointing at it). Exits with 1 if any case fails.
 *
 * Cases, each on desktop (1280x900) and phone (iPhone 14):
 *  1. Home scrolled halfway, the menu, About: About opens at its top, and
 *     stays there (no glide from the old depth).
 *  2. About scrolled down, a footer link to Journal: Journal opens at its top.
 *  3. Back: returns to exactly where About was left, at once (no glide).
 *  4. Forward: Journal at its top again.
 *  5. A project link from the Projects page: the project opens at its top.
 *  6. Projects, At a glance, scrolled: a card (One by one), Enter, then
 *     Back: At a glance again, at the position it was left.
 *  7. An in page link (Privacy contents): scrolls to its anchor.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const failures = [];
const check = (ok, label, detail) => {
  console.log(`${ok ? "pass" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures.push(label);
};

/** scrollY read now and then every 50ms for 600ms: proves it is not gliding. */
async function settledAt(page) {
  const samples = [];
  for (let i = 0; i < 12; i++) {
    samples.push(await page.evaluate(() => Math.round(window.scrollY)));
    await page.waitForTimeout(50);
  }
  return samples;
}
const scrollTo = (page, y) => page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
const half = (page) => page.evaluate(() => Math.round((document.documentElement.scrollHeight - window.innerHeight) / 2));

async function openMenuAndGo(page, href) {
  await page.locator("header[aria-hidden='false'] button[aria-label='Open menu']").first().click();
  await page.locator(`nav[aria-label='Site menu'] a[href='${href}']`).first().click();
}

async function run(name, contextOptions) {
  const browser = await chromium.launch();
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("hos_intro_seen", "1");
      sessionStorage.setItem("hos_newsletter_dismissed", "1");
    } catch {}
  });
  let page = await context.newPage();
  const t = (label) => `${name}: ${label}`;

  // 1. Home halfway, the menu, About.
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await scrollTo(page, await half(page));
  await page.waitForTimeout(300);
  await openMenuAndGo(page, "/about");
  await page.waitForURL("**/about");
  // The new page itself, not the old one still on screen for a moment.
  await page.waitForFunction(() => /About/.test(document.querySelector("h1")?.textContent ?? ""));
  let s = await settledAt(page);
  check(s.every((y) => y === 0), t("menu to About opens at the top"), s.join(","));

  // 3 (setup). About part way down, left through the menu.
  await scrollTo(page, 1500);
  await page.waitForTimeout(300);
  const left = await page.evaluate(() => Math.round(window.scrollY));
  await openMenuAndGo(page, "/journal");
  await page.waitForURL("**/journal");
  s = await settledAt(page);
  check(s.every((y) => y === 0), t("menu to Journal opens at the top"), s.join(","));
  await page.goBack();
  await page.waitForURL("**/about");
  s = await settledAt(page);
  check(s.every((y) => Math.abs(y - left) <= 2), t("Back returns to where About was left, at once"), `left at ${left}; ${s.join(",")}`);
  await page.goForward();
  await page.waitForURL("**/journal");
  s = await settledAt(page);
  check(s.every((y) => y === 0), t("Forward opens Journal at the top"), s.join(","));

  // 2. About scrolled down, a footer link to Journal.
  await page.goto(`${BASE}/about`, { waitUntil: "load" });
  await scrollTo(page, await half(page));
  await page.locator("footer a[href='/journal']").first().click(); // scrolls to the footer first, as a reader would
  await page.waitForURL("**/journal");
  s = await settledAt(page);
  check(s.every((y) => y === 0), t("footer link to Journal opens at the top"), s.join(","));

  // 5. A project link from the Projects page (a fresh visit).
  await page.close();
  page = await context.newPage();
  await page.goto(`${BASE}/projects`, { waitUntil: "load" });
  // At a glance: the words on desktop, the icon button on phones.
  const words = page.locator("button[data-v='glance']");
  if (await words.isVisible()) await words.click();
  else await page.locator("button.mono-icon").click();
  await page.waitForTimeout(800);
  // A card part way down, centred on screen as a reader would have it
  // (so the click does not scroll the page itself); where the page is then
  // is the position to come back to.
  const cards = page.locator(".mono-card:not([hidden])");
  const card = cards.nth(Math.min(2, (await cards.count()) - 1));
  const slug = await card.getAttribute("data-slug");
  await card.evaluate((c) => c.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(400);
  const glanceAt = await page.evaluate(() => Math.round(window.scrollY));
  // Clicked in place (Playwright's own click would first scroll the page).
  await card.locator("a.mono-card-link").evaluate((a) => a.click());
  await page.waitForURL(`**/projects?p=${slug}`);
  await page.waitForTimeout(900);
  await page.locator(`a[href='/projects/${slug}']:visible`).first().click();
  await page.waitForURL(`**/projects/${slug}`);
  s = await settledAt(page);
  check(s.every((y) => y === 0), t("project link opens the project at the top"), s.join(","));

  // 6. Back to Projects: At a glance, where it was left.
  await page.goBack();
  await page.waitForURL(/\/projects(\?|$)/);
  await page.waitForTimeout(800);
  const view = await page.evaluate(() => document.querySelector("[data-view]")?.getAttribute("data-view"));
  const back = await page.evaluate(() => Math.round(window.scrollY));
  check(view === "glance" && Math.abs(back - glanceAt) <= 40, t("Back to Projects restores At a glance and its position"), `view ${view}, left at ${glanceAt}, back at ${back}`);

  // 7. An in page link scrolls to its anchor.
  await page.goto(`${BASE}/privacy`, { waitUntil: "load" });
  const link = page.locator(".legal-contents-link").nth(2);
  const id = (await link.getAttribute("href")).slice(1);
  await link.click();
  await page.waitForTimeout(1600);
  const top = await page.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
  const y = await page.evaluate(() => Math.round(window.scrollY));
  check(y > 0 && top >= -2 && top < 260, t("in page link scrolls to its anchor"), `#${id} top ${top}px, scrollY ${y}`);

  await browser.close();
}

await run("desktop", { viewport: { width: 1280, height: 900 } });
await run("phone", { ...devices["iPhone 14"] });
console.log(failures.length ? `\n${failures.length} failed` : "\nall passed");
process.exit(failures.length ? 1 : 0);
