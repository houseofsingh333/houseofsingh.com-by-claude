"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

/** Spotify's official iFrame API. Allowed in script-src (next.config.ts). */
const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";
/** Give up on the API after this long and show the plain embed. */
const API_TIMEOUT_MS = 8000;
/** The full size Spotify player; the placeholder matches it, so nothing shifts. */
export const PLAYER_HEIGHT = 352;
const TITLE = "Maninder's studio playlist, on Spotify";

type PlaybackEvent = { data?: { isPaused?: boolean } };
type Controller = {
  addListener(event: "playback_update", cb: (e: PlaybackEvent) => void): void;
  destroy(): void;
};
type IFrameAPI = {
  createController(
    el: HTMLElement,
    options: { uri: string; width: string; height: number },
    cb: (controller: Controller) => void,
  ): void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

let apiPromise: Promise<IFrameAPI> | null = null;

/** Load the API script once per visit; later calls share the same answer. */
function loadApi(): Promise<IFrameAPI> {
  if (!apiPromise) {
    apiPromise = new Promise<IFrameAPI>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("timeout")), API_TIMEOUT_MS);
      window.onSpotifyIframeApiReady = (api) => {
        window.clearTimeout(timer);
        resolve(api);
      };
      const script = document.createElement("script");
      script.src = API_SRC;
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("load failed"));
      };
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

/** spotify:playlist:ID from an open.spotify.com link, or null. */
function toUri(embedSrc: string): string | null {
  const m = embedSrc.match(
    /open\.spotify\.com\/(?:embed\/)?(playlist|album|track|episode|show)\/([A-Za-z0-9]+)/,
  );
  return m ? `spotify:${m[1]}:${m[2]}` : null;
}

type Props = {
  /** The player's embed address (open.spotify.com/embed/...). */
  embedSrc: string;
  /** The id of the record element that turns while the music plays. */
  recordId: string;
};

/**
 * The Spotify player under the record. It mounts once the chapter nears
 * the viewport (the embed is heavy), through Spotify's iFrame API, whose
 * playback events set data-playing on the record so the disc turns only
 * while the playlist plays. If the API cannot load, a plain embed takes
 * its place: the player works normally and the disc stays still.
 */
export default function RecordPlayer({ embedSrc, recordId }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const inView = useInView(holderRef, { rootMargin: "200px" });
  const [apiFailed, setApiFailed] = useState(false);
  const uri = toUri(embedSrc);
  // Without a Spotify address there is nothing for the API to control.
  const plain = inView && (apiFailed || !uri);

  useEffect(() => {
    const mount = mountRef.current;
    if (!inView || !mount || !uri) return;
    const record = document.getElementById(recordId);
    let cancelled = false;
    let controller: Controller | null = null;
    // The API replaces this element with its iframe; React never renders
    // into the mount, so the swap cannot upset it.
    const target = document.createElement("div");
    mount.appendChild(target);

    loadApi()
      .then((api) => {
        if (cancelled) return;
        api.createController(target, { uri, width: "100%", height: PLAYER_HEIGHT }, (c) => {
          if (cancelled) {
            c.destroy();
            return;
          }
          controller = c;
          mount.querySelector("iframe")?.setAttribute("title", TITLE);
          c.addListener("playback_update", (e) => {
            record?.toggleAttribute("data-playing", e.data?.isPaused === false);
          });
        });
      })
      .catch(() => {
        if (!cancelled) setApiFailed(true);
      });

    return () => {
      cancelled = true;
      controller?.destroy();
      mount.replaceChildren();
      record?.removeAttribute("data-playing");
    };
  }, [inView, uri, recordId]);

  return (
    <div ref={holderRef} className="record-player" style={{ height: PLAYER_HEIGHT }}>
      {/* Shown until the player arrives, which then covers it. */}
      <span aria-hidden="true" className="record-player-placeholder">
        Playlist
      </span>
      <div ref={mountRef} className="record-player-mount" />
      {plain && (
        <iframe
          title={TITLE}
          src={embedSrc}
          width="100%"
          height={PLAYER_HEIGHT}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="record-player-frame"
        />
      )}
      <noscript>
        <iframe
          title={TITLE}
          src={embedSrc}
          width="100%"
          height={PLAYER_HEIGHT}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="record-player-frame"
        />
      </noscript>
    </div>
  );
}
