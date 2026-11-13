import { createHmac } from "node:crypto";
import type { Page, Route } from "@playwright/test";
import { test, expect, open, header, LOCAL, SHOP } from "./helpers";

/*
 * The journeys a reader takes, on a phone and on a desktop.
 *
 * No form here ever reaches Kit, Resend or the inbox: every request a form
 * sends is answered inside the browser by the test itself (page.route), as
 * success or as failure, so each state the reader can see is checked.
 */

const EMAIL_HINT = "Please enter a full email address, for example name@example.com.";

/** Answers a form's request inside the browser. Returns what was sent. */
async function answer(page: Page, path: string, status: number, body: object = {}) {
  const sent: unknown[] = [];
  await page.route(`**${path}`, (route: Route) => {
    sent.push(route.request().postDataJSON?.() ?? route.request().postData());
    return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return sent;
}

/** A page opens with its heading, and without a script error. */
async function opens(page: Page, path: string, heading: RegExp, errors: { console: string[]; page: string[] }) {
  const res = await open(page, path);
  expect(res?.status(), `${path} answers`).toBe(200);
  await expect(page.locator("h1").first()).toContainText(heading);
  await expect(page.locator("main")).toBeVisible();
  expect(errors.page, `${path}: script errors`).toEqual([]);
  expect(errors.console, `${path}: console errors`).toEqual([]);
}

test.describe("pages", () => {
  test("home", async ({ page, errors }) => {
    await opens(page, "/", /House of Singh/, errors);
    // Its chapters, each opening with its numeral.
    expect(await page.locator("main [id^='chapter-']").count()).toBeGreaterThanOrEqual(3);
  });
  test("about", async ({ page, errors }) => {
    await opens(page, "/about", /About/, errors);
  });
  test("projects", async ({ page, errors }) => {
    await opens(page, "/projects", /Projects|.+/, errors);
    expect(await page.locator(".mono-card, .mono-slide").count()).toBeGreaterThan(0);
  });
  test("a project", async ({ page, errors }) => {
    await opens(page, "/projects/zamana", /Zamana/i, errors);
  });
  test("journal", async ({ page, errors }) => {
    await opens(page, "/journal", /.+/, errors);
  });
  test("an entry", async ({ page, errors }) => {
    await opens(page, "/journal/the-saddle", /.+/, errors);
    await expect(page.locator("#entry-the-saddle")).toBeVisible();
  });
  test("a month", async ({ page, errors }) => {
    await opens(page, "/journal/archive/2024/11", /.+/, errors);
  });
  test("the page that does not exist", async ({ page }) => {
    const res = await open(page, "/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1").first()).toBeVisible();
    // A way back into the site.
    await expect(page.locator("main a[href='/']").first()).toBeVisible();
  });
});

test.describe("menu", () => {
  test("opens, holds focus, closes with Escape, and returns focus", async ({ page }) => {
    await open(page, "/about");
    const button = header(page).locator("button[aria-label='Open menu']");
    await button.click();
    const nav = page.locator("nav[aria-label='Site menu']");
    await expect(nav).toBeVisible();
    for (const href of ["/", "/about", "/projects", "/journal", "/contact"]) await expect(nav.locator(`a[href='${href}']`).first()).toBeVisible();
    // Keyboard focus stays inside the open menu and reaches every page
    // link, with Tab, Safari's Option+Tab (Alt+Tab) and Shift+Tab alike:
    // Safari's own Tab skips links, so the menu moves focus itself.
    const where = () =>
      page.evaluate(() => {
        const el = document.activeElement;
        return { inside: !!el?.closest("nav[aria-label='Site menu'], [role=dialog], [aria-modal=true]"), href: el?.getAttribute("href") ?? null };
      });
    for (const key of ["Tab", "Alt+Tab", "Shift+Tab"]) {
      const reached = new Set<string>();
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press(key);
        const at = await where();
        expect(at.inside, `${key} ${i + 1} stays in the menu`).toBe(true);
        if (at.href) reached.add(at.href);
      }
      for (const href of ["/", "/about", "/projects", "/journal", "/contact"]) expect(reached.has(href), `${key} reaches ${href}`).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("a page name opens that page", async ({ page }) => {
    await open(page, "/");
    await header(page).locator("button[aria-label='Open menu']").click();
    await page.locator("nav[aria-label='Site menu'] a[href='/projects']").first().click();
    await page.waitForURL("**/projects");
    await expect(page.locator("nav[aria-label='Site menu']")).toBeHidden();
  });
});

test.describe("contact form", () => {
  async function toReview(page: Page) {
    await open(page, "/contact");
    await page.locator(".contact-intent-option").first().click();
    // Each step: Next waits until the answer is given; skippable steps are skipped.
    for (let i = 0; i < 12; i++) {
      if (await page.locator("main button:visible", { hasText: /^(submit|send)/i }).count()) return;
      const next = page.locator("main button:visible", { hasText: /^(next|review)/i }).first();
      const skip = page.locator("main button:visible", { hasText: /^skip/i }).first();
      if (await skip.count()) {
        await skip.click();
        continue;
      }
      await expect(next, "Next waits for an answer").toBeDisabled();
      const field = page.locator("main input:visible:not([name=company]), main textarea:visible").first();
      if (await field.count()) {
        const type = await field.getAttribute("type");
        if (type === "email") {
          // Not an email: the site's own message, said at once, and the step waits.
          const question = await page.locator("main h2").first().textContent();
          await field.fill("not-an-email");
          await next.click();
          await expect(page.locator("main [role=alert]")).toHaveText(EMAIL_HINT);
          await expect(field).toHaveAttribute("aria-invalid", "true");
          await expect(field).toBeFocused();
          await expect(page.locator("main h2").first()).toHaveText(question!);
        }
        await field.fill(type === "email" ? "reader@example.com" : "A few words");
        // Typing again clears the message.
        if (type === "email") await expect(page.locator("main [role=alert]")).toHaveCount(0);
      } else {
        // A choice (the budget): the first one.
        await page.locator("main [aria-pressed], main [role=radio], main button.contact-option, main .contact-chip").first().click();
      }
      await expect(next).toBeEnabled();
      await next.click();
    }
  }

  test("empty steps wait, then review and send", async ({ page }) => {
    const sent = await answer(page, "/api/contact", 200);
    await toReview(page);
    await expect(page.locator("main")).toContainText("reader@example.com");
    await page.locator("main button:visible", { hasText: /^(submit|send)/i }).first().click();
    await expect.poll(() => sent.length).toBe(1);
    // The thank you replaces the form.
    await expect(page.locator("main button:visible", { hasText: /^(submit|send)/i })).toHaveCount(0);
    await expect(page.locator(".contact-input")).toHaveCount(0);
  });

  test("a refused send says why and keeps the answers", async ({ page }) => {
    await answer(page, "/api/contact", 400, { error: "Please provide a valid email address." });
    await toReview(page);
    const send = page.locator("main button:visible", { hasText: /^(submit|send)/i }).first();
    await send.click();
    await expect(page.locator("main")).toContainText("Please provide a valid email address.");
    await expect(send).toBeVisible();
    await expect(page.locator("main")).toContainText("reader@example.com");
  });
});

/** The footer's newsletter line and Notify me share one form; each state is checked. */
async function emailLine(page: Page, form: ReturnType<Page["locator"]>, endpoint: string) {
  const input = form.locator("input[type=email]");
  const submit = form.locator("button[type=submit]");
  await form.scrollIntoViewIfNeeded();

  // Not an email: the site's own hint, said aloud, and nothing is sent.
  const sent = await answer(page, endpoint, 500, { error: "Mocked: the service did not answer." });
  await input.fill("not-an-email");
  await submit.click();
  const alert = page.locator(`#${await input.getAttribute("aria-describedby")}`);
  await expect(alert).toHaveText(EMAIL_HINT);
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  expect(sent).toHaveLength(0);

  // The service fails: its words are shown, and the reader can try again.
  await input.fill("reader@example.com");
  await submit.click();
  await expect(alert).toHaveText("Mocked: the service did not answer.");
  expect(sent).toHaveLength(1);

  // It goes through: the postmark and the thank you.
  await page.unroute(`**${endpoint}`);
  await answer(page, endpoint, 200);
  await submit.click();
  await expect(form.locator("xpath=..").locator(".footer-postmark")).toBeVisible();
  await expect(page.locator("p[role=status]").filter({ hasText: /\S/ }).first()).toBeVisible();
}

test.describe("newsletter", () => {
  test("the footer line: invalid, refused, then signed up", async ({ page }) => {
    await open(page, "/about");
    await emailLine(page, page.locator("footer form.footer-nl-form").first(), "/api/newsletter");
  });

  test("the note from the menu: opens on the email field, signs up, closes itself", async ({ page }) => {
    await answer(page, "/api/newsletter", 200);
    await open(page, "/about");
    await header(page).locator("button[aria-label='Open menu']").click();
    // In the menu's foot, beside Instagram.
    await page.locator("button.menu-small:visible").filter({ hasText: /newsletter/i }).click();
    const field = page.locator("input[type=email]:focus");
    await expect(field).toBeVisible();
    await field.fill("not-an-email");
    await field.press("Enter");
    await expect(page.locator("#newsletter-error")).toHaveText(EMAIL_HINT);
    await field.fill("reader@example.com");
    await field.press("Enter");
    // The thank you holds, then the note closes itself.
    await expect(page.locator("#newsletter-error")).toHaveCount(0);
    await expect(field).toBeHidden({ timeout: 6000 });
  });
});

test.describe("the Shop", () => {
  test.skip(SHOP !== "anticipation", "the sealed Shop is the live site's; the preview shows the full Shop");

  test("sealed: the Collection's card, Notify me, no prices, no Buy", async ({ page, errors }) => {
    await opens(page, "/editions", /Collection/, errors);
    await expect(page.locator("#notify form")).toBeVisible();
    const words = await page.locator("main").innerText();
    expect(words, "no price shows").not.toMatch(/\$\s?\d/);
    await expect(page.locator("main").getByRole("button", { name: /^buy/i })).toHaveCount(0);
    for (const id of ["how", "before-you-buy", "questions", "for-artists"]) await expect(page.locator(`#${id}`)).toBeAttached();
  });

  test("sealed: the archive and pieces are closed", async ({ page }) => {
    for (const path of ["/editions/archive", "/editions/a-piece-that-is-not-out"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
    }
  });

  test("Notify me: invalid, refused, then on the list", async ({ page }) => {
    await open(page, "/editions");
    await emailLine(page, page.locator("#notify form"), "/api/editions/notify");
  });

  test("the footer links to the Shop, the menu does not", async ({ page }) => {
    await open(page, "/about");
    await expect(page.locator("footer a[href='/editions']").first()).toBeAttached();
    await header(page).locator("button[aria-label='Open menu']").click();
    await expect(page.locator("nav[aria-label='Site menu'] a[href='/editions']")).toHaveCount(0);
  });
});

test.describe("the Shop, full (preview)", () => {
  test.skip(SHOP !== "full", "the full Shop shows on the preview only");
  test("opens", async ({ page, errors }) => {
    await opens(page, "/editions", /.+/, errors);
  });
});

test.describe("For artists", () => {
  test("the proposal: empty fields stop it, a refusal says why, then it is sent", async ({ page, errors }) => {
    await opens(page, "/editions/artists", /Make something/, errors);
    const form = page.locator("form.ed-proposal");
    const sent = await answer(page, "/api/editions/proposal", 400, { error: "Mocked: try again later." });
    await form.getByRole("button", { name: /send/i }).click();
    // The browser holds an empty required field.
    expect(await form.locator("input[name=name]").evaluate((i: HTMLInputElement) => i.validity.valueMissing)).toBe(true);
    expect(sent).toHaveLength(0);

    await form.locator("input[name=name]").fill("A Reader");
    await form.locator("input[name=email]").fill("reader@example.com");
    for (const name of ["practice", "link"]) {
      const f = form.locator(`input[name=${name}]`);
      if (await f.evaluate((i: HTMLInputElement) => i.required)) await f.fill(name === "link" ? "https://example.com" : "Ceramics");
    }
    await form.locator("textarea[name=idea]").fill("A small run of prints.");
    await form.getByRole("button", { name: /send/i }).click();
    await expect(page.locator("#ed-proposal-error")).toHaveText("Mocked: try again later.");

    await page.unroute("**/api/editions/proposal");
    await answer(page, "/api/editions/proposal", 200);
    await form.getByRole("button", { name: /send/i }).click();
    await expect(page.locator(".ed-proposal[role=status]")).toBeVisible();
  });

  test("the terms of sale open", async ({ page, errors }) => {
    await opens(page, "/editions/terms", /.+/, errors);
  });
});

test.describe("unsubscribe", () => {
  test("a link without its signature is not valid", async ({ page }) => {
    await open(page, "/unsubscribe");
    await expect(page.locator("h1")).toHaveText("This link is not valid.");
    await open(page, "/unsubscribe?t=bm90LWEtdG9rZW4.forged");
    await expect(page.locator("h1")).toHaveText("This link is not valid.");
  });

  test("after leaving the list", async ({ page }) => {
    await open(page, "/unsubscribe?done=1");
    await expect(page.locator("h1")).toHaveText("You are unsubscribed.");
  });

  test("a genuine link asks once, then unsubscribes", async ({ page }) => {
    // Only the local server's signing value is known to the test.
    test.skip(!LOCAL, "needs the server's signing value");
    const email = "reader@example.com";
    const mac = createHmac("sha256", "local-test-only-link-secret").update(`unsubscribe:${email}`).digest("base64url").slice(0, 32);
    await open(page, `/unsubscribe?t=${Buffer.from(email).toString("base64url")}.${mac}`);
    await expect(page.locator("main")).toContainText("r•••@example.com");
    // The button posts to the server, which would reach Kit: answered here instead.
    // (The real answer is a 303 to /unsubscribe?done=1; WebKit cannot be
    // handed a redirect here, so the stand in moves on itself, as a 303
    // would. That the button posts the signed link is checked too.)
    let posted = "";
    await page.route("**/api/email/unsubscribe", (route) => {
      posted = route.request().postData() ?? "";
      return route.fulfill({ status: 200, contentType: "text/html", body: '<!doctype html><meta http-equiv="refresh" content="0;url=/unsubscribe?done=1">' });
    });
    await page.getByRole("button", { name: "Unsubscribe" }).click();
    await page.waitForURL("**/unsubscribe?done=1");
    await expect(page.locator("h1")).toHaveText("You are unsubscribed.");
    expect(posted, "the button posts the signed link").toContain(mac);
  });
});

test.describe("photographs further down a page", () => {
  test("wait until near, then all arrive as the reader goes down", async ({ page }) => {
    let loaded = false;
    page.on("load", () => (loaded = true));
    const early: string[] = [];
    page.on("request", (r) => {
      if (!loaded && r.resourceType() === "image" && /cdn\.sanity\.io/.test(r.url()) && !/[?&]w=(16|32|48|64|96)\b/.test(r.url())) early.push(r.url());
    });
    await open(page, "/projects/zamana");
    // Before the page had loaded: the photographs on screen only (the
    // opening photograph and at most the next, not the gallery below).
    expect(early.length, `photographs requested before the page loaded: ${early.length}`).toBeLessThanOrEqual(2);
    // On a phone the gallery is further than a screen and a half: it waits.
    // (On a desktop the whole page is near once it has loaded.)
    if (test.info().project.name === "phone") {
      expect(await page.locator("img[data-src]:not([src])").count(), "photographs further down are waiting").toBeGreaterThan(0);
    }
    // Every waiting photograph keeps its preview until its own photograph is in.
    expect(await page.locator("img[data-src]:not([src])[data-loaded]").count()).toBe(0);
    // Read down the page: each one arrives, and its preview dissolves.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    await expect
      .poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLImageElement>("img[data-src]")].filter((i) => i.offsetParent && i.getBoundingClientRect().left < innerWidth && !(i.complete && i.naturalWidth && i.hasAttribute("data-loaded"))).length), { timeout: 15_000 })
      .toBe(0);
  });
});
