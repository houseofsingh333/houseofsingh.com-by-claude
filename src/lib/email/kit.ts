import { emailConfig } from "./config";

/**
 * Kit (kit.com, API v4): the list of people. The website only adds people
 * and tags them; Kit sends the letters Maninder writes, to a tag.
 *
 * - The footer newsletter tags "Letters"; Notify me tags the Collection
 *   ("Collection 01"). One person can carry both.
 * - The consent each person gave is kept on them in Kit, in a custom field
 *   per kind ("Consent, letters" and "Consent, Shop"): the words shown
 *   beneath the field, where, and when.
 *
 * Plain fetch, no package. Every call is in this file, so if Kit's API
 * differs from what is written here, this is the one place to change
 * (docs/email.md, "Checking Kit").
 */

export type ConsentKind = "letters" | "shop";

const FIELD_LABELS: Record<ConsentKind, string> = { letters: "Consent, letters", shop: "Consent, Shop" };

class KitError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function kit<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const { kitKey, kitBase } = emailConfig();
  if (!kitKey) throw new KitError("KIT_API_KEY is not set", 0);
  const res = await fetch(`${kitBase}/v4${path}`, {
    method,
    headers: { "X-Kit-Api-Key": kitKey, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json().catch(() => ({}))) as T & { errors?: string[] };
  if (!res.ok) throw new KitError((data.errors ?? [`Kit answered ${res.status}`]).join("; "), res.status);
  return data;
}

type Tag = { id: number; name: string };
type CustomField = { id: number; key: string; label: string };

let tagCache: Map<string, number> | null = null;
let fieldCache: Map<string, string> | null = null;

/** The tag's id, creating the tag the first time it is used. */
async function tagId(name: string): Promise<number> {
  if (!tagCache) {
    tagCache = new Map();
    let after: string | null = null;
    for (let page = 0; page < 20; page++) {
      const q: string = `/tags?per_page=1000${after ? `&after=${encodeURIComponent(after)}` : ""}`;
      const data = await kit<{ tags: Tag[]; pagination?: { has_next_page?: boolean; end_cursor?: string | null } }>("GET", q);
      for (const t of data.tags ?? []) tagCache.set(t.name.toLowerCase(), t.id);
      if (!data.pagination?.has_next_page || !data.pagination.end_cursor) break;
      after = data.pagination.end_cursor;
    }
  }
  const known = tagCache.get(name.toLowerCase());
  if (known) return known;
  const created = await kit<{ tag: Tag }>("POST", "/tags", { name });
  tagCache.set(name.toLowerCase(), created.tag.id);
  return created.tag.id;
}

/** The custom field's key for a kind of consent, creating it the first time. */
async function consentKey(kind: ConsentKind): Promise<string> {
  const label = FIELD_LABELS[kind];
  if (!fieldCache) {
    fieldCache = new Map();
    const data = await kit<{ custom_fields: CustomField[] }>("GET", "/custom_fields?per_page=1000");
    for (const f of data.custom_fields ?? []) fieldCache.set(f.label, f.key);
  }
  const known = fieldCache.get(label);
  if (known) return known;
  const created = await kit<{ custom_field: CustomField }>("POST", "/custom_fields", { label });
  fieldCache.set(label, created.custom_field.key);
  return created.custom_field.key;
}

export type Signup = {
  email: string;
  /** "Letters", or a Collection's title. */
  tag: string;
  kind: ConsentKind;
  /** The consent as given: the words, the form, the moment. */
  consent: string;
};

/**
 * Adds (or updates) the person, records their consent and tags them.
 * Throws a KitError when Kit cannot be reached or refuses; the caller then
 * keeps the sign up privately and tries again later (lib/email/signups.ts).
 */
export async function kitSubscribe(s: Signup): Promise<void> {
  const key = await consentKey(s.kind);
  await kit("POST", "/subscribers", { email_address: s.email, state: "active", fields: { [key]: s.consent.slice(0, 1000) } });
  const id = await tagId(s.tag);
  await kit("POST", `/tags/${id}/subscribers`, { email_address: s.email });
}

/** For the import script: whether Kit has this person with this tag. */
export async function kitHasTag(email: string, tag: string): Promise<boolean> {
  const found = await kit<{ subscribers: { id: number; email_address: string }[] }>("GET", `/subscribers?email_address=${encodeURIComponent(email)}`);
  const person = found.subscribers?.find((x) => x.email_address.toLowerCase() === email.toLowerCase());
  if (!person) return false;
  const tags = await kit<{ tags: Tag[] }>("GET", `/subscribers/${person.id}/tags?per_page=1000`);
  return (tags.tags ?? []).some((t) => t.name.toLowerCase() === tag.toLowerCase());
}

/**
 * Unsubscribes the person in Kit (from every letter and Collection email).
 * Someone Kit does not know is already unsubscribed: nothing to do.
 */
export async function kitUnsubscribe(email: string): Promise<void> {
  const found = await kit<{ subscribers: { id: number; email_address: string }[] }>("GET", `/subscribers?email_address=${encodeURIComponent(email)}&status=all`);
  const person = found.subscribers?.find((x) => x.email_address.toLowerCase() === email.toLowerCase());
  if (!person) return;
  await kit("POST", `/subscribers/${person.id}/unsubscribe`, {});
}

