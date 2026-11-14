import { test, expect, open } from "./helpers";

/*
 * The Spotlight's aperture (Home, In the studio now) opens through the
 * scroll: its progress --p must be a registered number (@property in
 * styles/home.css), or Chrome and Edge treat it as text and the shutters
 * jump from closed to open in one step. Lost once with the exhibition's
 * styles (#101); this checks the shutters pass through the in between.
 */
test("the aperture's shutters slide open gradually through the scroll", async ({ page, browserName }, info) => {
  test.skip(info.project.name !== "desktop" || browserName !== "chromium", "desktop Chromium: the scroll timeline");
  await open(page, "/");
  const aperture = page.locator(".aperture");
  test.skip((await aperture.count()) === 0, "the Spotlight is off");

  const { top, height, vh } = await aperture.evaluate((el) => ({
    top: el.getBoundingClientRect().top + window.scrollY,
    height: (el as HTMLElement).offsetHeight,
    vh: window.innerHeight,
  }));
  // How far the left shutter has slid, 0 (closed) to 1 (open), at eleven
  // points from the stage pinning to its release.
  const open01: number[] = [];
  for (let i = 0; i <= 10; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), top + ((height - vh) * i) / 10);
    await page.waitForTimeout(150);
    open01.push(
      await page.locator(".aperture-shutter-l").evaluate((el) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return Math.round((-m.m41 / el.getBoundingClientRect().width) * 100) / 100;
      }),
    );
  }
  const between = open01.filter((v) => v > 0.05 && v < 0.95);
  expect(open01[0], `closed at the start: ${open01.join(", ")}`).toBeLessThan(0.05);
  expect(open01.at(-1)!, `open at the end: ${open01.join(", ")}`).toBeGreaterThan(0.95);
  expect(between.length, `steps between closed and open: ${open01.join(", ")}`).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < open01.length; i++) expect(open01[i], `never closing again: ${open01.join(", ")}`).toBeGreaterThanOrEqual(open01[i - 1] - 0.01);
});
