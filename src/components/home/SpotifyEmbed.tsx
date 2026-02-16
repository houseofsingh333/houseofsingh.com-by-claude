export default function SpotifyEmbed() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        What We&apos;re Listening To
      </h2>
      <p className="mt-3 text-sm text-neutral-500">
        Spotify embed will go here. Replace the placeholder below with your
        Spotify playlist embed URL.
      </p>
      <div className="mt-8 overflow-hidden rounded-xl">
        {/* Replace src with your actual Spotify embed URL */}
        <iframe
          title="House of Singh Spotify Playlist"
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="border-0"
        />
      </div>
    </section>
  );
}
