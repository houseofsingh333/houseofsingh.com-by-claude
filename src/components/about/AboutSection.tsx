"use client";

import { useState } from "react";
import { PortableText } from "@portabletext/react";
import type {
  AboutPageData,
  AboutPageHighlight,
  PortableTextBlock,
} from "@/lib/placeholder-data";

type Props = {
  data: AboutPageData;
};

function Portrait({ src }: { src: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="w-full aspect-[3/4] overflow-hidden bg-secondary"
      onMouseEnter={() => setRevealed(true)}
    >
      <img
        src={src}
        alt="Maninder Singh — Creative Director, Designer & Photographer"
        className={`w-full h-full object-cover object-top transition-all duration-1000 ${
          revealed ? "grayscale-0 scale-100" : "grayscale scale-[1.03]"
        }`}
      />
    </div>
  );
}

function Highlights({ items }: { items: AboutPageHighlight[] }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-8">
      {items.map((h) => (
        <div key={h.label}>
          <dt className="text-xs tracking-widest uppercase text-muted-foreground">
            {h.label}
          </dt>
          <dd className="mt-1 font-editorial text-lg font-light text-foreground">
            {h.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function RichText({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="prose-neutral text-sm md:text-[15px] text-muted-foreground leading-[1.8] max-w-none [&>p]:mb-4">
      <PortableText value={value} />
    </div>
  );
}

export default function AboutSection({ data }: Props) {
  const { title, intro, portrait, body, highlights } = data;

  return (
    <article className="px-8 md:px-16 py-24 md:py-36">
      {/* Section label */}
      <div className="mb-16">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          {title}
        </p>
        <div className="w-full h-px bg-border mt-4" />
      </div>

      {/* Portrait + intro layout */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Portrait */}
        {portrait && (
          <div className="md:col-span-5 md:col-start-1 relative z-10">
            <Portrait src={portrait} />
          </div>
        )}

        {/* Intro + roles */}
        <div
          className={`flex flex-col gap-10 md:pt-16 lg:pt-28 ${
            portrait
              ? "md:col-span-5 md:col-start-7"
              : "md:col-span-8 md:col-start-3"
          }`}
        >
          <div className="space-y-0">
            {["Creative Director", "Multidisciplinary Designer", "Photographer"].map(
              (role, i) => (
                <p
                  key={role}
                  className={`font-editorial text-xl md:text-2xl lg:text-[1.75rem] font-light text-foreground leading-[1.5] ${
                    i === 1
                      ? "opacity-80"
                      : i === 2
                        ? "opacity-60"
                        : "opacity-100"
                  }`}
                >
                  {role}
                </p>
              ),
            )}
          </div>

          {intro && <RichText value={intro} />}

          {!intro && (
            <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] max-w-sm">
              Based in Toronto, Maninder Singh blends design and photography to
              craft stories that feel both visually refined and emotionally
              resonant. His practice spans brand identities, editorial work, and
              fine art — always grounded in intention and detail.
            </p>
          )}
        </div>
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="mt-24 md:mt-32">
          <div className="mb-12">
            <p className="text-xs tracking-widest uppercase text-muted-foreground">
              At a Glance
            </p>
            <div className="w-full h-px bg-border mt-4" />
          </div>
          <Highlights items={highlights} />
        </div>
      )}

      {/* Body */}
      {body && (
        <div className="mt-24 md:mt-32 max-w-2xl">
          <div className="mb-12">
            <p className="text-xs tracking-widest uppercase text-muted-foreground">
              The Story
            </p>
            <div className="w-full h-px bg-border mt-4" />
          </div>
          <RichText value={body} />
        </div>
      )}
    </article>
  );
}
