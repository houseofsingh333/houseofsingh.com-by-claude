import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect, PAGES } from "./helpers";

/*
 * The JavaScript size budget: what each page type downloads in script
 * before it has loaded, compressed, as sent over the network. Prefetching
 * for later pages starts only after the load (src/components/Link.tsx), so
 * it is not counted. The budgets live in tests/budgets.json; raise one only
 * deliberately, with the reason in the pull request.
 */

type Budgets = { javascriptKB: { [page: string]: number } };
const budgets: Budgets = JSON.parse(readFileSync(join(__dirname, "..", "budgets.json"), "utf8"));

for (const p of PAGES) {
  const budget = budgets.javascriptKB[p.name];
  test(`script within budget: ${p.name}`, async ({ page }, info) => {
    test.skip(budget === undefined, "no budget set for this page");
    await page.goto(p.path, { waitUntil: "load" });
    const kb = await page.evaluate(() =>
      Math.round(
        (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
          .filter((r) => new URL(r.name).origin === location.origin && (r.initiatorType === "script" || /\.js(\?|$)/.test(new URL(r.name).pathname)))
          .reduce((sum, r) => sum + (r.encodedBodySize || r.transferSize), 0) / 1024,
      ),
    );
    info.annotations.push({ type: "javascript", description: `${kb} KB of ${budget} KB` });
    console.log(`${p.name}: ${kb} KB (budget ${budget} KB)`);
    expect(kb, `${p.path} loads ${kb} KB of script; the budget is ${budget} KB`).toBeLessThanOrEqual(budget);
  });
}
