"use client";

import { useRef, useState } from "react";
import { cad } from "@/lib/editions/format";
import { taxForPostalCode, taxOnLines } from "@/lib/editions/tax-rates";
import type { Zone } from "@/lib/editions/types";
import type { TaxMode } from "@/lib/editions/tax-rates";

type Props = {
  slug: string;
  /** The piece's price before tax, CAD. */
  price: number;
  sizes: { key: string; label: string; left: number }[];
  zones: { value: Zone; label: string; price: number | null }[];
  /** "stripe": Stripe Tax takes the address at checkout, so no postal code here; "fixed": the postal code sets the GST/HST. */
  taxMode: TaxMode;
  /** Why the last try was refused (?buy=…), written beside Buy. */
  message?: string | null;
  /** The words for each refusal, for one that comes back without a reload. */
  words: Record<string, string>;
};

/**
 * Buy (canvas Y4b-PieceLuxe): the sizes as quiet outlined boxes (a sold
 * out size is struck through and cannot be chosen), where it ships with
 * the shipping price, then Buy across the panel, the Shop's one solid
 * button (charcoal, canvas text; Shop design round 1). It names the next
 * step until the piece can be bought: "Choose a size", then, for Canada,
 * "Enter your postal code", then "Buy, size M"; pressed early, it takes
 * the visitor to that step instead of submitting (the sizes, with "Choose a
 * size"). With Stripe Tax (TAX_MODE "stripe") there is no postal code:
 * Stripe takes the address at checkout. It posts to
 * /api/editions/checkout, which checks stock again and creates the Stripe
 * Checkout; the page then moves to Stripe itself (the security policy does
 * not let a form post be redirected to another site). Without JavaScript
 * the form posts as usual and the answer moves on to Stripe.
 */
export default function BuyForm({ slug, price, sizes, zones, taxMode, message: initialMessage, words }: Props) {
  const [postal, setPostal] = useState("");
  const [message, setMessage] = useState(initialMessage ?? null);
  const [sending, setSending] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [sizeNote, setSizeNote] = useState(false);
  const sizesRef = useRef<HTMLDivElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const firstZone = zones.find((z) => z.price !== null)?.value ?? null;
  const [zone, setZone] = useState<Zone | null>(firstZone);
  const chosen = sizes.find((s) => s.key === size);
  const needsSize = sizes.length > 0 && !chosen;
  // The estimate before Buy: GST/HST for the province of a Canadian postal
  // code, on the piece and its shipping. Stripe charges the exact amount
  // from the address given at checkout.
  const shipping = zones.find((z) => z.value === zone)?.price ?? 0;
  const fixed = taxMode === "fixed";
  const tax = fixed && zone === "canada" ? taxForPostalCode(postal) : null;
  // The same amount Stripe will charge: each line's tax rounded to the cent.
  const taxAmount = tax ? taxOnLines(price, shipping, tax.percentage) : 0;
  // Canada needs the postal code: it sets the province, and so the tax.
  const needsPostal = fixed && zone === "canada" && !tax;
  const label = sending
    ? "Opening checkout"
    : needsSize
      ? "Choose a size"
      : needsPostal
        ? "Enter your postal code"
        : chosen
          ? `Buy, size ${chosen.label}`
          : "Buy";

  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Not ready yet: the button leads to the missing step.
    if (needsSize) {
      // From here or from the phone's bar: to the sizes, with a word.
      setSizeNote(true);
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sizesRef.current?.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
      sizesRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    if (needsPostal) {
      postalRef.current?.focus();
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/editions/checkout", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(e.currentTarget) });
      const data = (await res.json().catch(() => ({}))) as { url?: string; refusal?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setMessage(words[data.refusal ?? "unavailable"] ?? words.unavailable);
    } catch {
      setMessage(words.unavailable);
    }
    setSending(false);
  }

  return (
    <form id="ed-buy-form" method="post" action="/api/editions/checkout" onSubmit={buy} noValidate className="ed-buy" aria-describedby={message ? "ed-buy-message" : undefined}>
      <input type="hidden" name="slug" value={slug} />
      {sizes.length > 0 && (
        <fieldset className="ed-choice">
          <legend className="type-label text-muted-foreground">Size</legend>
          {sizeNote && !chosen && (
            <p className="ed-size-note" role="status">
              Choose a size
            </p>
          )}
          <div className="ed-sizes" ref={sizesRef}>
            {sizes.map((s) => (
              <label key={s.key} className="ed-size" data-sold={s.left === 0 ? "" : undefined}>
                <input type="radio" name="size" value={s.key} disabled={s.left === 0} checked={size === s.key} onChange={() => setSize(s.key)} />
                <span aria-hidden="true">{s.label}</span>
                <span className="sr-only">{s.left === 0 ? `${s.label}, sold out` : s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className="ed-choice">
        <legend className="type-label text-muted-foreground">Ships to</legend>
        <div className="ed-zones">
          {zones.map((z) => (
            <label key={z.value} className="ed-zone" data-none={z.price === null ? "" : undefined}>
              <input type="radio" name="zone" value={z.value} disabled={z.price === null} checked={zone === z.value} onChange={() => setZone(z.value)} />
              <span className="ed-zone-name">{z.label}</span>
              <span className="ed-zone-price">{z.price === null ? "Not yet" : z.price === 0 ? "Free" : cad(z.price)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {fixed && zone === "canada" && (
        <div className="ed-postal">
          <label htmlFor={`ed-postal-${slug}`} className="type-label text-muted-foreground">
            Postal code, for GST or HST
          </label>
          <input
            ref={postalRef}
            id={`ed-postal-${slug}`}
            name="postal"
            required
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            autoComplete="postal-code"
            maxLength={7}
            placeholder="Your postal code"
            aria-describedby={`ed-tax-${slug}`}
          />
          <p id={`ed-tax-${slug}`} className="ed-buy-quiet" aria-live="polite">
            {tax
              ? `${tax.label} for ${tax.name}, ${tax.percentage}%: ${cad(taxAmount)}. Total ${cad(price + shipping + taxAmount)}.`
              : postal.trim().length >= 3
                ? "That does not look like a Canadian postal code."
                : ""}
          </p>
        </div>
      )}
      <button type="submit" disabled={!zone || sending} className="ed-buy-btn type-label">
        <span>{label}</span>
        <span aria-hidden="true" className="ed-buy-arrow">
          {"\u2192"}
        </span>
      </button>
      {message && (
        <p id="ed-buy-message" role="alert" className="ed-buy-message">
          {message}
        </p>
      )}
    </form>
  );
}
