/**
 * Messages sent through the forms must never be missed (lib/inbox,
 * lib/email/outbox): every path, without Sanity or Resend.
 *
 *   npx tsx scripts/inbox-test.ts
 */
process.env.RESEND_DAILY_LIMIT = "100";
process.env.RESEND_SIGNUP_RESERVE = "10";
process.env.EMAIL_POSTAL_ADDRESS = "1 Test Street, Toronto";

import { deliver, retryNotices, isStuck, STUCK_AFTER, type OutboxStore, type Queued } from "../src/lib/email/outbox";
import type { Email } from "../src/lib/email/resend";
import { inboxDigestEmail, messageNoticeEmail, messageThanksEmail, proposalReceivedEmail, type InboxMessage } from "../src/lib/email/templates";
import { contactKind, safeName } from "../src/lib/inbox/kinds";
import { receive, type SendOutcome } from "../src/lib/inbox/receive";
import { kindOf, openMessages } from "../src/lib/inbox/daily";

let failures = 0;
function check(ok: boolean, what: string, detail?: unknown) {
  console.log(`${ok ? "pass" : "FAIL"}  ${what}${!ok && detail !== undefined ? `  (${JSON.stringify(detail).slice(0, 300)})` : ""}`);
  if (!ok) failures++;
}

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
    async bump(id) { const q = queue.find((x) => x._id === id); if (q) q.attempts = (q.attempts ?? 1) + 1; },
  };
  return { store, queue, counts };
}

/** Resend, as a stand in: fails the first `failFor` sends, records the rest. */
function fakeResend(failFor = 0) {
  const sent: Email[] = [];
  let calls = 0;
  const send = async (e: Email) => {
    calls++;
    if (calls <= failFor) throw new Error("Resend answered 500");
    sent.push(e);
    return `id-${calls}`;
  };
  return { send, sent, calls: () => calls };
}

const message: InboxMessage = {
  kind: "commercial",
  via: "Contact form: Commercial Project",
  name: "Asha Kaur",
  email: "asha@example.test",
  rows: [["Budget", "CA$10,000 to 25,000"], ["Timeline", "This spring"]],
  message: "We would like a series of portraits for our new studio, with a visit to https://example.test/brief for the details.",
  submittedAt: "2026-11-13T15:30:00Z",
};

(async () => {
  // ——— Types and names ———
  check(contactKind({ projectName: "Spring" }, "anything") === "commercial", "a contact with project answers is a Commercial project");
  check(contactKind({ collabType: "Photography" }, "") === "collaboration" && contactKind({ mediaOutlet: "Globe" }, "") === "press" && contactKind({ freeformMessage: "Hello" }, "Something Else") === "other", "collaboration, press, something else from their answers");
  check(contactKind({}, "Media / Feature") === "press" && contactKind({}, "Collaboration") === "collaboration", "the choice's words as the fallback (a renamed choice still finds its type)");
  check(safeName("Asha Kaur") === "Asha Kaur" && safeName("Jean-Paul O'Neil") === "Jean-Paul O'Neil", "a real name is kept");
  check(safeName("Win big at https://spam.test") === "" && safeName("visit www.spam.test") === "" && safeName("spam.com deals") === "" && safeName("me@x.test") === "", "a name holding a link or address is dropped");
  check(safeName("A B C D E") === "A B C" && safeName("x".repeat(80)).length === 40, "at most three words and 40 characters");

  // ——— The emails ———
  const notice = messageNoticeEmail("maninder@example.test", message);
  check(notice.to === "maninder@example.test" && notice.replyTo === "asha@example.test" && notice.priority === "notice" && notice.sender === "letters", "the notice: to Maninder, from his own address, highest priority, Reply-To the sender");
  check(/Commercial project: Asha Kaur/.test(notice.subject) && notice.text.includes(message.message!) && notice.text.includes("CA$10,000 to 25,000") && notice.text.includes("asha@example.test"), "the notice carries the whole message, the type, name and email", notice.subject);
  const thanks = messageThanksEmail("asha@example.test", "Asha Kaur");
  check(thanks.text.includes("Thank you, Asha Kaur. Your message is in.") && thanks.text.includes("I will reply within two working days."), "the confirmation, in the agreed words");
  check(!thanks.text.includes("portraits") && !thanks.text.includes("example.test/brief") && !thanks.html.includes("example.test/brief"), "the confirmation never repeats the message or a link they typed");
  const spamThanks = messageThanksEmail("victim@example.test", "Cheap pills at https://spam.test");
  check(spamThanks.text.includes("Thank you. Your message is in.") && !spamThanks.text.includes("spam.test") && !spamThanks.html.includes("spam.test"), "a name with a link: the greeting has no name, so the form cannot send a link");
  check(!/unsubscribe/i.test(thanks.text) && !thanks.headers, "the confirmation is transactional only (no list, no unsubscribe needed)");
  const proposalThanks = proposalReceivedEmail("artist@example.test", "Mira");
  check(proposalThanks.text.includes("Thank you, Mira. Your proposal is in.") && !/within two working days/.test(proposalThanks.text), "a proposal keeps its own wording and promises no reply");

  // ——— Every path: saved, emailed, confirmed ———
  {
    const box = memoryOutbox();
    const resend = fakeResend();
    const saved: string[] = [];
    const marks: string[] = [];
    const r = await receive({
      message,
      save: async () => { saved.push("private.contact-1"); return "private.contact-1"; },
      markNotified: async (_id, o) => { marks.push(o); },
      thanks,
      send: (e) => deliver(e, box.store, resend.send, new Date(), [0, 0]),
      notifyTo: "maninder@example.test",
    });
    check(r.ok && r.saved && r.notified === "sent" && r.thanked === "sent", "all well: saved, emailed to Maninder, confirmed to the sender", r);
    check(resend.sent[0]?.kind === "message" && resend.sent[1]?.kind === "message-thanks", "Maninder's email goes first, the confirmation after");
    check(saved.length === 1 && marks[0] === "sent", "saved first; the message records that it was emailed");
  }

  // ——— A Resend failure: tried three times on the spot ———
  {
    const box = memoryOutbox();
    const resend = fakeResend(2);
    const r = await receive({ message, save: async () => "private.contact-2", thanks, send: (e) => deliver(e, box.store, resend.send, new Date(), [0, 0]), notifyTo: "maninder@example.test" });
    check(r.notified === "sent" && resend.calls() >= 3 && box.queue.length === 0, "Resend fails twice: the third try on the spot sends it", { calls: resend.calls(), queued: box.queue.length });
  }

  // ——— Resend down: the notice waits, retried, then sent ———
  {
    const box = memoryOutbox();
    const down = fakeResend(1000);
    const t0 = new Date("2026-11-13T15:30:00Z");
    const r = await receive({ message, save: async () => "private.contact-3", thanks, send: (e) => deliver(e, box.store, down.send, t0, [0, 0]), notifyTo: "maninder@example.test" });
    const waiting = box.queue.find((q) => q.email.kind === "message");
    check(r.ok && r.notified === "queued" && waiting?.priority === 0 && waiting.attempts === 1, "Resend down: the visitor still sees success; the notice waits at the highest priority", r);
    check((await box.store.waiting(10))[0].email.kind === "message", "a waiting notice comes before every other waiting email");
    const up = fakeResend();
    const retry = await retryNotices(box.store, up.send, new Date(t0.getTime() + 15 * 60 * 1000));
    check(retry.sent === 1 && retry.waiting === 0 && retry.stuck === 0 && up.sent[0].kind === "message" && !box.queue.some((q) => q.email.kind === "message"), "fifteen minutes later the retry sends it", retry);
  }

  // ——— Still failing: stuck, the site watch's alert ———
  {
    const box = memoryOutbox();
    const down = fakeResend(1000);
    const t0 = new Date("2026-11-13T15:30:00Z");
    await deliver(messageNoticeEmail("maninder@example.test", message), box.store, down.send, t0, [0, 0]);
    let last = { sent: 0, waiting: 0, stuck: 0 };
    for (let i = 1; i < STUCK_AFTER; i++) last = await retryNotices(box.store, down.send, new Date(t0.getTime() + i * 15 * 60 * 1000));
    check(last.stuck === 1 && last.waiting === 1 && box.queue[0].attempts === STUCK_AFTER, `after ${STUCK_AFTER} failed attempts the notice is stuck (the alert opens)`, { last, attempts: box.queue[0].attempts });
    const once = await retryNotices(box.store, fakeResend().send, new Date(t0.getTime() + 2 * 60 * 60 * 1000));
    check(once.sent === 1 && once.stuck === 0 && box.queue.length === 0, "once Resend answers again it is sent, and nothing is stuck (the alert closes)", once);
    check(isStuck({ _id: "x", priority: 0, createdAt: "2026-11-13T10:00:00Z", email: {} as Email, attempts: 1 }, new Date("2026-11-13T12:30:00Z")), "a notice waiting more than two hours is stuck, however few its attempts");
    check(!isStuck({ _id: "y", priority: 1, createdAt: "2026-11-01T10:00:00Z", email: {} as Email, attempts: 9 }, new Date("2026-11-13T12:30:00Z")), "only messages to Maninder raise the alert (an order email waiting does not)");
  }

  // ——— Sanity down: the email alone carries it ———
  {
    const resend = fakeResend();
    const sends: SendOutcome[] = [];
    const r = await receive({
      message,
      save: async () => { throw new Error("Sanity is down"); },
      thanks,
      send: async (e) => { await resend.send(e); sends.push("sent"); return "sent"; },
      notifyTo: "maninder@example.test",
    });
    check(r.ok && !r.saved && r.notified === "sent" && r.thanked === "sent", "Sanity down but the email to Maninder went: the visitor sees success (the message is not lost)", r);
    const r2 = await receive({ message, save: async () => { throw new Error("Sanity is down"); }, thanks, send: async () => "failed", notifyTo: "maninder@example.test" });
    check(!r2.ok && r2.thanked === "none", "Sanity and Resend both down: the visitor is asked to send it again, and no confirmation goes", r2);
    const r3 = await receive({ message, save: async () => "private.contact-4", thanks, send: async () => "skipped", notifyTo: "maninder@example.test" });
    check(r3.ok && r3.saved, "Resend not set up: saved all the same (the daily list and the Studio still show it)", r3);
  }

  // ——— The daily list ———
  {
    let query = "";
    let params: Record<string, unknown> = {};
    const fakeClient = { fetch: async (q: string, p: Record<string, unknown>) => { query = q; params = p; return [
      { _id: "a", _type: "contactSubmission", name: "Asha Kaur", kind: "commercial", submittedAt: "2026-11-12T15:00:00Z" },
      { _id: "b", _type: "projectInterest", name: "Dev Singh", submittedAt: "2026-11-11T15:00:00Z" },
      { _id: "c", _type: "editionsProposal", name: "Mira", submittedAt: "2026-11-10T15:00:00Z" },
      { _id: "d", _type: "contactSubmission", name: "Old Message", intent: "Media / Feature", submittedAt: "2026-11-09T15:00:00Z" },
    ]; } };
    const open = await openMessages(fakeClient as never, new Date("2026-11-13T05:00:00Z"));
    check(/replied != true && archived != true/.test(query) && /submittedAt > \$since/.test(query) && params.since === "2026-11-06T05:00:00.000Z", "the daily list: the last seven days, not replied, not archived", { query, params });
    check((params.types as string[]).join() === "contactSubmission,projectInterest,editionsProposal", "all three: contact, project interest, For artists");
    check(open.map(kindOf).join() === "commercial,collaboration,artists,press", "each message's type, older ones included");
    const digest = inboxDigestEmail("maninder@example.test", open.map((m) => ({ name: m.name, kind: kindOf(m), submittedAt: m.submittedAt })));
    check(digest.subject === "4 messages waiting for a reply" && ["Asha Kaur", "Dev Singh", "Mira", "Old Message", "Shop artists", "Press"].every((w) => digest.text.includes(w)) && digest.priority === "notice", "the daily email lists each name, type and date", digest.subject);
    check(!digest.text.includes("portraits"), "the daily list names who, not what (the message itself stays in the Studio and the first email)");
  }

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exit(failures ? 1 : 0);
})();
