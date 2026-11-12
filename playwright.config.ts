import { defineConfig, devices } from "@playwright/test";

/*
 * The automated checks (tests/README.md).
 *
 * Where they run:
 * - BASE_URL set (CI, against the pull request's Vercel preview): that site.
 * - BASE_URL unset: a production build on this machine, started here on
 *   port 3100 in the live site's configuration (the Shop sealed). Build it
 *   first with `npm run test:build`.
 *
 * Two sizes, as Maninder checks the site: a phone (390 wide) and a desktop
 * (1440 wide). BROWSERS=all adds Safari's engine (WebKit) and Firefox, for a
 * run on a Mac; the screenshots compare in Chromium only.
 */

const PORT = 3100;
const external = Boolean(process.env.BASE_URL);
export const baseURL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

const phone = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  userAgent: devices["iPhone 14"].userAgent,
};
const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

// Specs that sweep sizes themselves, or measure the site once, run in the
// desktop project only.
const once = /(overflow|crawl|budget)\.spec\.ts/;

const extra = process.env.BROWSERS === "all"
  ? [
      { name: "phone-webkit", use: { ...devices["iPhone 14"] }, testIgnore: [once, /visual\.spec\.ts/] },
      { name: "desktop-firefox", use: { ...devices["Desktop Firefox"], ...desktop }, testIgnore: [once, /visual\.spec\.ts/] },
    ]
  : [];

export default defineConfig({
  testDir: "tests/e2e",
  // Screenshots are compared per page, so a run is many small tests.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  // A test that fails is tried once more in CI, so a slow network moment is
  // not mistaken for a broken page; a real fault fails twice.
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // A tolerance for anti aliasing only; a moved block or a changed size
      // is far more than this.
      maxDiffPixelRatio: 0.002,
      threshold: 0.2,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  // Approved screenshots live beside the tests, one per page and size, with
  // no machine name: they are made and compared on Linux (CI) only.
  snapshotPathTemplate: "tests/e2e/visual/{arg}-{projectName}{ext}",
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
    reducedMotion: "no-preference",
    locale: "en-CA",
    timezoneId: "America/Toronto",
  },
  projects: [
    { name: "phone", use: { browserName: "chromium", ...phone }, testIgnore: once },
    { name: "desktop", use: { browserName: "chromium", ...desktop } },
    ...extra,
  ],
  webServer: external
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: `${baseURL}/about`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          // The live site's configuration: the Shop sealed.
          EDITIONS_MODE: "anticipation",
          // Signs the test's own unsubscribe link (tests/e2e/journeys.spec.ts).
          // A value for this machine only; the real one lives in Vercel.
          EMAIL_LINK_SECRET: "local-test-only-link-secret",
        },
      },
});
