import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TextLink from "@/components/TextLink";
import { certificateByCode } from "@/lib/editions/records";
import { collectionTitle, dayIn } from "@/lib/editions/format";

export const metadata: Metadata = { title: "Certificate" };

/**
 * A certificate, by its code (the link on the thank you page and on the
 * card in the parcel): the piece, its number in the edition, the
 * Collection, the collector number and the day it was bought. A code that
 * matches no order is a 404. No name, email or address is ever shown.
 */
export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const cert = await certificateByCode(code).catch(() => null);
  if (!cert) notFound();

  const p = cert.piece;
  const numbered = p?.editionType === "numbered" && cert.editionNumber;
  const rows: [string, string][] = [
    ...(numbered ? [["Number", `${cert.editionNumber} of ${p!.quantity}`] as [string, string]] : []),
    ...(p?.editionType === "one-of-one" ? [["Edition", "One of one"] as [string, string]] : []),
    ...(p?.collection ? [["Collection", `${collectionTitle(p.collection.number)}, ${p.collection.season}`] as [string, string]] : []),
    ["Collector", `No. ${String(cert.collectorNumber).padStart(4, "0")}`],
    ["Bought", dayIn(cert.paidAt)],
    ["Certificate", code],
  ];

  return (
    <div className="ed-page">
      <section className="ed-thanks" aria-labelledby="ed-cert-title">
        <span className="type-label text-muted-foreground">{cert.testMode ? "Certificate · Test order" : "Certificate · Authentic"}</span>
        <h1 id="ed-cert-title" className="font-editorial font-normal text-display-l leading-[1.05] text-foreground">
          {cert.pieceName}
        </h1>
        <dl className="ed-summary">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="type-label text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {p?.slug && <TextLink href={`/editions/${p.slug}`}>The piece</TextLink>}
      </section>
    </div>
  );
}
