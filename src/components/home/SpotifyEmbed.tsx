"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

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

export default function SpotifyEmbed({ playlistUrl }: Props) {
  const { ref, visible } = useScrollReveal(0.1);

  if (!playlistUrl) return null;

  const embedSrc = toEmbedUrl(playlistUrl);

  return (
    <section ref={ref} className="px-8 md:px-16 py-24 md:py-36">
      <div
        className={`transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Now Playing
        </p>
        <div className="w-full h-px bg-border mb-12" />
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {/* Spotify embed */}
        <iframe
          title="House of Singh Spotify Playlist"
          src={embedSrc}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: 12 }}
          className="opacity-80 hover:opacity-100 transition-opacity duration-500"
        />

        {/* Text */}
        <div>
          <h3 className="font-editorial text-xl md:text-2xl font-light text-foreground leading-snug">
            The Sounds Behind the Work
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-sm">
            This playlist showcases the music that keeps me inspired and in sync
            with my work.
          </p>
        </div>
      </div>
    </section>
  );
}
