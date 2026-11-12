import { test, expect, open, header, scrollSamples, scrollTo, settled } from "./helpers";
import type { Page } from "@playwright/test";

/*
 * Where a page opens, Back and Forward (CLAUDE.md, guardrail 12), and that
 * a page change never shows two pages at once (the old page fades out to
 * the canvas, then the new one fades in).
 */

const half = (page: Page) => page.evaluate(() => Math.round((document.documentElement.scrollHeight - window.innerHeight) / 2));

async function openMenuAndGo(page: Page, href: string) {
  await header(page).locator("button[aria-label='Open menu']").click();
  await page.locator(`nav[aria-label='Site menu'] a[href='${href}']`).first().click();
}

const atTop = (s: number[]) => s.every((y) => y === 0);

test("the menu opens a page at its top, Back returns to where it was left, Forward to the top", async ({ page }) => {
  await open(page, "/");
  await scrollTo(page, await half(page));
  await page.waitForTimeout(300);
  await openMenuAndGo(page, "/about");
  await page.waitForURL("**/about");
  await expect(page.locator("h1").first()).toContainText(/About/);
  const aboutAt = await scrollSamples(page);
  expect(atTop(aboutAt), `About opens at its top, and stays there (${aboutAt.join(",")})`).toBe(true);

  await scrollTo(page, 1500);
  await page.waitForTimeout(300);
  const left = await page.evaluate(() => Math.round(window.scrollY));
  await openMenuAndGo(page, "/journal");
  await page.waitForURL("**/journal");
  expect(atTop(await scrollSamples(page)), "Journal opens at its top").toBe(true);

  await page.goBack();
  await page.waitForURL("**/about");
  const back = await scrollSamples(page);
  expect(back.every((y) => Math.abs(y - left) <= 2), `Back returns to ${left} at once (${back.join(",")})`).toBe(true);

  await page.goForward();
  await page.waitForURL("**/journal");
  expect(atTop(await scrollSamples(page)), "Forward opens Journal at its top").toBe(true);
});

test("a footer link from far down a page opens the next page at its top", async ({ page }) => {
  await open(page, "/about");
  await scrollTo(page, await half(page));
  await page.locator("footer a[href='/journal']").first().click();
  await page.waitForURL("**/journal");
  expect(atTop(await scrollSamples(page))).toBe(true);
});

test("Projects: a project opens at its top, and Back restores At a glance where it was left", async ({ page }) => {
  await open(page, "/projects");
  const words = page.locator("button[data-v='glance']");
  if (await words.isVisible()) await words.click();
  else await page.locator("button.mono-icon").click();
  await page.waitForTimeout(800);
  const cards = page.locator(".mono-card:not([hidden])");
  const card = cards.nth(Math.min(2, (await cards.count()) - 1));
  const slug = await card.getAttribute("data-slug");
  await card.evaluate((c) => c.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(400);
  const glanceAt = await page.evaluate(() => Math.round(window.scrollY));
  // Clicked in place (Playwright's own click would first scroll the page).
  await card.locator("a.mono-card-link").evaluate((a: HTMLElement) => a.click());
  await page.waitForURL(`**/projects?p=${slug}`);
  await page.waitForTimeout(900);
  await page.locator(`a[href='/projects/${slug}']:visible`).first().click();
  await page.waitForURL(`**/projects/${slug}`);
  const opened = await scrollSamples(page);
  expect(atTop(opened), `the project opens at its top (${opened.join(",")})`).toBe(true);

  await page.goBack();
  await page.waitForURL(/\/projects(\?|$)/);
  await page.waitForTimeout(800);
  const view = await page.evaluate(() => document.querySelector("[data-view]")?.getAttribute("data-view"));
  const back = await page.evaluate(() => Math.round(window.scrollY));
  expect(view).toBe("glance");
  expect(Math.abs(back - glanceAt), `left at ${glanceAt}, back at ${back}`).toBeLessThanOrEqual(40);
});

test("an in page link glides to its anchor", async ({ page }) => {
  await open(page, "/privacy");
  const link = page.locator(".legal-contents-link").nth(2);
  const id = (await link.getAttribute("href"))!.slice(1);
  await link.click();
  await page.waitForTimeout(1600);
  const top = await page.evaluate((i) => Math.round(document.getElementById(i)!.getBoundingClientRect().top), id);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  expect(top).toBeGreaterThanOrEqual(-2);
  expect(top).toBeLessThan(260);
});

/*
 * No frame with two pages. Throughout the page change the old page's and
 * the new page's snapshots are read on every frame: the new one may only
 * start to show once the old one has gone.
 */
type Change = { started: number; frames: { old: number; new: number }[]; timing: { part: string; start: number; end: number }[] };

async function watchChange(page: Page, go: () => Promise<unknown>): Promise<Change> {
  await page.evaluate(() => {
    const w = window as unknown as { __vt: Change; __vtRun: boolean };
    w.__vt = { started: 0, frames: [], timing: [] };
    w.__vtRun = true;
    const fades = () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition"));
    // The fade as planned: read the moment the page change is ready, however
    // busy the page is (a refresh by refresh sample can miss a short fade).
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((arg?: Parameters<typeof start>[0]) => {
      const t = start(arg);
      w.__vt.started++;
      t.ready
        .then(() => {
          for (const a of fades()) {
            const c = a.effect!.getComputedTiming();
            const s = Number(c.delay ?? 0);
            w.__vt.timing.push({ part: (a.effect as KeyframeEffect).pseudoElement!, start: s, end: s + Number(c.duration ?? 0) });
          }
        })
        .catch(() => {});
      return t;
    }) as typeof document.startViewTransition;
    // And as seen, on every refresh it gets.
    const read = (part: string) => Number(getComputedStyle(document.documentElement, `::view-transition-${part}(root)`).opacity);
    const tick = () => {
      if (!w.__vtRun) return;
      if (fades().length) w.__vt.frames.push({ old: read("old"), new: read("new") });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await go();
  await settled(page);
  await page.waitForTimeout(200);
  return page.evaluate(() => {
    const w = window as unknown as { __vt?: Change; __vtRun: boolean };
    w.__vtRun = false;
    return w.__vt ?? { started: 0, frames: [], timing: [] };
  });
}

for (const [label, from, to] of [
  // (On the Journal page an entry opens in place, in the reading room: not a page change.)
  ["Home, far down, to About by the footer", "/", "footer a[href='/about']"],
  ["About, far down, to Journal by the footer", "/about", "footer a[href='/journal']"],
  ["an entry, far down, to Projects by the footer", "/journal/the-saddle", "footer a[href='/projects']"],
  ["a project, far down, to Contact by the footer", "/projects/zamana", "footer a[href='/contact']"],
] as const) {
  test(`page change, ${label}: never two pages at once`, async ({ page }) => {
    await open(page, from);
    // A browser without view transitions changes page at once: nothing to watch.
    test.skip(!(await page.evaluate(() => "startViewTransition" in document)), "no view transitions in this browser");
    await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    const link = page.locator(`${to}:visible`).last();
    await link.evaluate((a) => a.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.waitForTimeout(400);
    // The destination's own address: the Journal's reading room updates the
    // address by itself as entries pass, so "the address changed" is not enough.
    const dest = new URL((await link.getAttribute("href"))!, page.url()).pathname;
    const change = await watchChange(page, async () => {
      await link.evaluate((a: HTMLElement) => a.click());
      await page.waitForURL((u) => u.pathname === dest);
    });
    // The page did change, through the fade (not at once).
    expect(change.started, "the page change faded").toBeGreaterThan(0);
    // As planned: the new page starts to show only once the old one has gone.
    const old = change.timing.filter((t) => t.part === "::view-transition-old(root)");
    const fresh = change.timing.filter((t) => t.part === "::view-transition-new(root)");
    expect(old.length && fresh.length, `the fade's parts: ${JSON.stringify(change.timing)}`).toBeTruthy();
    expect(Math.max(...old.map((t) => t.end)), "the old page has gone before the new one starts").toBeLessThanOrEqual(Math.min(...fresh.map((t) => t.start)) + 1);
    // And as seen, frame by frame.
    const both = change.frames.filter((f) => f.old > 0.01 && f.new > 0.01);
    expect(both, `frames showing both pages: ${JSON.stringify(both.slice(0, 3))}`).toHaveLength(0);
    expect(atTop(await scrollSamples(page)), "the new page opens at its top").toBe(true);
  });
}

/*
 * From a page left only a little scrolled (found by this suite, 12 Nov):
 * project and Journal entry pages kept the old depth, because Next.js
 * judged them already on screen. PageTransition now opens every new page
 * at its top.
 */
test("a project entered from One by one, a little scrolled, opens at its top", async ({ page }) => {
  await open(page, "/projects?p=sifti-da-ghar");
  await page.waitForTimeout(1500);
  await scrollTo(page, 150);
  await page.waitForTimeout(300);
  await page.locator("a.mono-enter[href='/projects/sifti-da-ghar']:visible").first().evaluate((a: HTMLElement) => a.click());
  await page.waitForURL("**/projects/sifti-da-ghar");
  const s = await scrollSamples(page);
  expect(atTop(s), `opened at ${s.join(",")}`).toBe(true);
});

test("a project opened from About a little scrolled opens at its top", async ({ page }) => {
  await open(page, "/about");
  await page.waitForTimeout(1500);
  await scrollTo(page, 305);
  await page.waitForTimeout(300);
  // As a link would: Next's own router (no project link sits near About's top).
  await page.evaluate(() => (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push("/projects/zamana"));
  await page.waitForURL("**/projects/zamana");
  const s = await scrollSamples(page);
  expect(atTop(s), `opened at ${s.join(",")}`).toBe(true);
});

// A Journal entry's address opens the reading room at that entry (its
// heading under the header), from anywhere, as a direct visit does.
test("an entry opened from About a little scrolled opens at the entry", async ({ page }) => {
  await open(page, "/about");
  await page.waitForTimeout(1500);
  await scrollTo(page, 305);
  await page.waitForTimeout(300);
  await page.evaluate(() => (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push("/journal/the-saddle"));
  await page.waitForURL("**/journal/the-saddle");
  await scrollSamples(page);
  const off = await page.evaluate(() => {
    const el = document.getElementById("entry-the-saddle")!;
    return Math.round(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0));
  });
  expect(Math.abs(off), `the entry sits ${off}px from its place`).toBeLessThanOrEqual(8);
});
