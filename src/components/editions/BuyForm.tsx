"use client";

import { useState } from "react";
import { OutlineButton } from "@/components/OutlineCta";
import { cad } from "@/lib/editions/format";
import { taxForPostalCode, taxOnLines } from "@/lib/editions/tax-rates";
import type { Zone } from "@/lib/editions/types";

type Props = {
  slug: string;
  /** The piece's price before tax, CAD. */
  price: number;
  sizes: { key: string; label: string; left: number }[];
  zones: { value: Zone; label: string; price: number | null }[];
  /** The edition and Stripe line beneath Buy. */
  quiet: string;
  taxLine: string;
  /** Why the last try was refused (?buy=…), written beside Buy. */
  message?: string | null;
  /** The words for each refusal, for one that comes back without a reload. */
  words: Record<string, string>;
};

/**
 * Buy (canvas Y4b-PieceLuxe): the sizes as quiet outlined boxes (a sold
 * out size is struck through and cannot be chosen), where it ships with
 * the shipping price, then the outlined button across the panel: "Choose a
 * size" until a size is chosen, then "Buy, size M". It posts to
 * /api/editions/checkout, which checks stock again and creates the Stripe
 * Checkout; the page then moves to Stripe itself (the security policy does
 * not let a form post be redirected to another site). Without JavaScript
 * the form posts as usual and the answer moves on to Stripe.
 */
export default function BuyForm({ slug, price, sizes, zones, quiet, taxLine, message: initialMessage, words }: Props) {
  const [postal, setPostal] = useState("");
  const [message, setMessage] = useState(initialMessage ?? null);
  const [sending, setSending] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const firstZone = zones.find((z) => z.price !== null)?.value ?? null;
  const [zone, setZone] = useState<Zone | null>(firstZone);
  const chosen = sizes.find((s) => s.key === size);
  const needsSize = sizes.length > 0 && !chosen;
  // The estimate before Buy: GST/HST for the province of a Canadian postal
  // code, on the piece and its shipping. Stripe charges the exact amount
  // from the address given at checkout.
  const shipping = zones.find((z) => z.value === zone)?.price ?? 0;
  const tax = zone === "canada" ? taxForPostalCode(postal) : null;
  // The same amount Stripe will charge: each line's tax rounded to the cent.
  const taxAmount = tax ? taxOnLines(price, shipping, tax.percentage) : 0;
  // Canada needs the postal code: it sets the province, and so the tax.
  const needsPostal = zone === "canada" && !tax;
  const label = sending ? "Opening checkout" : sizes.length === 0 ? "Buy" : chosen ? `Buy, size ${chosen.label}` : "Choose a size";

  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    <form method="post" action="/api/editions/checkout" onSubmit={buy} className="ed-buy" aria-describedby={message ? "ed-buy-message" : undefined}>
      <input type="hidden" name="slug" value={slug} />
      {sizes.length > 0 && (
        <fieldset className="ed-choice">
          <legend className="type-label text-muted-foreground">Size</legend>
          <div className="ed-sizes">
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
      {zone === "canada" && (
        <div className="ed-postal">
          <label htmlFor={`ed-postal-${slug}`} className="type-label text-muted-foreground">
            Postal code, for GST or HST
          </label>
          <input
            id={`ed-postal-${slug}`}
            name="postal"
            required
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            autoComplete="postal-code"
            maxLength={7}
            placeholder="M5H 2N2"
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
      <OutlineButton type="submit" disabled={needsSize || !zone || needsPostal || sending} className="ed-buy-btn">
        {label}
      </OutlineButton>
      {message && (
        <p id="ed-buy-message" role="alert" className="ed-buy-message">
          {message}
        </p>
      )}
      <p className="ed-buy-quiet">
        {quiet}
        <br />
        {taxLine}
      </p>
    </form>
  );
}
