"use client";

import { useState } from "react";
import Link from "next/link";
import type { JournalEntry } from "@/lib/placeholder-data";

type Props = {
  entries: JournalEntry[];
};

export default function JournalList({ entries }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="overflow-hidden">
      {/* Hero header */}
      <section className="px-8 md:px-16 pt-32 md:pt-44 pb-16 md:pb-24">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Journal
        </p>
        <div className="w-full h-px bg-border mb-10" />
        <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] max-w-2xl animate-editorial-fade-in">
          Thoughts, Process &amp; Stories
        </h1>
        <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] mt-6 max-w-lg">
          Behind-the-scenes notes, reflections on craft, and the stories that
          shape the work.
        </p>
      </section>

      {/* Journal entries list */}
      <section className="px-8 md:px-16 pb-24 md:pb-36">
        <div className="relative">
          {entries.map((entry, index) => (
            <Link
              key={entry._id}
              href={`/journal/${entry.slug}`}
              className="group relative block border-t border-border py-8 md:py-10"
              onMouseEnter={() => setHoveredId(entry._id)}
              onMouseLeave={() => setHoveredId(null)}
              onMouseMove={handleMouseMove}
            >
              <div className="flex items-baseline justify-between gap-8">
                {/* Index number */}
                <span className="hidden md:block text-xs tracking-widest text-muted-foreground w-12 shrink-0 transition-colors duration-300 group-hover:text-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-editorial text-xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight transition-all duration-500 group-hover:tracking-wide">
                    {entry.title}
                  </h2>
                </div>

                {/* Date + arrow */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <time
                    dateTime={entry.date}
                    className="text-xs tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
                  >
                    {formatDate(entry.date)}
                  </time>
                  <span className="text-foreground/0 group-hover:text-foreground transition-all duration-500 translate-x-[-8px] group-hover:translate-x-0">
                    →
                  </span>
                </div>
              </div>

              {/* Excerpt on hover */}
              <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-16 opacity-0 group-hover:opacity-100">
                <p className="text-sm text-muted-foreground mt-3 md:ml-12 max-w-lg leading-relaxed">
                  {entry.excerpt}
                </p>
              </div>

              {/* Floating cover image that follows cursor */}
              {hoveredId === entry._id && entry.coverImage && (
                <div
                  className="hidden md:block absolute z-20 w-48 h-32 overflow-hidden pointer-events-none animate-fade-in"
                  style={{
                    left: mousePos.x + 20,
                    top: mousePos.y - 60,
                  }}
                >
                  <img
                    src={entry.coverImage}
                    alt=""
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              )}
            </Link>
          ))}

          {/* Bottom border */}
          <div className="border-t border-border" />
        </div>
      </section>
    </div>
  );
}
