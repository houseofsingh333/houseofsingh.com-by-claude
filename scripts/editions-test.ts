/**
 * Tests for House of Singh Editions' buying logic, without Stripe or
 * Sanity: run with `npx tsx scripts/editions-test.ts`. Exits with 1 when a
 * check fails.
 *
 * Covers the states, stock and sizes (a sold out size is refused), the
 * shipping table, the Checkout Session's parameters (CAD, one piece, the
 * zone's countries, tax rates on the piece and the shipping), Stripe's
 * webhook signature, and the order store: the sale counted per size,
 * collector numbers in order and reused, edition numbers and certificate
 * codes, and a repeated event changing nothing.
 */
import { collectionState, available, releaseTimes } from "../src/lib/editions/state";
import { fewLeft, gridFilters, gridPiece, knownCollaborators, madeBy, makingEntries, shopSections, stillAvailable, visibleQuestions } from "../src/lib/editions/view";
import { taxMode, TAX_CODES } from "../src/lib/editions/tax-rates";
import { editionsCollectionsQuery } from "../src/lib/editions/queries";
import { cardDate, cityTimes, daysUntil, momentIn, releaseIcs, sealedEyebrow } from "../src/lib/editions/release";
import { withDefaults } from "../src/lib/editions/load";
import { DEFAULT_TERMS } from "../src/lib/editions/defaults";
import { previewAllowed } from "../src/lib/editions/enabled";
import { CONSENT } from "../src/lib/email/consent";
import { orderEmail, smallSupplierEmail } from "../src/lib/email/templates";
import { alertsDue, quarterOf, shiftQuarter, summarise } from "../src/lib/editions/smallSupplier";
import { checkPurchase, checkoutParams } from "../src/lib/editions/checkout";
import { isZone, shippingPrice, ZONES } from "../src/lib/editions/shipping";
import { taxForPostalCode, taxOnLines } from "../src/lib/editions/tax-rates";
import { formEncode, signStripePayload, verifyStripeSignature, type CheckoutSession } from "../src/lib/editions/stripe";
import { processPaidSession, processRefund, taxCheck, type OrderRecord, type OrderStore, type OrderPiece } from "../src/lib/editions/orders";
import { freeUnits, placeHold, releaseHold, type HoldStore } from "../src/lib/editions/holds";
import type { EditionsHold } from "../src/lib/editions/types";
import { gurmukhi, piecesInWords, cad } from "../src/lib/editions/format";
import type { EditionsCollection, EditionsPiece, ShippingRoute } from "../src/lib/editions/types";

let failures = 0;
const check = (ok: boolean, label: string, detail?: unknown) => {
  console.log(`${ok ? "pass" : "FAIL"}  ${label}${detail !== undefined ? `  (${JSON.stringify(detail)})` : ""}`);
  if (!ok) failures++;
};

const now = new Date("2027-04-14T12:00:00Z");
const collection = {
  _id: "c1",
  number: 1,
  season: "Vaisakhi 2027",
  colour: "saffron",
  intro: "x",
  earlyAccessOpens: "2027-04-12T13:00:00Z",
  opens: "2027-04-13T13:00:00Z",
  closes: null,
  earlyAccessCodeHash: "a".repeat(64),
} as EditionsCollection;

const tee: EditionsPiece = {
  _id: "p-tee",
  name: "Test tee",
  slug: "test-tee",
  collectionId: "c1",
  category: null,
  editionType: "limited",
  quantity: 40,
  price: 85,
  sizes: [
    { _key: "s", label: "S", stock: 2, sold: 2 },
    { _key: "m", label: "M", stock: 3, sold: 1 },
  ],
  soldCount: 3,
  photographs: [],
  statement: "x",
  maker: "x",
  packedWeight: 0.4,
  shipsFrom: "india",
};
const print: EditionsPiece = { ...tee, _id: "p-print", name: "Test print", slug: "test-print", editionType: "numbered", quantity: 25, price: 180, sizes: null, soldCount: 7, packedWeight: 0.9, shipsFrom: "canada" };
const routes: ShippingRoute[] = [
  { origin: "canada", zone: "canada", bands: [{ upToKg: 0.5, price: 14 }, { upToKg: 2, price: 22 }] },
  { origin: "canada", zone: "world", bands: [{ upToKg: 2, price: 48 }] },
  { origin: "india", zone: "canada", bands: [{ upToKg: 1, price: 38 }] },
];
const withCol = (p: EditionsPiece) => ({ ...p, collection: { ...collection, pieces: [tee, print] } });

// Numbers and words
check(gurmukhi(1) === "੧" && gurmukhi(12) === "੧੨", "Gurmukhi numerals", [gurmukhi(1), gurmukhi(12)]);
check(piecesInWords(8) === "Eight pieces" && piecesInWords(1) === "One piece", "pieces in words");
check(cad(180) === "$180 CAD" && cad(14.5) === "$14.50 CAD", "CAD prices", [cad(180), cad(14.5)]);

// States
check(collectionState(collection, [tee], new Date("2027-04-01T00:00:00Z"), false) === "sealed", "before early access: sealed");
check(collectionState(collection, [tee], new Date("2027-04-12T20:00:00Z"), false) === "sealed", "early access window without the code: still sealed");
check(collectionState(collection, [tee], new Date("2027-04-12T20:00:00Z"), true) === "early", "early access window with the code: early");
check(collectionState(collection, [tee], now, false) === "open", "after opening: open");
check(collectionState({ ...collection, closes: "2027-04-14T00:00:00Z" }, [tee], now, false) === "closed", "past the closing date: closed");
check(collectionState(collection, [{ ...print, soldCount: 25 }], now, false) === "closed", "everything sold: closed");

// Stock, sizes and shipping
check(available(tee) === 2 && available(print) === 18, "available: by size, and quantity less sold", [available(tee), available(print)]);
check(shippingPrice(routes, "canada", "canada", 0.9) === 22, "shipping: the first band the weight fits");
check(shippingPrice(routes, "canada", "united-states", 0.9) === null, "shipping: no route, no price");
const soldOutSize = checkPurchase(withCol(tee), "s", "canada", routes, false, now);
check(!soldOutSize.ok && soldOutSize.refusal === "size-sold-out", "buying a sold out size is refused", soldOutSize);
const noSize = checkPurchase(withCol(tee), null, "canada", routes, false, now);
check(!noSize.ok && noSize.refusal === "size-needed", "buying clothing without a size is refused");
const okSize = checkPurchase(withCol(tee), "m", "canada", routes, false, now);
check(okSize.ok && okSize.shipping === 38 && okSize.size?.label === "M", "an available size, shipped from India to Canada", okSize);
const sealed = checkPurchase(withCol(print), null, "canada", routes, false, new Date("2027-04-12T20:00:00Z"));
check(!sealed.ok && sealed.refusal === "not-open", "buying before opening without early access is refused");
const early = checkPurchase(withCol(print), null, "canada", routes, true, new Date("2027-04-12T20:00:00Z"));
check(early.ok, "buying in early access with the code");
const noShip = checkPurchase(withCol(print), null, "united-states", routes, false, now);
check(!noShip.ok && noShip.refusal === "no-shipping", "a zone without a rate is refused, not guessed");

// The province from the postal code, and the estimate to the cent
check(taxForPostalCode("m5h 2n2")?.province === "ON" && taxForPostalCode("H2X 1Y4")?.province === "QC" && taxForPostalCode("V6B")?.province === "BC" && taxForPostalCode("B3H")?.percentage === 14, "the province from a postal code's first letter");
check(taxForPostalCode("90210") === null && taxForPostalCode("D1A 1A1") === null && taxForPostalCode("") === null, "not a Canadian postal code: no province");
check(taxOnLines(85, 30, 13) === 14.95 && taxOnLines(180, 18, 5) === 9.9 && taxOnLines(45.5, 18.25, 14) === 8.93, "the estimate rounds each line to the cent, as Stripe does", [taxOnLines(85, 30, 13), taxOnLines(45.5, 18.25, 14)]);

// The province taxed against the province shipped to
check(JSON.stringify(taxCheck("ON", { country: "CA", state: "ON" })) === '{"taxProvince":"ON","shipProvince":"ON","checkTax":false}', "same province: nothing to check");
check(taxCheck("QC", { country: "CA", state: "ON" }).checkTax === true && taxCheck("NU", { country: "CA", state: "NT" }).checkTax === false, "another province: Check tax (NT and NU share a postal letter and a rate)");
check(JSON.stringify(taxCheck("", { country: "US", state: "NY" })) === "{}", "outside Canada: no tax, nothing to check");

// The Checkout Session
const params = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "canada", shipping: 22, taxRate: { id: "txr_on", province: "ON" }, siteUrl: "https://example.test", gstNumber: "123456789RT0001", now });
check(!("payment_method_types" in params), "payment methods are left to the Stripe Dashboard (no payment_method_types sent)");
check(params.currency === "cad" && params.line_items.length === 2 && params.line_items[0].quantity === 1, "one piece, in CAD, plus its shipping line");
check(params.line_items[0].price_data.unit_amount === 18000 && params.line_items[1].price_data.unit_amount === 2200, "amounts in cents", [params.line_items[0].price_data.unit_amount, params.line_items[1].price_data.unit_amount]);
check(JSON.stringify(params.line_items[0].tax_rates) === '["txr_on"]' && JSON.stringify(params.line_items[1].tax_rates) === '["txr_on"]' && params.metadata.taxProvince === "ON", "the province's fixed GST/HST rate on the piece and on the shipping");
check(!JSON.stringify(params).includes("dynamic_tax_rates") && !JSON.stringify(params).includes("tax_behavior"), "no dynamic tax rates and no Stripe Tax settings are sent");
check(params.shipping_address_collection.allowed_countries.join() === "CA", "a Canadian address only, for the Canada zone");
const world = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "world", shipping: 48, taxRate: null, siteUrl: "https://example.test", now });
check(world.line_items.every((l) => !("tax_rates" in l)) && world.metadata.taxProvince === "", "outside Canada: no tax");
check(["CA", "US", "IN"].every((c) => !world.shipping_address_collection.allowed_countries.includes(c)) && world.shipping_address_collection.allowed_countries.includes("GB"), "the rest of the world excludes Canada, the United States and India");
const india = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "india", shipping: 48, taxRate: null, siteUrl: "https://example.test", now });
check(india.shipping_address_collection.allowed_countries.join() === "IN" && india.line_items.every((l) => !("tax_rates" in l)), "India: an Indian address only, no Canadian tax");
check(isZone("india") && !isZone("mars"), "India is a zone of its own");
check(shippingPrice(routes, "canada", "india", 1) === 48, "no India route yet: India is charged the Elsewhere price");
check(shippingPrice([...routes, { origin: "canada", zone: "india", bands: [{ upToKg: 2, price: 30 }] }], "canada", "india", 1) === 30, "an India route, once set, is used");
check(ZONES.map((z) => z.label).join() === "Canada,United States,India,Elsewhere", "four zones, in order");
check(releaseTimes("2027-04-14T01:00:00Z") === "9 pm in Toronto, 6:30 am on 14 April in India", "release at 9 pm in Toronto: India's next day is named", releaseTimes("2027-04-14T01:00:00Z"));
check(releaseTimes("2027-04-14T13:00:00Z") === "9 am in Toronto, 6:30 pm in India", "same day in both places: no date", releaseTimes("2027-04-14T13:00:00Z"));
{
  // Shop design round 2: the release in words.
  const opens = "2027-04-13T23:00:00Z"; // 7 pm in Toronto
  const cities = withDefaults({}).releaseCities;
  const t = cityTimes(opens, cities);
  check(t.map((c) => `${c.label} ${c.time} ${c.date}`).join(" | ") === "Vancouver 4 pm 13 April | Toronto 7 pm 13 April | London 12 am 14 April | Amritsar 4:30 am 14 April | Melbourne 9 am 14 April", "five cities from one moment", t);
  check(cardDate(opens) === "13 · 04 · 2027", "the card's date, in Toronto", cardDate(opens));
  check(momentIn(opens, "America/Toronto") === "7 pm, Tuesday 13 April", "the visitor's own time, Toronto by default", momentIn(opens, "America/Toronto"));
  check(daysUntil(opens, new Date("2027-04-13T12:00:00Z")) === "today" && daysUntil(opens, new Date("2027-04-12T15:00:00Z")) === "tomorrow" && daysUntil(opens, new Date("2026-11-11T15:00:00Z")) === "in 153 days", "today, tomorrow, in N days (Toronto days)");
  check(sealedEyebrow({ releaseLine: "Released on the eve of Vaisakhi", season: "Vaisakhi 2027", opens }, new Date("2026-11-11T15:00:00Z")) === "Released on the eve of Vaisakhi · in 153 days", "the line before the release");
  const ics = releaseIcs({ _id: "c1", number: 1, opens }, "https://houseofsingh.com", new Date("2026-11-11T00:00:00Z"));
  check(ics.includes("DTSTART:20270413T230000Z") && ics.includes("DTEND:20270414T000000Z") && ics.includes("SUMMARY:House of Singh Editions\\, Collection 01") && ics.includes("URL:https://houseofsingh.com/editions") && ics.includes("\r\n"), "the calendar file: the moment, one hour, the title and the Shop");
  const s = withDefaults({ releaseCities: [{ _key: "a", label: "Nowhere", timeZone: "Not/AZone" }] });
  check(s.releaseCities.length === 5, "a city with a mistyped time zone is left out (the defaults stand when none is left)");
  check(withDefaults({}).questions.some((q) => q.question === "Can I return a piece?" && q.answer === ""), "the returns answer is a placeholder until written");
  check(withDefaults({}).beforeYouBuy.length === 5 && withDefaults({}).artistsWords.at(-1) === "you", "five notes; the rolling words end on you");
  check(/House of Singh/.test(CONSENT.letters) && /Unsubscribe/.test(CONSENT.letters) && /House of Singh Editions/.test(CONSENT.shop) && /Unsubscribe/.test(CONSENT.shop), "consent wording names the sender and the way out");
}
{
  const cat = (id: string, plural: string, order: number) => ({ _id: id, singular: plural, plural, descriptor: plural, order });
  const prints = cat("c-print", "Prints", 10), objects = cat("c-object", "Objects", 40);
  const held = [{ category: prints }, { category: prints }] as unknown as EditionsPiece[];
  const own = { filters: [{ _key: "a", category: prints }, { _key: "b", category: objects }] } as unknown as EditionsCollection;
  check(gridFilters(own, held).map((f) => f.label).join() === "Prints", "filters: only categories with a piece in the Collection");
  check(gridFilters({} as EditionsCollection, [...held, { category: objects }] as unknown as EditionsPiece[]).length === 2, "filters: every held category, in order");
}
check(params.custom_text.submit.message === "Sold by Maninder Singh, operating as House of Singh Editions. GST/HST 123456789RT0001.", "fixed tax (a future registration): the seller and the GST/HST number at checkout", params.custom_text.submit.message);
{
  // The seller change (with Maninder's CPA): sold by Maninder Singh, a small supplier; no GST/HST.
  const none = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "canada", shipping: 22, taxRate: { id: "txr_on", province: "ON" }, taxMode: "none", siteUrl: "https://example.test", gstNumber: "123456789RT0001", now });
  check(none.custom_text.submit.message === "Sold by Maninder Singh, operating as House of Singh Editions.", "no tax: the seller, and no GST/HST number", none.custom_text.submit.message);
  check(none.line_items.every((l) => !("tax_rates" in l)) && !("automatic_tax" in none) && !JSON.stringify(none).includes("tax_code") && !JSON.stringify(none).includes("tax_behavior"), "no tax: no rate, no Stripe Tax, even if a rate were passed");
  check(none.metadata.taxMode === "none" && none.metadata.taxProvince === "", "no tax: nothing to check afterwards");
  check(!/Studios Inc|GST|HST/.test(JSON.stringify(withDefaults({}))), "the Shop's default words name no company and no GST/HST");
  {
    // The preview cookie (approved 13 Nov): on previews and locally, never on Production.
    const was = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "production";
    const onProduction = previewAllowed();
    process.env.VERCEL_ENV = "preview";
    const onPreview = previewAllowed();
    delete process.env.VERCEL_ENV;
    const locally = previewAllowed();
    if (was === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = was;
    check(!onProduction && onPreview && locally, "the preview cookie counts on previews and locally, never on Production");
  }
  check(/Maninder Singh, a sole proprietor in Ontario, Canada, operating as House of Singh Editions/.test(JSON.stringify(DEFAULT_TERMS)) && /No GST or HST is charged/.test(JSON.stringify(DEFAULT_TERMS)), "the terms: the sole proprietor, and no GST or HST");
}
check(params.success_url.endsWith("/editions/thank-you?session_id={CHECKOUT_SESSION_ID}") && params.cancel_url.endsWith("/editions/test-print"), "success to the thank you page, cancel back to the piece");
const encoded = formEncode(params).join("&");
check(encoded.includes("line_items%5B0%5D%5Bprice_data%5D%5Bcurrency%5D=cad") && encoded.includes("line_items%5B1%5D%5Btax_rates%5D%5B0%5D=txr_on"), "form encoding for Stripe");

// The webhook's signature
const secret = "whsec_test_local";
const body = JSON.stringify({ type: "checkout.session.completed" });
check(verifyStripeSignature(body, signStripePayload(body, secret), secret), "a signed event is accepted");
check(!verifyStripeSignature(body, signStripePayload(body, "whsec_other"), secret), "a wrongly signed event is refused");
check(!verifyStripeSignature(body + " ", signStripePayload(body, secret), secret), "an altered body is refused");
check(!verifyStripeSignature(body, signStripePayload(body, secret, Math.floor(Date.now() / 1000) - 3600), secret), "an old event (an hour) is refused");

// The order store, in memory
function memoryStore(pieces: Record<string, OrderPiece>) {
  const orders = new Map<string, OrderRecord>();
  const collectors = new Map<string, number>();
  let next = 1;
  const store: OrderStore = {
    async getPiece(id) { return pieces[id] ?? null; },
    async getOrder(id) { return orders.get(id) ?? null; },
    async collectorNumber(id) { if (!collectors.has(id)) collectors.set(id, next++); return collectors.get(id)!; },
    async createOrderAndCount(order, pieceId, sizeKey) {
      if (orders.has(order._id)) return { created: false, soldAfter: 0 };
      orders.set(order._id, order);
      const p = pieces[pieceId];
      p.soldCount = (p.soldCount ?? 0) + 1;
      if (sizeKey) { const s = p.sizes?.find((x) => x._key === sizeKey); if (s) s.sold = (s.sold ?? 0) + 1; }
      return { created: true, soldAfter: p.soldCount };
    },
    async setOrderFields(id, fields) { orders.set(id, { ...orders.get(id)!, ...fields }); },
    async orderByPayment(pi) { return [...orders.values()].find((o) => o.paymentIntent === pi) ?? null; },
    async refundAndRestock(order, at) {
      const o = orders.get(order._id)!; if (o.status === "refunded") return false;
      orders.set(order._id, { ...o, status: "refunded", refundedAt: at });
      const p = pieces[order.piece._ref]; p.soldCount = (p.soldCount ?? 0) - 1;
      if (order.sizeKey) { const s = p.sizes?.find((x) => x._key === order.sizeKey); if (s) s.sold = (s.sold ?? 0) - 1; }
      return true;
    },
  };
  return { store, orders, collectors };
}
const pieces: Record<string, OrderPiece> = {
  "p-print": { _id: "p-print", name: "Test print", editionType: "numbered", issueCertificate: true, quantity: 25, soldCount: 7 },
  "p-plain": { _id: "p-plain", name: "Test print, no certificate", editionType: "numbered", quantity: 10, soldCount: 2 },
  "p-tee": { _id: "p-tee", name: "Test tee", editionType: "limited", quantity: 40, soldCount: 3, sizes: [{ _key: "m", label: "M", stock: 3, sold: 1 }] },
};
const mem = memoryStore(pieces);
const session = (id: string, email: string, meta: Record<string, string>): CheckoutSession => ({
  id, url: null, livemode: false, status: "complete", payment_status: "paid", payment_intent: `pi_${id}`,
  amount_subtotal: 20200, amount_total: 22826, total_details: { amount_tax: 2626 }, metadata: meta,
  customer_details: { email, name: "Test Buyer" },
  collected_information: { shipping_details: { name: "Test Buyer", address: { line1: "1 Test St", city: "Toronto", state: "ON", postal_code: "M5V 1A1", country: "CA" } } },
});
(async () => {
  const a = await processPaidSession(session("cs_test_a", "first@example.com", { pieceId: "p-print", price: "180", shipping: "22", zone: "canada" }), mem.store, now);
  check(a.status === "recorded" && a.order?.collectorNumber === 1, "first buyer: collector No. 1", a.order?.collectorNumber);
  check(pieces["p-print"].soldCount === 8 && a.order?.editionNumber === 8, "sold count 7 → 8, edition number 8 of 25", [pieces["p-print"].soldCount, a.order?.editionNumber]);
  check(typeof a.order?.certificateCode === "string" && /^[A-Z2-9]{10}$/.test(a.order.certificateCode), "a certificate code for a numbered edition", a.order?.certificateCode);
  check(a.order?.tax === 26.26 && a.order?.total === 228.26 && a.order?.testMode === true, "tax, total and test mode recorded", [a.order?.tax, a.order?.total]);
  const again = await processPaidSession(session("cs_test_a", "first@example.com", { pieceId: "p-print", price: "180", shipping: "22", zone: "canada" }), mem.store, now);
  check(again.status === "duplicate" && pieces["p-print"].soldCount === 8, "the same event again changes nothing", again.status);
  const b = await processPaidSession(session("cs_test_b", "second@example.com", { pieceId: "p-tee", size: "M", sizeKey: "m", price: "85", shipping: "38", zone: "canada" }), mem.store, now);
  check(b.order?.collectorNumber === 2 && pieces["p-tee"].sizes![0].sold === 2 && pieces["p-tee"].soldCount === 4, "second buyer: No. 2; size M sold 1 → 2", [b.order?.collectorNumber, pieces["p-tee"].sizes![0].sold]);
  check(!b.order?.certificateCode && !b.order?.editionNumber, "a limited run has no certificate");
  const c = await processPaidSession(session("cs_test_c", "FIRST@example.com ", { pieceId: "p-print", price: "180", shipping: "22", zone: "canada" }), mem.store, now);
  check(c.order?.collectorNumber === 1 && c.order?.editionNumber === 9, "a returning buyer keeps collector No. 1", [c.order?.collectorNumber, c.order?.editionNumber]);
  const plain = await processPaidSession(session("cs_test_p", "plain@example.com", { pieceId: "p-plain", price: "90", shipping: "22", zone: "world" }), mem.store, now);
  check(plain.status === "recorded" && !plain.order?.certificateCode && plain.order?.editionNumber === 3, "Issue a certificate off: no certificate code, the edition number still given", [plain.order?.certificateCode ?? null, plain.order?.editionNumber]);
  const unpaid = await processPaidSession({ ...session("cs_test_d", "x@example.com", { pieceId: "p-print" }), payment_status: "unpaid" }, mem.store, now);
  check(unpaid.status === "ignored", "an unpaid session is not recorded");

  // Refunds
  const partial = await processRefund({ payment_intent: "pi_cs_test_b", refunded: false, amount: 12300, amount_refunded: 500 }, mem.store);
  check(partial.status === "ignored" && pieces["p-tee"].sizes![0].sold === 2, "a partial refund changes no stock", partial.reason);
  const full = await processRefund({ payment_intent: "pi_cs_test_b", refunded: true, amount: 12300, amount_refunded: 12300 }, mem.store);
  check(full.status === "restocked" && pieces["p-tee"].sizes![0].sold === 1 && pieces["p-tee"].soldCount === 3, "a full refund restocks the size and the piece", [pieces["p-tee"].sizes![0].sold, pieces["p-tee"].soldCount]);
  const twice = await processRefund({ payment_intent: "pi_cs_test_b", refunded: true }, mem.store);
  check(twice.status === "ignored" && pieces["p-tee"].sizes![0].sold === 1, "the same refund again restocks nothing", twice.reason);

  // Holds: a piece with two left, buyers arriving together.
  const held = { _rev: "r0", quantity: 10, soldCount: 8, sizes: null as null, holds: [] as EditionsHold[] };
  let revN = 0;
  const holdStore: HoldStore = {
    async read() { return structuredClone(held); },
    async write(_id, rev, holds) { await new Promise((r) => setTimeout(r, 5)); if (rev !== held._rev) throw new Error("revision changed"); held.holds = holds; held._rev = `r${++revN}`; },
    async remove(_id, key) { held.holds = held.holds.filter((h) => h._key !== key); held._rev = `r${++revN}`; },
  };
  const tries = await Promise.all([1, 2, 3, 4].map(() => placeHold(holdStore, "p", null)));
  const won = tries.filter((t) => t.ok).length;
  check(won === 2 && held.holds.length === 2, "four buyers at once for the last two: two holds, never three", [won, held.holds.length]);
  check(tries.filter((t) => !t.ok).every((t) => !t.ok && t.reason === "held"), "the others are told it is held, not sold out", tries.map((t) => (t.ok ? "ok" : t.reason)));
  check(freeUnits(held, null) === 0 && available({ quantity: 10, soldCount: 8, sizes: null }) === 2, "held units are not free, but not sold either");
  const first = tries.find((t) => t.ok)!;
  if (first.ok) await releaseHold(holdStore, "p", first.key);
  check(freeUnits(held, null) === 1, "an expired checkout lets its hold go", freeUnits(held, null));
  held.holds = held.holds.map((h) => ({ ...h, until: new Date(Date.now() - 1000).toISOString() }));
  check(freeUnits(held, null) === 2, "a hold past its time no longer counts, even without the webhook", freeUnits(held, null));
  const sized = { _rev: "s0", quantity: 0, soldCount: 0, sizes: [{ _key: "s", stock: 1, sold: 0 }, { _key: "m", stock: 2, sold: 0 }], holds: [] as EditionsHold[] };
  const sizedStore: HoldStore = { async read() { return structuredClone(sized); }, async write(_i, _r, h) { sized.holds = h; }, async remove() {} };
  const s1 = await placeHold(sizedStore, "p", "s");
  const s2 = await placeHold(sizedStore, "p", "s");
  const m1 = await placeHold(sizedStore, "p", "m");
  check(s1.ok && !s2.ok && s2.reason === "held" && m1.ok, "holds are per size: the last S held, M still free", [s1.ok, s2.ok ? "ok" : s2.reason, m1.ok]);

  // In the making with incomplete Journal entries (the preview crash of 11 Nov):
  // the real query, run by Sanity's own GROQ engine, and the page's safe list.
  {
    const { parse, evaluate } = await import("groq-js");
    const image = (id: string) => ({ _type: "image", asset: { _type: "reference", _ref: id }, alt: "A photograph" });
    const dataset = [
      { _id: "c1", _type: "editionsCollection", number: 1, season: "Vaisakhi 2027", opens: "2027-04-13T23:00:00Z", journalEntries: [
        { _key: "a", _type: "reference", _ref: "gone" },
        { _key: "b", _type: "reference", _ref: "j-no-slug" },
        { _key: "c", _type: "reference", _ref: "j-no-cover" },
        { _key: "d", _type: "reference", _ref: "j-full" },
        { _key: "e", _type: "reference", _ref: "j-no-title" },
        { _key: "f", _type: "reference", _ref: "j-third" },
        { _key: "g", _type: "reference", _ref: "j-fourth" },
      ] },
      { _id: "j-no-slug", _type: "journalEntry", title: "No address" },
      { _id: "j-no-cover", _type: "journalEntry", title: "No cover", slug: { current: "no-cover" } },
      { _id: "j-full", _type: "journalEntry", title: "Full", slug: { current: "full" }, date: "2026-07-05", coverImage: image("image-abc-100x100-jpg") },
      { _id: "j-no-title", _type: "journalEntry", slug: { current: "no-title" } },
      { _id: "j-third", _type: "journalEntry", title: "Third", slug: { current: "third" } },
      { _id: "j-fourth", _type: "journalEntry", title: "Fourth", slug: { current: "fourth" } },
      { _id: "image-abc-100x100-jpg", _type: "sanity.imageAsset", url: "https://cdn.sanity.io/images/x/y/abc-100x100.jpg", metadata: { dimensions: { width: 100, height: 100, aspectRatio: 1 } } },
      { _id: "p1", _type: "editionsPiece", name: "Piece", slug: { current: "piece" }, order: 1, collection: { _type: "reference", _ref: "c1" }, collaborators: [{ _key: "x", _type: "reference", _ref: "gone-artist" }] },
    ];
    const result = (await (await evaluate(parse(editionsCollectionsQuery), { dataset })).get()) as { journal: unknown[]; pieces: { collaborators: unknown[] }[] }[];
    const journal = result[0].journal;
    check(Array.isArray(journal) && journal.every((e) => e && typeof e === "object"), "In the making: the query returns no null entries", journal);
    check((journal as { slug: string }[]).map((e) => e.slug).join() === "no-cover,full,third", "In the making: entries without an address or title, or that do not resolve, are skipped; at most three", journal);
    check(result[0].pieces[0].collaborators.length === 0, "a collaborator reference that does not resolve is dropped by the query");
    const safe = makingEntries([null, undefined, 7, { title: "No address" }, { slug: "no-title" }, { title: " ", slug: "blank" }, { _id: "a", title: "One", slug: "one", date: null, image: { url: null } }, { title: "Two", slug: "two" }, { title: "Three", slug: "three", image: { url: "https://cdn.sanity.io/x.jpg" } }, { title: "Four", slug: "four" }]);
    check(safe.map((e) => e.slug).join() === "one,two,three" && safe[0].image === null && safe[1]._id === "two" && safe[2].image !== null, "In the making: the page keeps only whole entries, at most three, and drops a broken photograph", safe);
    check(makingEntries(null).length === 0 && makingEntries({}).length === 0, "In the making: no list at all is an empty section, not an error");
    check(knownCollaborators([null, { name: "A", slug: "a" }, { name: null, slug: "b" }] as never).length === 1, "a missing collaborator is skipped in the maker line");
  }

  // Shop design round 3: Stripe Tax behind TAX_MODE, few left, Made by, availability.
  {
    check(taxMode({ TAX_MODE: "stripe" }) === "stripe" && taxMode({ TAX_MODE: "fixed", VERCEL_ENV: "preview" }) === "fixed", "TAX_MODE chooses the tax");
    check(taxMode({ VERCEL_ENV: "production" }) === "none" && taxMode({ VERCEL_ENV: "preview" }) === "none" && taxMode({}) === "none" && taxMode({ TAX_MODE: "None" }) === "none" && taxMode({ TAX_MODE: "other" }) === "none", "unset or unknown: no tax, everywhere");
    const st = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "canada", shipping: 22, taxRate: { id: "txr_on", province: "ON" }, taxMode: "stripe", siteUrl: "https://example.test", now });
    const [pieceLine, shipLine] = st.line_items as { price_data: { tax_behavior?: string; product_data: { tax_code?: string } } }[];
    check((st as { automatic_tax?: { enabled: boolean } }).automatic_tax?.enabled === true, "Stripe Tax: automatic tax on the session");
    check(st.line_items.every((l) => !("tax_rates" in l)), "Stripe Tax: no fixed rates on any line");
    check(pieceLine.price_data.tax_behavior === "exclusive" && shipLine.price_data.tax_behavior === "exclusive", "Stripe Tax: prices exclusive of tax");
    check(pieceLine.price_data.product_data.tax_code === TAX_CODES.goods && shipLine.price_data.product_data.tax_code === TAX_CODES.shipping, "Stripe Tax: physical goods and shipping tax codes");
    check(st.metadata.taxProvince === "" && st.metadata.taxMode === "stripe", "Stripe Tax: no province to compare afterwards (no Check tax)");
    const fx = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "canada", shipping: 22, taxRate: { id: "txr_on", province: "ON" }, taxMode: "fixed", siteUrl: "https://example.test", now });
    check(!("automatic_tax" in fx) && fx.line_items.every((l) => (l as { tax_rates?: string[] }).tax_rates?.[0] === "txr_on") && fx.metadata.taxProvince === "ON", "fixed: unchanged, the province's rate on both lines");
    check(taxCheck("", { country: "CA", state: "QC" }).checkTax === undefined, "Stripe Tax orders are never marked Check tax");

    const two = { quantity: 10, soldCount: 8 } as EditionsPiece;
    check(fewLeft(two, 3) === 2 && fewLeft({ quantity: 10, soldCount: 2 } as EditionsPiece, 3) === null && fewLeft({ quantity: 10, soldCount: 10 } as EditionsPiece, 3) === null, "few left: at or under the setting, never when sold out");
    check(JSON.stringify(madeBy({ collaborators: [{ _id: "a", name: "Sample Artist", slug: "sample-artist" }], madeWith: "a bindery" })) === JSON.stringify({ partner: "Sample Artist", about: { href: "/editions/collaborators/sample-artist", first: "Sample" } }), "Made by: a collaborator with a page, and About with the first name");
    check(madeBy({ collaborators: [], madeWith: " a bindery in Toronto " }).partner === "a bindery in Toronto" && madeBy({ collaborators: null, madeWith: "a bindery" }).about === null, "Made by: a maker without a page");
    check(madeBy({ collaborators: [null] as never, madeWith: "" }).partner === null, "Made by: House of Singh alone");
    check(stillAvailable([{ quantity: 1, soldCount: 1 }, { quantity: 5, soldCount: 0 }, { quantity: 2, soldCount: 1 }] as EditionsPiece[]) === "2 of 3 pieces", "still available: pieces with any left, of all");
    check(fewLeft({ quantity: 1, soldCount: 0, editionType: "one-of-one" } as EditionsPiece, 3) === null, "a one of one never shows a count");
    const one = gridPiece({ ...print, editionType: "one-of-one", quantity: 1, soldCount: 0 } as EditionsPiece, true, 3);
    check(one.oneOfOne === true && one.fewLeft === null, "a one of one's card reads One of one, with no few left label");
    const g = gridPiece({ ...print, quantity: 10, soldCount: 7, collaborators: [{ _id: "a", name: "Sample Artist", slug: "s" }] } as EditionsPiece, true, 3);
    check(g.fewLeft === 3 && g.partner === "Sample Artist", "the grid card carries few left and the collaborator");
  }

  // The Shop's menu offers only sections the page shows.
  {
    const on = (state: Parameters<typeof shopSections>[0]["state"], anticipation = false, questions = 6) =>
      Object.entries(shopSections({ state, anticipation, questions })).filter(([, v]) => v).map(([k]) => k).join(",");
    check(on("sealed") === "how,beforeYouBuy,questions,forArtists", "sealed: How it works, no Collection", on("sealed"));
    check(on("early") === "collection,beforeYouBuy,questions,forArtists", "early access: the Collection, no How it works", on("early"));
    check(on("open") === "collection,beforeYouBuy,questions,forArtists", "open: the Collection, no How it works", on("open"));
    check(on("closed") === "beforeYouBuy,questions,forArtists", "closed: neither the Collection nor How it works", on("closed"));
    check(on("sealed", true) === "how,beforeYouBuy,questions,forArtists" && on(null) === "beforeYouBuy,questions,forArtists", "anticipation is sealed; no Collection at all shows neither");
    check(on("open", false, 0) === "collection,beforeYouBuy,forArtists", "no question showing: no Questions in the menu");
    check(visibleQuestions([{ answer: "" }, { answer: "Yes" }], false).length === 1 && visibleQuestions([{ answer: "" }], true).length === 1, "placeholder answers count only where they show");
  }

  // The sample removal before launch: only sample data, never the real Collection or live records.
  {
    const { parse, evaluate } = await import("groq-js");
    const { SAMPLE_GROUPS, KEEP } = await import("./editions-samples.mjs");
    const dataset = [
      { _id: "editions-collection-01", _type: "editionsCollection", number: 1, isTestData: false },
      { _id: "editions-test-collection-01", _type: "editionsCollection", number: 1, isTestData: true },
      { _id: "drafts.editions-test-piece-1", _type: "editionsPiece", isTestData: true },
      { _id: "editions-test-piece-1", _type: "editionsPiece", isTestData: true },
      { _id: "editions-test-collaborator", _type: "editionsCollaborator" },
      { _id: "editions-category-print", _type: "editionsCategory" },
      { _id: "editionsSettings", _type: "editionsSettings" },
      { _id: "editionsShipping", _type: "editionsShipping", isTestData: true },
      { _id: "private.editions-order-a", _type: "editionsOrder", testMode: true, email: "A@x.test" },
      { _id: "private.editions-collector-a", _type: "editionsCollector", email: "a@x.test" },
      { _id: "private.editions-counter", _type: "editionsCounter", next: 4 },
      { _id: "private.editions-proposal-1", _type: "editionsProposal" },
      { _id: "private.email-queue-1", _type: "emailQueued", email: { sender: "editions" } },
      { _id: "private.email-queue-2", _type: "emailQueued", email: { sender: "letters" } },
      { _id: "private.signup-pending-1", _type: "signupPending", kind: "shop" },
      { _id: "private.signup-pending-2", _type: "signupPending", kind: "letters" },
      { _id: "private.email-day-2026-11-11", _type: "emailDay" },
      { _id: "private.editions-small-supplier", _type: "editionsSmallSupplier" },
      { _id: "subscriber-1", _type: "newsletterSubscriber" },
    ];
    const hit = new Set<string>();
    for (const [, q] of SAMPLE_GROUPS as [string, string][]) for (const d of (await (await evaluate(parse(q), { dataset })).get()) as { _id: string }[]) if (!KEEP.includes(d._id)) hit.add(d._id);
    const removed = [...hit].sort().join(",");
    check(
      removed === "drafts.editions-test-piece-1,editions-test-collaborator,editions-test-collection-01,editions-test-piece-1,private.editions-collector-a,private.editions-counter,private.editions-order-a,private.editions-proposal-1,private.email-queue-1,private.signup-pending-1",
      "sample removal: sample content, test orders, their collectors and the counter, Shop email records; nothing else",
      removed,
    );
    const real = [...dataset, { _id: "private.editions-order-b", _type: "editionsOrder", testMode: false, email: "a@x.test" }];
    const keptWithReal = new Set<string>();
    for (const [, q] of SAMPLE_GROUPS as [string, string][]) for (const d of (await (await evaluate(parse(q), { dataset: real })).get()) as { _id: string }[]) keptWithReal.add(d._id);
    check(!keptWithReal.has("private.editions-collector-a") && !keptWithReal.has("private.editions-counter"), "a collector or the counter with a real order is kept");
  }

  // The order email with no tax charged: no Tax row, no GST/HST number.
  {
    process.env.GST_NUMBER = "123456789RT0001";
    const e = orderEmail("buyer@example.test", { pieceName: "Window Seat", price: 180, shipping: 18, tax: 0, total: 198, collectorNumber: 4, orderRef: "TEST" });
    check(!/\bTax\b|GST|HST|123456789/.test(e.html + e.text) && /198/.test(e.text), "order email, no tax: no Tax row and no GST/HST number", e.text);
    check(/Maninder Singh, House of Singh Editions/.test(e.text) && /Studios Inc/.test(e.text) === false, "order email: sent by Maninder Singh, House of Singh Editions");
    const taxed = orderEmail("buyer@example.test", { pieceName: "Window Seat", price: 180, shipping: 18, tax: 25.74, total: 223.74, collectorNumber: 4, orderRef: "TEST" });
    check(/Tax/.test(taxed.text) && /123456789RT0001/.test(taxed.text), "order email, tax charged (a future registration): the Tax row and the number");
    delete process.env.GST_NUMBER;
  }

  // The small supplier tracker: calendar quarters in Toronto, four quarters rolling, alerts once.
  {
    check(quarterOf("2026-12-31T23:30:00-05:00") === "2026-Q4" && quarterOf("2027-01-01T04:30:00Z") === "2026-Q4" && quarterOf("2027-01-01T05:30:00Z") === "2027-Q1", "a quarter is Toronto's: 11:30 pm on 31 December is still Q4");
    check(shiftQuarter("2027-Q1", 1) === "2026-Q4" && shiftQuarter("2026-Q4", 3) === "2026-Q1" && shiftQuarter("2026-Q4", -1) === "2027-Q1", "quarters count back across a year");
    const now = new Date("2027-05-10T12:00:00Z"); // 2027-Q2
    const orders = [
      { subtotal: 180, shipping: 20, paidAt: "2027-04-20T15:00:00Z" },
      { subtotal: 300, shipping: 48, paidAt: "2027-04-21T15:00:00Z", refundedAt: "2027-04-25T15:00:00Z" },
      { subtotal: 900, shipping: 0, paidAt: "2027-04-22T15:00:00Z", testMode: true },
      { subtotal: 100, shipping: 50, paidAt: "2026-11-02T15:00:00Z" },
      { subtotal: 100, shipping: 0, paidAt: null },
      { subtotal: 1000, shipping: 0, paidAt: "2025-12-02T15:00:00Z" },
    ];
    const rows = summarise(orders, [{ quarter: "2027-Q1", amount: 5000 }, { quarter: "bad", amount: 9 }], now);
    const at = (q: string) => rows.find((r) => r.quarter === q)!;
    check(rows.length === 8 && rows[7].quarter === "2027-Q2" && rows[0].quarter === "2025-Q3", "eight quarters, oldest first, ending now", rows.map((r) => r.quarter));
    check(at("2027-Q2").orders === 200 && at("2027-Q2").ordersCount === 1, "piece plus shipping; refunded, test and unpaid orders left out", at("2027-Q2"));
    check(at("2027-Q2").rolling === 200 + 5000 + 150 && at("2026-Q3").rolling === 1000 && at("2026-Q4").rolling === 150, "four quarters rolling: this one and the three before (a year ago drops out)", [at("2027-Q2").rolling, at("2026-Q3").rolling, at("2026-Q4").rolling]);
    check(at("2027-Q1").other === 5000 && rows.every((r) => !Number.isNaN(r.total)), "other revenue by quarter; a mistyped quarter is ignored");

    const big = summarise([], [{ quarter: "2027-Q1", amount: 12000 }, { quarter: "2027-Q2", amount: 9000 }], now);
    const a1 = alertsDue(big, []);
    check(a1.due.map((a) => a.key).join() === "rolling-20000" && a1.active.join() === "rolling-20000", "past CA$20,000 rolling: one email", a1.due);
    check(alertsDue(big, a1.active).due.length === 0, "the next day: no second email for the same threshold");
    const bigger = summarise([], [{ quarter: "2027-Q1", amount: 12000 }, { quarter: "2027-Q2", amount: 14000 }], now);
    const a2 = alertsDue(bigger, a1.active);
    check(a2.due.map((a) => a.key).join() === "rolling-25000", "then past CA$25,000: its own email", a2.due);
    const single = summarise([], [{ quarter: "2027-Q2", amount: 20500 }], now);
    const a3 = alertsDue(single, []);
    check(a3.due.map((a) => a.key).join() === "rolling-20000,quarter-20000:2027-Q2", "one quarter past CA$20,000: the quarter's own email too", a3.due);
    check(alertsDue(single, a3.active).due.length === 0, "a quarter alerts once");
    const fallen = alertsDue(summarise([], [], now), a2.active);
    check(fallen.active.length === 0 && fallen.due.length === 0, "back under: the thresholds clear, ready to alert again");
    const mail = smallSupplierEmail("editions@example.test", a3.due[1], single);
    check(/2027-Q2/.test(mail.subject) && /CA\$20,500\.00/.test(mail.text) && mail.priority === "order", "the alert email: the quarter, the amount, sent ahead of sign ups", mail.subject);
  }

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exit(failures ? 1 : 0);
})();
