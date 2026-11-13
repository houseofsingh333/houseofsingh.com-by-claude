import { defineField } from "sanity";
import { KIND_LABEL, KINDS, type MessageKind } from "@/lib/inbox/kinds";

/**
 * The Inbox fields every message carries (contact, project interest, For
 * artists; approved 13 Nov): its type, the Replied (or Reviewed) tick,
 * Archived, Notes, and whether Maninder was emailed. The messages stay
 * private (ids under "private."), and the ticks save as they are clicked
 * (liveEdit on each type), with no Publish step.
 */
export function inboxFields(tick: "Replied" | "Reviewed") {
  return [
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: { list: KINDS.map((k) => ({ title: KIND_LABEL[k], value: k })) },
      description: "Set by the site from the form; change it if it was sent under the wrong one.",
    }),
    defineField({
      name: "replied",
      title: tick,
      type: "boolean",
      initialValue: false,
      description:
        tick === "Replied"
          ? "Tick once you have answered. Until then it stays under New and in the daily email."
          : "Tick once you have read and considered it. Only proposals that fit a coming Collection get a reply.",
    }),
    defineField({ name: "archived", title: "Archived", type: "boolean", initialValue: false, description: "Out of New and the daily email, kept for the record." }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 4, description: "Your own notes. Never sent to anyone." }),
    defineField({
      name: "notified",
      title: "Emailed to you",
      type: "string",
      readOnly: true,
      description: "sent: in your inbox. queued: waiting to be sent again (it will be). failed or skipped: read it here.",
    }),
    defineField({ name: "notifiedAt", title: "Emailed at", type: "datetime", readOnly: true }),
  ];
}

const dateIn = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "";

/** Each row in the Inbox: the name, then the type and the date (and its state). */
export function inboxPreview(fallbackKind: MessageKind) {
  return {
    select: { name: "name", kind: "kind", submittedAt: "submittedAt", replied: "replied", archived: "archived" },
    prepare: ({ name, kind, submittedAt, replied, archived }: { name?: string; kind?: MessageKind; submittedAt?: string; replied?: boolean; archived?: boolean }) => ({
      title: name || "No name",
      subtitle: [KIND_LABEL[kind ?? fallbackKind], dateIn(submittedAt), archived ? "Archived" : replied ? "Done" : "New"].filter(Boolean).join(" · "),
    }),
  };
}
