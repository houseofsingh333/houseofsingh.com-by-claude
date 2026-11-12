import { test, expect, open, readThrough, PAGES, LOCAL, SHOP } from "./helpers";

/*
 * Screenshots of every page type, on a phone (390) and a desktop (1440),
 * compared with the approved ones in tests/e2e/visual/. What they guard is
 * the layout: type, spacing, colour, the order of things. So that only a
 * real change shows:
 * - photographs, video and embedded players are covered by a plain block
 *   (they load at their own pace, and changing them is a content decision);
 * - the clock is fixed (the Toronto time, the Shop's dates);
 * - motion is at rest (reduced motion, finished animations).
 *
 * An intended change is approved with the "approve-visuals" label on the
 * pull request (tests/README.md). Screenshots are made and compared on Linux
 * only: a Mac draws type a little differently, so they are skipped there.
 */

test.skip(process.platform !== "linux", "screenshots are compared on Linux (CI) only");
test.skip(!LOCAL && !process.env.VISUAL, "compared on the build made in CI, in the live site's configuration");

test.use({ reducedMotion: "reduce" });

// The Journal's pages hold every entry (some 68,000 pixels): their first
// screen, where the reader arrives, is compared; every other page in full.
const FIRST_SCREEN = new Set(["journal", "entry", "month"]);

// Noon in Toronto on a fixed day.
const FIXED = new Date("2026-11-12T12:00:00-05:00");

for (const p of PAGES) {
  test(`looks as approved: ${p.name}`, async ({ page }) => {
    test.skip(p.path.startsWith("/editions") && SHOP !== "anticipation", "the sealed Shop");
    test.setTimeout(120_000);
    await page.clock.setFixedTime(FIXED);
    await open(page, p.path);
    const full = !FIRST_SCREEN.has(p.name);
    if (full) await readThrough(page);
    await page.waitForTimeout(800);
    // The entry's address opens the reading room at the entry; placed again
    // here, once fonts are in, so the first screen is the same every time.
    if (p.name === "entry") await page.evaluate(() => document.getElementById("entry-the-saddle")?.scrollIntoView({ block: "start", behavior: "instant" }));
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      fullPage: full,
      mask: [page.locator("img, picture, video, iframe, canvas, [style*='background-image']")],
      maskColor: "#E7E3DF",
      timeout: 30_000,
    });
  });
}
