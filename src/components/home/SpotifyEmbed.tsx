type Props = {
  playlistUrl?: string;
};

/**
 * Convert any Spotify URL to its embed form so the iframe renders
 * an inline player instead of redirecting to the Spotify app.
 *
 * Accepts:
 *   https://open.spotify.com/playlist/ID
 *   https://open.spotify.com/embed/playlist/ID
 *   spotify:playlist:ID
 */
function toEmbedUrl(raw: string): string {
  // Already an embed URL – return as-is
  if (raw.includes("open.spotify.com/embed/")) return raw;

  // Regular open.spotify.com link → insert /embed/ after the domain
  const openMatch = raw.match(
    /https?:\/\/open\.spotify\.com\/(playlist|album|track|episode|show)\/([^?#]+)/,
  );
  if (openMatch) {
    const [, type, id] = openMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  }

  // Spotify URI (spotify:playlist:ID) → convert to embed URL
  const uriMatch = raw.match(
    /spotify:(playlist|album|track|episode|show):(\w+)/,
  );
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  }

  // Unrecognised format – return as-is and hope for the best
  return raw;
}

export default function SpotifyEmbed({ playlistUrl }: Props) {
  if (!playlistUrl) return null;

  const embedSrc = toEmbedUrl(playlistUrl);

  return (
    <section className="px-8 md:px-16 py-24 md:py-36">
      <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
        Now Playing
      </p>
      <div className="w-full h-px bg-border mb-12" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
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
