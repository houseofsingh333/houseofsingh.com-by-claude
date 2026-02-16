type Props = {
  playlistUrl?: string;
};

export default function SpotifyEmbed({ playlistUrl }: Props) {
  if (!playlistUrl) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        What We&apos;re Listening To
      </h2>
      <div className="mt-8 overflow-hidden rounded-xl">
        <iframe
          title="House of Singh Spotify Playlist"
          src={playlistUrl}
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
