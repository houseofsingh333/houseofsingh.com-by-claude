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
import { collectionState, available } from "../src/lib/editions/state";
import { checkPurchase, checkoutParams } from "../src/lib/editions/checkout";
import { shippingPrice } from "../src/lib/editions/shipping";
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
check(JSON.stringify(params.payment_method_types) === '["card","link"]', "cards (with Apple Pay and Google Pay) and Link only: no buy now pay later");
check(params.currency === "cad" && params.line_items.length === 2 && params.line_items[0].quantity === 1, "one piece, in CAD, plus its shipping line");
check(params.line_items[0].price_data.unit_amount === 18000 && params.line_items[1].price_data.unit_amount === 2200, "amounts in cents", [params.line_items[0].price_data.unit_amount, params.line_items[1].price_data.unit_amount]);
check(JSON.stringify(params.line_items[0].tax_rates) === '["txr_on"]' && JSON.stringify(params.line_items[1].tax_rates) === '["txr_on"]' && params.metadata.taxProvince === "ON", "the province's fixed GST/HST rate on the piece and on the shipping");
check(!JSON.stringify(params).includes("dynamic_tax_rates") && !JSON.stringify(params).includes("tax_behavior"), "no dynamic tax rates and no Stripe Tax settings are sent");
check(params.shipping_address_collection.allowed_countries.join() === "CA", "a Canadian address only, for the Canada zone");
const world = checkoutParams({ piece: print, collectionNumber: 1, size: null, zone: "world", shipping: 48, taxRate: null, siteUrl: "https://example.test", now });
check(world.line_items.every((l) => !("tax_rates" in l)) && world.metadata.taxProvince === "", "outside Canada: no tax");
check(!world.shipping_address_collection.allowed_countries.includes("CA") && !world.shipping_address_collection.allowed_countries.includes("US") && world.shipping_address_collection.allowed_countries.includes("IN"), "the rest of the world excludes Canada and the United States");
check(params.custom_text.submit.message.includes("House of Singh Studios Inc., operating House of Singh Editions") && params.custom_text.submit.message.includes("123456789RT0001"), "the seller and GST/HST number at checkout", params.custom_text.submit.message);
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

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exit(failures ? 1 : 0);
})();
