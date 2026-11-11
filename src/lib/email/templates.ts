import { emailConfig } from "./config";
import type { Email } from "./resend";
import { cad } from "@/lib/editions/format";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";
import { unsubscribeOneClickUrl, unsubscribePageUrl } from "./unsubscribe";

/**
 * The emails the website sends (through Resend), in the House of Singh
 * voice and design: plain and calm, the crest small at the top, Instrument
 * Sans for sentences (with fallbacks, since most mail apps show their own
 * fonts), Playfair for the names of pieces, the label style for labels,
 * the site's colours as fixed values (mail apps do not read the site's
 * tokens). Every email ends with who sent it, the mailing address and why
 * it arrived, as Canada's anti spam law asks. All the words are here, in
 * one place, so they are easy to change.
 */

const C = { canvas: "#F9F7F5", ink: "#1A1A1A", muted: "#76706B", hairline: "#E3DFD9" };
const SANS = "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Block =
  | { p: string; muted?: boolean }
  | { big: string }
  | { title: string }
  | { label: string }
  | { rows: [string, string][] }
  | { link: string; href: string }
  | { sign: string };

function render(blocks: Block[], footer: string): string {
  const { assetUrl } = emailConfig();
  const body = blocks
    .map((b) => {
      if ("big" in b) return `<p style="margin:0 0 20px;font-family:${SANS};font-size:22px;line-height:1.4;color:${C.ink}">${esc(b.big)}</p>`;
      if ("title" in b) return `<p style="margin:0 0 16px;font-family:${SERIF};font-weight:400;font-size:28px;line-height:1.2;color:${C.ink}">${esc(b.title)}</p>`;
      if ("label" in b) return `<p style="margin:28px 0 8px;font-family:${SANS};font-size:12px;line-height:1.5;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted}">${esc(b.label)}</p>`;
      if ("rows" in b)
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px;border-top:1px solid ${C.hairline}">${b.rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.hairline};font-family:${SANS};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted}">${esc(k)}</td><td align="right" style="padding:12px 0;border-bottom:1px solid ${C.hairline};font-family:${SANS};font-size:16px;color:${C.ink}">${esc(v)}</td></tr>`,
          )
          .join("")}</table>`;
      if ("link" in b)
        return `<p style="margin:8px 0 20px"><a href="${esc(b.href)}" style="font-family:${SANS};font-size:14px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:${C.ink};text-decoration:none;border-bottom:1px solid ${C.ink};padding-bottom:4px">${esc(b.link)} &rarr;</a></p>`;
      if ("sign" in b) return `<p style="margin:28px 0 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.ink}">${esc(b.sign)}</p>`;
      return `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.7;color:${b.muted ? C.muted : C.ink}">${esc(b.p)}</p>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title></title>
<style>@font-face{font-family:'Instrument Sans';font-weight:400;src:url(${assetUrl}/fonts/instrument-sans-latin-400-normal.woff2) format('woff2')}@font-face{font-family:'Instrument Sans';font-weight:500;src:url(${assetUrl}/fonts/instrument-sans-latin-500-normal.woff2) format('woff2')}@font-face{font-family:'Playfair Display';font-weight:400;src:url(${assetUrl}/fonts/playfair-display-latin-wght-normal.woff2) format('woff2')}</style>
</head>
<body style="margin:0;padding:0;background:${C.canvas}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas}"><tr><td align="center" style="padding:40px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 0 36px"><img src="${assetUrl}/images/email-crest.png" width="64" height="64" alt="House of Singh" style="display:block;border:0"></td></tr>
<tr><td>${body}</td></tr>
<tr><td style="padding:40px 0 0"><p style="margin:0;padding-top:20px;border-top:1px solid ${C.hairline};font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted}">${footer}</p></td></tr>
</table></td></tr></table></body></html>`;
}

function plain(blocks: Block[], footer: string): string {
  return (
    blocks
      .map((b) => {
        if ("big" in b) return b.big;
        if ("title" in b) return b.title;
        if ("label" in b) return `\n${b.label.toUpperCase()}`;
        if ("rows" in b) return b.rows.map(([k, v]) => `${k}: ${v}`).join("\n");
        if ("link" in b) return `${b.link}: ${b.href}`;
        if ("sign" in b) return `\n${b.sign}`;
        return b.p;
      })
      .join("\n\n") + `\n\n--\n${footer.replace(/<[^>]+>/g, "")}`
  );
}

/** Who sent it, where from, and why it arrived (CASL). */
function footer(who: "letters" | "editions", why: string, unsubscribe?: string | null): string {
  const { postalAddress, siteUrl } = emailConfig();
  const sender = who === "letters" ? "Maninder Singh, House of Singh" : EDITIONS_DEFAULTS.seller;
  const site = siteUrl.replace(/^https?:\/\//, "");
  const leave = unsubscribe ? `<a href="${esc(unsubscribe)}" style="color:${C.muted}">Unsubscribe</a>` : "";
  return [esc(sender), postalAddress ? esc(postalAddress) : "", `<a href="${siteUrl}" style="color:${C.muted}">${esc(site)}</a>`, esc(why), leave].filter(Boolean).join("<br>");
}

/** For a sign up email: the unsubscribe link in the footer and the headers mail apps read. */
function withUnsubscribe(e: Email, to: string): Email {
  const page = unsubscribePageUrl(to);
  const oneClick = unsubscribeOneClickUrl(to);
  if (!page || !oneClick) return e;
  return {
    ...e,
    text: `${e.text}\nUnsubscribe: ${page}`,
    headers: { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

function email(to: string, kind: string, priority: Email["priority"], subject: string, blocks: Block[], foot: string): Email {
  // The newsletter welcome comes from Maninder; every other email from the Shop.
  const sender = kind === "welcome" ? "letters" : "editions";
  return { to, kind, priority, sender, subject, html: render(blocks, foot), text: plain(blocks, foot) };
}

// ——— Sign ups ———

export function welcomeEmail(to: string): Email {
  const e = email(
    to,
    "welcome",
    "signup",
    "Welcome",
    [
      { big: "Welcome. The next letter will find you." },
      { p: "Letters come a few times a year, when there is something worth writing: new work, the journal, and now and then a Collection." },
      { p: "If you ever want to write back, reply to any letter. It comes to me." },
      { sign: "Maninder" },
    ],
    footer("letters", "You are receiving this because you signed up for letters on houseofsingh.com. Every letter has a link to unsubscribe, this one too.", unsubscribePageUrl(to)),
  );
  return withUnsubscribe(e, to);
}

export function notifyEmail(to: string, collection: string): Email {
  const e = email(
    to,
    "notify",
    "signup",
    `You are on the list for ${collection}`,
    [
      { big: `You are on the list for ${collection}.` },
      { p: "You will hear when it opens, with early access before everyone else. Nothing more." },
    ],
    footer("editions", `You are receiving this because you asked to hear about ${collection} on houseofsingh.com. Every email that follows has a link to unsubscribe, this one too.`, unsubscribePageUrl(to)),
  );
  return withUnsubscribe(e, to);
}

export function proposalReceivedEmail(to: string, name: string): Email {
  return email(
    to,
    "proposal",
    "signup",
    "Your proposal is in",
    [
      { big: `Thank you, ${name}. Your proposal is in.` },
      { p: EDITIONS_DEFAULTS.proposalPromise },
      { sign: "Maninder" },
    ],
    footer("editions", "You are receiving this because you sent a collaboration proposal on houseofsingh.com."),
  );
}

export function proposalCopyEmail(to: string, p: { name: string; email: string; practice: string; link: string; idea: string }): Email {
  const copy = email(
    to,
    "proposal-copy",
    "signup",
    `A collaboration proposal from ${p.name}`,
    [
      { label: "From" },
      { rows: [["Name", p.name], ["Email", p.email], ["Makes", p.practice], ["Work", p.link || "No link"]] },
      { label: "The idea" },
      { p: p.idea },
      { p: "In the Studio: House of Singh Editions, Collaboration proposals.", muted: true },
    ],
    footer("editions", "A copy of a proposal sent on houseofsingh.com."),
  );
  // Replying to the copy writes to the artist.
  return { ...copy, replyTo: p.email };
}

// ——— Orders ———

export type OrderEmailData = {
  pieceName: string;
  size?: string | null;
  shipsTo?: string | null;
  price: number;
  shipping: number;
  tax: number;
  total: number;
  collectorNumber: number;
  orderRef: string;
};

const collector = (n: number) => `No. ${String(n).padStart(4, "0")}`;

export function orderEmail(to: string, o: OrderEmailData): Email {
  const gst = process.env.GST_NUMBER?.trim();
  return email(
    to,
    "order",
    "order",
    `Your order: ${o.pieceName}`,
    [
      { big: "Thank you." },
      { title: `${o.pieceName} is yours.` },
      {
        rows: [
          ["Piece", o.size ? `${o.pieceName}, size ${o.size}` : o.pieceName],
          ...(o.shipsTo ? ([["Ships to", o.shipsTo]] as [string, string][]) : []),
          ["Price", cad(o.price)],
          ["Shipping", cad(o.shipping)],
          ["Tax", cad(o.tax)],
          ["Total", cad(o.total)],
          ["Collector", collector(o.collectorNumber)],
        ],
      },
      { label: "What happens next" },
      { p: "Your piece is made and packed with care, and shipped in 2 to 4 weeks. You will have an email when it is being made, and another with tracking when it ships." },
      { p: `Order reference ${o.orderRef}. Reply to this email with any question.`, muted: true },
    ],
    footer("editions", `You are receiving this because you bought from House of Singh Editions.${gst ? ` GST/HST ${gst}.` : ""}`),
  );
}

export function certificateEmail(to: string, c: { pieceName: string; number?: number | null; of?: number | null; code: string }): Email {
  const { siteUrl } = emailConfig();
  const which = c.number && c.of ? `, number ${c.number} of ${c.of}` : c.number === 1 && !c.of ? ", one of one" : "";
  return email(
    to,
    "certificate",
    "order",
    `Your certificate for ${c.pieceName}`,
    [
      { big: `The certificate for ${c.pieceName}${which}.` },
      { p: "The link below is the certificate: it confirms the piece, its number and that it is yours. Keep this email." },
      { link: "See the certificate", href: `${siteUrl}/editions/verify/${c.code}` },
    ],
    footer("editions", "You are receiving this because you bought a numbered piece from House of Singh Editions."),
  );
}

export function madeEmail(to: string, pieceName: string, orderRef: string): Email {
  return email(
    to,
    "made",
    "order",
    `${pieceName} is being made`,
    [
      { big: `${pieceName} is being made.` },
      { p: "It is in hand now, and will be packed with care. When it ships, the tracking number follows by email." },
      { p: `Order reference ${orderRef}.`, muted: true },
    ],
    footer("editions", "You are receiving this because you bought from House of Singh Editions."),
  );
}

export function shippedEmail(to: string, pieceName: string, orderRef: string, tracking: { number: string; url?: string | null }): Email {
  const href = tracking.url || `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(tracking.number)}`;
  return email(
    to,
    "shipped",
    "order",
    `${pieceName} is on its way`,
    [
      { big: `${pieceName} is on its way.` },
      { rows: [["Tracking", tracking.number]] },
      { link: "Follow the parcel", href },
      { p: "Import duties, where your country charges them, are paid on arrival.", muted: true },
      { p: `Order reference ${orderRef}.`, muted: true },
    ],
    footer("editions", "You are receiving this because you bought from House of Singh Editions."),
  );
}

/** To the Shop's own address: an order taxed for one province and shipped to another. */
export function checkTaxEmail(to: string, o: { pieceName: string; orderRef: string; taxProvince: string; shipProvince?: string }): Email {
  return email(
    to,
    "check-tax",
    "order",
    `Check tax: ${o.pieceName}, order ${o.orderRef}`,
    [
      { big: "An order to check." },
      { rows: [["Order", o.orderRef], ["Piece", o.pieceName], ["Taxed for", o.taxProvince], ["Ships to", o.shipProvince || "Unknown"]] },
      { p: "The buyer's postal code before Buy was in one province and the shipping address at checkout is in another, so the GST or HST charged may be wrong. In the Studio: House of Singh Editions, Orders, Check tax." },
    ],
    footer("editions", "Sent to the Shop's own address by houseofsingh.com."),
  );
}
