import { useState } from "react";
import { Link } from "react-router-dom";
import { journalEntries } from "../lib/mock-data";

const HomeJournal = () => {
  const entries = journalEntries.slice(0, 4);
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
    <section className="px-8 md:px-16 py-24 md:py-36">
      <div className="flex items-baseline justify-between mb-14">
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground">
          Journal
        </h2>
        <Link
          to="/journal"
          className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          Browse all
        </Link>
      </div>

      <div className="relative">
        {entries.map((entry, index) => (
          <Link
            key={entry._id}
            to={`/journal/${entry.slug}`}
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

              {/* Title / excerpt — grows on hover */}
              <div className="flex-1 min-w-0">
                <h3 className="font-editorial text-xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight transition-all duration-500 group-hover:tracking-wide">
                  {entry.title || entry.excerpt}
                </h3>
              </div>

              {/* Date + arrow */}
              <div className="hidden md:flex items-center gap-6 shrink-0">
                <time className="text-xs tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  {formatDate(entry.publishedAt)}
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
            {hoveredId === entry._id && (
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
  );
};

export default HomeJournal;
