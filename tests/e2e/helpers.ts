import { test as base, expect, type Page } from "@playwright/test";
import { baseURL } from "../../playwright.config";

/*
 * What every check shares (tests/README.md).
 */

export { expect };

/** The site under test: the PR's Vercel preview in CI, else this machine. */
export const BASE = baseURL;
export const ORIGIN = new URL(BASE).origin;
/** On this machine the server is ours, started in the live configuration. */
export const LOCAL = !process.env.BASE_URL;
/** How much of the Shop the site shows: the live site's sealed Shop, or the preview's full Shop. */
export const SHOP: "anticipation" | "full" = (process.env.EXPECT_EDITIONS as "full" | undefined) ?? (LOCAL ? "anticipation" : "full");

/**
 * Every page type, once (the sitemap's kinds plus the pages outside it).
 * The project and the entry are fixed so their screenshots compare; if one
 * is ever unpublished, change it here.
 */
export const PAGES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "projects", path: "/projects" },
  { name: "project", path: "/projects/zamana" },
  { name: "journal", path: "/journal" },
  { name: "entry", path: "/journal/the-saddle" },
  { name: "month", path: "/journal/archive/2024/11" },
  { name: "contact", path: "/contact" },
  { name: "shop", path: "/editions" },
  { name: "artists", path: "/editions/artists" },
  { name: "shop-terms", path: "/editions/terms" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "unsubscribe", path: "/unsubscribe" },
  { name: "not-found", path: "/this-page-does-not-exist", status: 404 },
] as const;

/** Console lines that say nothing about the site. */
const NOISE = [
  // Vercel's own scripts (Speed Insights) exist only on Vercel.
  /\/_vercel\//,
  // Vercel's toolbar, which Vercel adds to previews (not part of the site,
  // and never on the live site): its frame is refused by the site's
  // security policy, as it should be.
  /Framing 'https:\/\/vercel\.live\/'/,
];

type Errors = { console: string[]; page: string[] };

export const test = base.extend<{ errors: Errors; quiet: void }>({
  // Each visit is a returning reader's: the intro has played and the
  // newsletter note is not offered (the newsletter journey opens it itself).
  quiet: [
    async ({ context }, use) => {
      await context.addInitScript(() => {
        try {
          sessionStorage.setItem("hos_intro_seen", "1");
          sessionStorage.setItem("hos_newsletter_dismissed", "1");
        } catch {}
        // Page changes in progress, from the moment one begins (while the old
        // page is captured, before any fade runs) until it has finished, so
        // a check waits for the whole change (settled, below).
        const w = window as unknown as { __vtOpen: number };
        w.__vtOpen = 0;
        const start = document.startViewTransition?.bind(document);
        if (start) {
          document.startViewTransition = ((arg?: Parameters<typeof start>[0]) => {
            const t = start(arg);
            w.__vtOpen++;
            t.finished.finally(() => w.__vtOpen--);
            return t;
          }) as typeof document.startViewTransition;
        }
      });
      // A protected preview: the bypass key is added to requests to the
      // preview itself only, never to Sanity, Spotify or any other host.
      // The toolbar Vercel adds to previews is not part of the site.
      if (!LOCAL) {
        const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
        await context.route(`${ORIGIN}/**`, (route) =>
          route.continue({
            headers: {
              ...route.request().headers(),
              "x-vercel-skip-toolbar": "1",
              ...(secret ? { "x-vercel-protection-bypass": secret } : {}),
            },
          }),
        );
      }
      await use();
    },
    { auto: true },
  ],
  // Console errors and uncaught errors, gathered for the checks that need
  // none (the crawl, and every journey's page loads).
  errors: async ({ page }, use) => {
    const errors: Errors = { console: [], page: [] };
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const text = `${m.text()} ${m.location()?.url ?? ""}`;
      if (!NOISE.some((n) => n.test(text))) errors.console.push(text.trim());
    });
    page.on("pageerror", (e) => errors.page.push(e.message));
    await use(errors);
  },
});

/** Opens a page and waits until it has loaded and its fonts are in. */
export async function open(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return res;
}

/** The header that is showing (the crest or the wordmark bar). */
export const header = (page: Page) => page.locator("header[aria-hidden='false']").first();

/** Whether a view transition (the page change) is still running. */
export const transitioning = (page: Page) =>
  page.evaluate(() => document.getAnimations().some((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition")));

/** Waits for the page change to finish: none begun and unfinished, no fade running. */
export async function settled(page: Page) {
  await page
    .waitForFunction(
      () =>
        !(window as unknown as { __vtOpen?: number }).__vtOpen &&
        !document.getAnimations().some((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition")),
      null,
      { timeout: 4000 },
    )
    .catch(() => {});
}

/** scrollY read every 50ms for 600ms once the page change is over: proves it is not gliding. */
export async function scrollSamples(page: Page) {
  await settled(page);
  const samples: number[] = [];
  for (let i = 0; i < 12; i++) {
    samples.push(await page.evaluate(() => Math.round(window.scrollY)));
    await page.waitForTimeout(50);
  }
  return samples;
}

export const scrollTo = (page: Page, y: number) => page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);

/** Scrolls through the whole page, so every lazy image and reveal has been reached, then back to the top. */
export async function readThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.8)) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}
