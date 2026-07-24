"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

type Props = {
  playlistUrl?: string;
};

/**
 * Convert any Spotify URL to its embed form so the iframe renders
 * an inline player instead of redirecting to the Spotify app.
 */
function toEmbedUrl(raw: string): string {
  if (raw.includes("open.spotify.com/embed/")) return raw;

  const openMatch = raw.match(
    /https?:\/\/open\.spotify\.com\/(playlist|album|track|episode|show)\/([^?#]+)/,
  );
  if (openMatch) {
    const [, type, id] = openMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  }

  const uriMatch = raw.match(
    /spotify:(playlist|album|track|episode|show):(\w+)/,
  );
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  }

  return raw;
}

/** Height of the Spotify player, matched by the placeholder so nothing shifts. */
const EMBED_HEIGHT = 152;

export default function SpotifyEmbed({ playlistUrl }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Mount the iframe only once the section approaches the viewport. The embed
  // ships ~676 KiB of JS and held the main thread for ~918ms; loading="lazy"
  // alone did not defer it because the element was already in the document.
  useEffect(() => {
    const el = holderRef.current;
    if (!el || inView) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  if (!playlistUrl) return null;

  const embedSrc = toEmbedUrl(playlistUrl);

  return (
    <section className="px-6 md:px-16 section-py">
      <ScrollReveal>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Now Playing
        </p>
        <div className="w-full h-px bg-border mb-12" />
      </ScrollReveal>

      <ScrollReveal delay={0.15} duration={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Spotify embed — mounted only when scrolled into view. The
              placeholder reserves the exact height so there is no shift. */}
          <div ref={holderRef} style={{ minHeight: EMBED_HEIGHT }}>
            {inView ? (
              <iframe
                title="House of Singh Spotify Playlist"
                src={embedSrc}
                width="100%"
                height={EMBED_HEIGHT}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ border: 0, borderRadius: 12 }}
                className="opacity-80 hover:opacity-100 transition-opacity duration-500"
              />
            ) : (
              <div
                aria-hidden="true"
                style={{ height: EMBED_HEIGHT, borderRadius: 12 }}
                className="w-full bg-secondary/60 border border-border/40 flex items-center px-5"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">
                  Playlist
                </span>
              </div>
            )}
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl md:text-2xl font-normal text-foreground leading-snug">
              The Sounds Behind the Work
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-sm">
              This playlist showcases the music that keeps me inspired and in sync
              with my work.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
