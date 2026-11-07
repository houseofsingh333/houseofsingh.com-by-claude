"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Spotify's official iFrame API. Its loader pulls a second script from
 * embed-cdn.spotifycdn.com; both hosts are allowed in script-src
 * (next.config.ts).
 */
const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";
/**
 * The API must be loaded and its player ready within this, or it is not
 * used. On the preview it needed about 5 s.
 */
const API_TIMEOUT_MS = 12000;
/** The full size Spotify player; the placeholder matches it, so nothing shifts. */
export const PLAYER_HEIGHT = 352;
const TITLE = "Maninder's studio playlist, on Spotify";

type PlaybackEvent = { data?: { isPaused?: boolean } };
type Controller = {
  addListener(event: "ready", cb: () => void): void;
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
 * the viewport (the embed is heavy) and never depends on Spotify's iFrame
 * API: the normal Spotify iframe is shown straight away. Meanwhile the API
 * loads, and builds its own player out of sight; only if that player is
 * ready within API_TIMEOUT_MS, and the visitor has not started using the
 * normal one, does it take the normal player's place. Its playback events
 * then set data-playing on the record: the disc turns while Spotify plays
 * and stops when it pauses.
 *
 * Safety net, when the API never takes over (blocked, slow, or the visitor
 * pressed play first): the disc starts turning when focus moves into the
 * normal player (the visitor clicked it) and stops when the section leaves
 * the viewport; if the player still has focus when the section returns,
 * the disc turns again. Reduced motion: the disc never turns (CSS).
 */
export default function RecordPlayer({ embedSrc, recordId }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const plainRef = useRef<HTMLIFrameElement>(null);
  const inView = useInView(holderRef, { rootMargin: "200px" });
  // True once the API's player has taken over from the normal one.
  const [handedOver, setHandedOver] = useState(false);
  const uri = toUri(embedSrc);

  useEffect(() => {
    const mount = mountRef.current;
    // Without a Spotify address there is nothing for the API to control.
    if (!inView || !mount || !uri) return;
    const record = document.getElementById(recordId);
    let stopped = false; // unmounted, out of time, or the visitor began
    let handed = false;
    let controller: Controller | null = null;
    const giveUp = () => {
      if (handed) return;
      stopped = true;
      controller?.destroy();
      controller = null;
      mount.replaceChildren();
    };
    const deadline = window.setTimeout(giveUp, API_TIMEOUT_MS);
    // The section in view or not, for the safety net below.
    let inSection = true;
    const playerFocused = () => !!plainRef.current && document.activeElement === plainRef.current;
    const section = holderRef.current?.closest("section") ?? null;
    const sectionObserver = new IntersectionObserver((entries) => {
      inSection = entries.some((e) => e.isIntersecting);
      if (handed) return;
      if (!inSection) record?.removeAttribute("data-playing");
      else if (playerFocused()) record?.setAttribute("data-playing", "");
    });
    if (section) sectionObserver.observe(section);
    // Focus moving into the normal player means the visitor is using it:
    // never swap it out from under them, and (the safety net) turn the disc.
    const onBlur = () =>
      window.setTimeout(() => {
        if (!playerFocused()) return;
        giveUp();
        if (!handed && inSection) record?.setAttribute("data-playing", "");
      }, 0);
    window.addEventListener("blur", onBlur);

    // The API replaces this element with its own iframe; React never
    // renders into the mount, so the swap cannot upset it.
    const target = document.createElement("div");
    mount.appendChild(target);
    loadApi()
      .then((api) => {
        if (stopped) return;
        api.createController(target, { uri, width: "100%", height: PLAYER_HEIGHT }, (c) => {
          if (stopped) {
            c.destroy();
            return;
          }
          controller = c;
          c.addListener("ready", () => {
            if (stopped) return;
            handed = true;
            window.clearTimeout(deadline);
            mount.querySelector("iframe")?.setAttribute("title", TITLE);
            setHandedOver(true);
          });
          c.addListener("playback_update", (e) => {
            if (handed) record?.toggleAttribute("data-playing", e.data?.isPaused === false);
          });
        });
      })
      .catch(giveUp);

    return () => {
      stopped = true;
      window.clearTimeout(deadline);
      window.removeEventListener("blur", onBlur);
      sectionObserver.disconnect();
      controller?.destroy();
      mount.replaceChildren();
      record?.removeAttribute("data-playing");
      setHandedOver(false);
    };
  }, [inView, uri, recordId]);

  return (
    <div ref={holderRef} className="record-player" style={{ height: PLAYER_HEIGHT }}>
      {/* Shown until the player arrives, which then covers it. */}
      <span aria-hidden="true" className="record-player-placeholder">
        Playlist
      </span>
      {/* The API's player, out of sight until it is ready to take over. */}
      <div ref={mountRef} className="record-player-mount" data-ready={handedOver ? "" : undefined} />
      {inView && !handedOver && (
        <iframe
          ref={plainRef}
          title={TITLE}
          src={embedSrc}
          width="100%"
          height={PLAYER_HEIGHT}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
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
