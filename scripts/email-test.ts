/**
 * Checks for the email rules, in memory (no Kit, Resend or Sanity):
 * the daily limit and its reserve for order emails, the queue's order,
 * the next day's sending, and sign ups kept when Kit cannot be reached.
 *
 *   npx tsx scripts/email-test.ts
 */
import { deliver, drain, dayOf, type OutboxStore, type Queued } from "../src/lib/email/outbox";
import { signUp, retryPending, type PendingStore, type PendingSignup } from "../src/lib/email/signups";
import type { Email } from "../src/lib/email/resend";
import { welcomeEmail, orderEmail } from "../src/lib/email/templates";
import { consentRecord, CONSENT } from "../src/lib/email/consent";

let failures = 0;
function check(ok: boolean, label: string, detail?: unknown) {
  console.log(`${ok ? "pass" : "FAIL"}  ${label}${detail !== undefined ? `  (${JSON.stringify(detail)})` : ""}`);
  if (!ok) failures++;
}

process.env.RESEND_DAILY_LIMIT = "100";
process.env.RESEND_SIGNUP_RESERVE = "10";

function memoryOutbox() {
  const counts = new Map<string, number>();
  const queue: Queued[] = [];
  const store: OutboxStore = {
    async claim(day, max) {
      const n = counts.get(day) ?? 0;
      if (n >= max) return false;
      counts.set(day, n + 1);
      return true;
    },
    async queue(item) { queue.push(item); },
    async waiting(limit) { return [...queue].sort((a, b) => a.priority - b.priority || a.createdAt.localeCompare(b.createdAt)).slice(0, limit); },
    async remove(id) { const i = queue.findIndex((q) => q._id === id); if (i > -1) queue.splice(i, 1); },
  };
  return { store, counts, queue };
}

const signup = (n: number): Email => ({ ...welcomeEmail(`reader${n}@example.com`) });
const order = (n: number): Email => orderEmail(`buyer${n}@example.com`, { pieceName: "Window Seat", price: 180, shipping: 18, tax: 25.74, total: 223.74, collectorNumber: n, orderRef: "TEST" });

(async () => {
  const sent: string[] = [];
  const send = async (e: Email) => { sent.push(e.to); return "id"; };
  const day1 = new Date("2027-04-20T15:00:00Z");
  const day2 = new Date("2027-04-21T00:05:00Z");
  const box = memoryOutbox();

  // 95 sign ups on one day: 90 go (100 less the reserve of 10), 5 wait.
  const r1: string[] = [];
  for (let i = 0; i < 95; i++) r1.push(await deliver(signup(i), box.store, send, new Date(day1.getTime() + i * 1000)));
  check(r1.filter((r) => r === "sent").length === 90 && r1.filter((r) => r === "queued").length === 5, "sign ups stop 10 short of the 100: 90 sent, 5 wait", [r1.filter((r) => r === "sent").length, box.queue.length]);

  // Order emails still go out that day, up to 100 in all.
  const r2: string[] = [];
  for (let i = 0; i < 12; i++) r2.push(await deliver(order(i), box.store, send, new Date(day1.getTime() + 100_000 + i * 1000)));
  check(r2.filter((r) => r === "sent").length === 10 && r2.filter((r) => r === "queued").length === 2, "order emails use the reserve: 10 more sent (100 that day), 2 wait", [r2.filter((r) => r === "sent").length, box.counts.get(dayOf(day1))]);
  check(box.counts.get(dayOf(day1)) === 100, "never more than 100 in a day", box.counts.get(dayOf(day1)));

  // Same day: the daily job sends nothing more.
  const same = await drain(box.store, send, new Date(day1.getTime() + 200_000));
  check(same.sent === 0 && box.queue.length === 7, "the same day, nothing more goes out", same);

  // Next day: order emails first, then the oldest sign ups; none dropped.
  sent.length = 0;
  const next = await drain(box.store, send, day2);
  check(next.sent === 7 && box.queue.length === 0, "the next day all 7 waiting emails go", next);
  check(sent.slice(0, 2).every((to) => to.startsWith("buyer")) && sent.slice(2).every((to) => to.startsWith("reader")), "order emails first, then sign ups", sent.map((s) => s.split("@")[0]));
  check(sent.slice(2).join() === ["reader90", "reader91", "reader92", "reader93", "reader94"].map((r) => `${r}@example.com`).join(), "sign ups oldest first", sent.slice(2).map((s) => s.split("@")[0]));

  // A send that fails is kept, not lost.
  const box2 = memoryOutbox();
  const failing = async () => { throw new Error("Resend unreachable"); };
  const res = await deliver(order(1), box2.store, failing, day1);
  check(res === "queued" && box2.queue.length === 1, "an email that fails to send waits for the next day", res);

  // Sign ups: Kit down, kept privately; next day, moved to Kit and deleted.
  const kept: PendingSignup[] = [];
  const pending: PendingStore = {
    async keep(p) { kept.push(p); },
    async list() { return [...kept]; },
    async update(id, f) { Object.assign(kept.find((k) => k._id === id)!, f); },
    async remove(id) { kept.splice(kept.findIndex((k) => k._id === id), 1); },
  };
  const kit: { email: string; tag: string }[] = [];
  let kitUp = false;
  const subscribe = async (s: { email: string; tag: string }) => { if (!kitUp) throw new Error("Kit unreachable"); kit.push({ email: s.email, tag: s.tag }); };
  const s1 = await signUp({ email: "a@example.com", tag: "Letters", kind: "letters", consent: consentRecord("letters", "the newsletter form") }, pending, subscribe);
  const s2 = await signUp({ email: "a@example.com", tag: "Collection 01", kind: "shop", consent: consentRecord("shop", "Notify me") }, pending, subscribe);
  check(s1 === "kept" && s2 === "kept" && kept.length === 2 && kit.length === 0, "Kit unreachable: both sign ups kept privately", kept.length);
  check(kept[0].consent.startsWith(CONSENT.letters) && /Agreed on the newsletter form, \d{4}-/.test(kept[0].consent), "the consent kept is the words shown, where and when", kept[0].consent.slice(-50));
  const retry1 = await retryPending(pending, subscribe);
  check(retry1.moved === 0 && kept[0].attempts === 2, "still down: kept, tries counted", retry1);
  kitUp = true;
  const retry2 = await retryPending(pending, subscribe);
  check(retry2.moved === 2 && kept.length === 0 && kit.length === 2, "Kit back: both moved to Kit, private copies deleted", retry2);
  check(kit.map((k) => k.tag).join() === "Letters,Collection 01", "one person, both tags", kit.map((k) => k.tag));
  const s3 = await signUp({ email: "b@example.com", tag: "Letters", kind: "letters", consent: "x" }, pending, subscribe);
  check(s3 === "kit" && kept.length === 0, "Kit up: straight to Kit, nothing kept", s3);

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exit(failures ? 1 : 0);
})();
