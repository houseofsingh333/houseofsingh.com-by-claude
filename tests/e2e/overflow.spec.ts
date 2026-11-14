import { test, expect, readThrough, PAGES } from "./helpers";

/*
 * No sideways scroll, from the narrowest phone (320) to a large desktop
 * screen (2560), on every page type. Below 768 the window is a phone's
 * (touch, mobile layout). When a page overflows, the elements that stick
 * out are named.
 */

const WIDTHS = [320, 360, 375, 390, 414, 600, 768, 1024, 1280, 1440, 1920, 2560];

for (const width of WIDTHS) {
  test(`no sideways scroll at ${width}`, async ({ browser }) => {
    test.setTimeout(240_000);
    const phone = width < 768;
    const context = await browser.newContext({ viewport: { width, height: phone ? 760 : 900 }, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 });
    await context.addInitScript(() => {
      try {
        sessionStorage.setItem("hos_intro_seen", "1");
      } catch {}
    });
    const page = await context.newPage();
    const over: string[] = [];
    for (const p of PAGES) {
      await page.goto(p.path, { waitUntil: "load" });
      await readThrough(page);
      await page.waitForTimeout(300);
      const o = await page.evaluate(() => {
        const root = document.documentElement;
        const by = root.scrollWidth - root.clientWidth;
        if (by <= 0) return null;
        // The outermost elements past the right edge, outside any clipping box.
        const culprits = [...document.querySelectorAll("body *")]
          .filter((e) => e.getBoundingClientRect().right > root.clientWidth + 1 && e.getBoundingClientRect().width > 0 && getComputedStyle(e).position !== "fixed")
          .filter((e) => !e.parentElement || e.parentElement.getBoundingClientRect().right <= root.clientWidth + 1)
          .filter((e) => {
            for (let a = e.parentElement; a; a = a.parentElement) if (/hidden|auto|scroll|clip/.test(getComputedStyle(a).overflowX)) return false;
            return true;
          })
          .slice(0, 3)
          .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]}`);
        return `${by}px (${culprits.join(", ") || "unnamed"})`;
      });
      if (o) over.push(`${p.path}: ${o}`);
    }
    await context.close();
    expect(over, `pages wider than the window at ${width}`).toEqual([]);
  });
}
