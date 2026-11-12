import type { Page } from "@playwright/test";
import { test, expect, open, header, readThrough, PAGES, SHOP } from "./helpers";

/*
 * Accessibility: axe (WCAG 2.2, levels A and AA) on every page type and on
 * every state a reader can reach, with zero violations. Run with reduced
 * motion, so every reveal is at rest and contrast is measured on the
 * finished page, not mid fade.
 */

test.use({ reducedMotion: "reduce" });

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/*
 * Known violations that may not be fixed yet (inside a protected design,
 * awaiting Maninder's approval), each with its page, its element and the
 * proposed fix. Nothing else is excused. An exception that no longer occurs
 * fails the check below, so this list cannot outlive its reason.
 *
 * Empty since 12 Nov 2026: the Journal's month link and the Shop's
 * "House of Singh × you" line were the two, both fixed with his approval.
 */
type Known = { rule: string; path: string; target: string; why: string };
const KNOWN: Known[] = [];

type Violation = { id: string; impact: string; help: string; nodes: { target: string[]; failureSummary?: string }[] };
/**
 * axe, run inside the page on the site's own markup. A third party player
 * (Spotify on Home) is not checked inside, which is not ours to change;
 * that each frame has a title is checked on every page below.
 */
const builder = (page: Page) => ({
  analyze: async (): Promise<{ violations: Violation[] }> => {
    if (!(await page.evaluate(() => "axe" in window))) await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    return page.evaluate(
      (tags) =>
        (window as unknown as { axe: { run: (c: object, o: object) => Promise<{ violations: Violation[] }> } }).axe.run(
          { exclude: [["iframe[src*='spotify.com']"]] },
          { runOnly: { type: "tag", values: tags }, iframes: false, resultTypes: ["violations"] },
        ),
      TAGS,
    );
  },
});

/** Every finite animation (the fades in) at rest, so colours are measured as finished. */
async function atRest(page: Page) {
  // Twice, a moment apart: a fade that starts just after a state appears is caught too.
  for (let pass = 0; pass < 2; pass++) {
    await page.waitForTimeout(250);
    await page
      .waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity), null, { timeout: 6000 })
      .catch(() => {});
  }
}

async function axe(page: Page, label: string) {
  await atRest(page);
  const { violations } = await builder(page).analyze();
  const found = violations.flatMap((v) =>
    v.nodes
      .filter((n) => !KNOWN.some((k) => k.rule === v.id && n.target.join(" ").includes(k.target)))
      .map((n) => `${v.id} (${v.impact}): ${v.help}\n    ${n.target.join(" ")}\n    ${n.failureSummary?.split("\n").slice(1, 2).join(" ").trim()}`),
  );
  expect(found, `${label}: axe violations`).toEqual([]);
}

async function answer(page: Page, path: string, status: number, body: object = {}) {
  await page.route(`**${path}`, (r) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }));
}

/**
 * Every frame added at any time (the Spotify player is built after the
 * page loads) must have its title by the next moment, not only when axe
 * happens to look (found in Firefox, 12 Nov).
 */
const watchFrames = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __untitledFrames: string[] };
    w.__untitledFrames = [];
    const seen = new WeakSet<Element>();
    new MutationObserver(() =>
      document.querySelectorAll("iframe").forEach((f) => {
        if (seen.has(f)) return;
        seen.add(f);
        setTimeout(() => {
          if (!f.title) w.__untitledFrames.push(f.src || "(no address)");
        }, 0);
      }),
    ).observe(document, { childList: true, subtree: true });
  });

for (const p of PAGES) {
  test(`page: ${p.name}`, async ({ page }) => {
    await watchFrames(page);
    await open(page, p.path);
    await readThrough(page);
    await page.waitForTimeout(400);
    await axe(page, p.path);
    for (const frame of await page.locator("iframe").all()) expect(await frame.getAttribute("title"), "every frame has a title").toBeTruthy();
    expect(await page.evaluate(() => (window as unknown as { __untitledFrames: string[] }).__untitledFrames), "no frame, even one added later, is ever without a title").toEqual([]);
  });
}

test("state: the menu open", async ({ page }) => {
  await open(page, "/about");
  await header(page).locator("button[aria-label='Open menu']").click();
  await expect(page.locator("nav[aria-label='Site menu']")).toBeVisible();
  await page.waitForTimeout(900);
  await axe(page, "menu open");
});

test("state: the newsletter note, open and with its error", async ({ page }) => {
  await open(page, "/about");
  await header(page).locator("button[aria-label='Open menu']").click();
  await page.locator("button.menu-small:visible").filter({ hasText: /newsletter/i }).click();
  const field = page.locator("input[type=email]:focus");
  await expect(field).toBeVisible();
  await page.waitForTimeout(600);
  await axe(page, "newsletter note");
  await field.fill("not-an-email");
  await field.press("Enter");
  await expect(page.locator("#newsletter-error")).toBeVisible();
  await axe(page, "newsletter note, error");
});

test("state: the footer newsletter, error and thank you", async ({ page }) => {
  await open(page, "/about");
  const form = page.locator("footer form.footer-nl-form").first();
  await form.scrollIntoViewIfNeeded();
  await form.locator("input[type=email]").fill("not-an-email");
  await form.locator("button[type=submit]").click();
  await expect(page.locator("footer [role=alert]").first()).toBeVisible();
  await axe(page, "footer newsletter, error");
  await answer(page, "/api/newsletter", 200);
  await form.locator("input[type=email]").fill("reader@example.com");
  await form.locator("button[type=submit]").click();
  await expect(page.locator("footer .footer-postmark").first()).toBeVisible();
  await axe(page, "footer newsletter, thank you");
});

test("state: every step of the contact form, its review, its error and its thank you", async ({ page }) => {
  await open(page, "/contact");
  await axe(page, "contact, first step");
  await page.locator(".contact-intent-option").first().click();
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(400);
    if (await page.locator("main button:visible", { hasText: /^(submit|send)/i }).count()) break;
    await axe(page, `contact, step ${i + 2}`);
    const skip = page.locator("main button:visible", { hasText: /^skip/i }).first();
    if (await skip.count()) {
      await skip.click();
      continue;
    }
    const field = page.locator("main input:visible:not([name=company]), main textarea:visible").first();
    if ((await field.count()) && (await field.getAttribute("type")) === "email") {
      // The email step's own message.
      await field.fill("not-an-email");
      await page.locator("main button:visible", { hasText: /^(next|review)/i }).first().click();
      await expect(page.locator("main [role=alert]")).toBeVisible();
      await axe(page, "contact, email not valid");
    }
    if (await field.count()) await field.fill((await field.getAttribute("type")) === "email" ? "reader@example.com" : "A few words");
    else await page.locator("main [aria-pressed], main [role=radio], main button.contact-option, main .contact-chip").first().click();
    await page.locator("main button:visible", { hasText: /^(next|review)/i }).first().click();
  }
  await axe(page, "contact, review");
  await answer(page, "/api/contact", 400, { error: "Please provide a valid email address." });
  await page.locator("main button:visible", { hasText: /^(submit|send)/i }).first().click();
  await expect(page.locator("main")).toContainText("Please provide a valid email address.");
  await axe(page, "contact, refused");
  await page.unroute("**/api/contact");
  await answer(page, "/api/contact", 200);
  await page.locator("main button:visible", { hasText: /^(submit|send)/i }).first().click();
  await expect(page.locator(".contact-input")).toHaveCount(0);
  await axe(page, "contact, thank you");
});

test("state: Notify me, error and thank you", async ({ page }) => {
  test.skip(SHOP !== "anticipation", "the sealed Shop is the live site's");
  await open(page, "/editions");
  const form = page.locator("#notify form");
  await form.scrollIntoViewIfNeeded();
  await form.locator("input[type=email]").fill("not-an-email");
  await form.locator("button[type=submit]").click();
  await expect(page.locator("#notify [role=alert]")).toBeVisible();
  await axe(page, "notify, error");
  await answer(page, "/api/editions/notify", 200);
  await form.locator("input[type=email]").fill("reader@example.com");
  await form.locator("button[type=submit]").click();
  await expect(page.locator("#notify .footer-postmark")).toBeVisible();
  await axe(page, "notify, thank you");
});

test("state: the artists' proposal, refused and sent", async ({ page }) => {
  await open(page, "/editions/artists");
  const form = page.locator("form.ed-proposal");
  for (const [name, value] of [["name", "A Reader"], ["email", "reader@example.com"], ["practice", "Ceramics"], ["link", "https://example.com"]]) {
    const f = form.locator(`input[name=${name}]`);
    if (await f.count()) await f.fill(value);
  }
  await form.locator("textarea[name=idea]").fill("A small run of prints.");
  await answer(page, "/api/editions/proposal", 400, { error: "Mocked: try again later." });
  await form.getByRole("button", { name: /send/i }).click();
  await expect(page.locator("#ed-proposal-error")).toBeVisible();
  await axe(page, "proposal, refused");
  await page.unroute("**/api/editions/proposal");
  await answer(page, "/api/editions/proposal", 200);
  await form.getByRole("button", { name: /send/i }).click();
  await expect(page.locator(".ed-proposal[role=status]")).toBeVisible();
  await axe(page, "proposal, sent");
});

test("state: unsubscribed", async ({ page }) => {
  await open(page, "/unsubscribe?done=1");
  await axe(page, "unsubscribed");
});

test("state: Projects at a glance", async ({ page }) => {
  await open(page, "/projects");
  const words = page.locator("button[data-v='glance']");
  if (await words.isVisible()) await words.click();
  else await page.locator("button.mono-icon").click();
  await page.waitForTimeout(800);
  await axe(page, "projects, at a glance");
});

// Each known exception still occurs; once fixed, it must leave KNOWN.
test("the known exceptions are still real", async ({ page }, info) => {
  test.skip(!KNOWN.length, "no known exceptions");
  test.skip(info.project.name !== "desktop", "measured on the desktop");
  for (const k of KNOWN) {
    await open(page, k.path);
    await atRest(page);
    const { violations } = await builder(page).analyze();
    const still = violations.some((v) => v.id === k.rule && v.nodes.some((n) => n.target.join(" ").includes(k.target)));
    expect(still, `${k.target} on ${k.path} is fixed: remove it from KNOWN in a11y.spec.ts`).toBe(true);
  }
});
