import type { ReactNode } from "react";
import LegalContents from "./LegalContents";
import { keepLastWords } from "@/lib/keepLastWords";

export type LegalSection = {
  id: string;
  title: string;
  /** One short line, written strictly from the section's own text. */
  short: string;
  body: ReactNode;
};

/**
 * Privacy and Terms: a contents list beside a reading column of about
 * 640px. Each section has a Playfair heading, an "In short" line, then its
 * full text. The contents list marks the section being read (LegalContents);
 * without JavaScript it is a plain list of links.
 */
export default function LegalPage({
  title,
  updated,
  sections,
  labels,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
  /** "Contents" and "In short:" (Site Settings, Privacy and Terms). */
  labels: { contents: string; inShort: string };
}) {
  return (
    <div className="legal px-6 md:px-16 page-top-offset section-pb">
      <header className="legal-header flex flex-col gap-4">
        <h1 className="font-editorial font-normal text-[length:clamp(40px,calc(32.99px_+_1.798vw),56px)] leading-[1.05] text-foreground">
          {title}
        </h1>
        <p className="type-label text-muted-foreground">{updated}</p>
      </header>
      <LegalContents label={labels.contents} items={sections.map(({ id, title }) => ({ id, title }))} />
      <article className="legal-article">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="legal-section">
            <h2 id={`${s.id}-title`} className="font-editorial font-normal text-[length:clamp(26px,calc(24.25px_+_0.449vw),30px)] leading-[1.2] text-foreground">
              {s.title}
            </h2>
            <p className="legal-short">
              {`${labels.inShort} `}
              {keepLastWords(s.short)}
            </p>
            <div className="legal-body">{s.body}</div>
          </section>
        ))}
      </article>
    </div>
  );
}
