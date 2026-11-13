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
/** The compact Spotify player; the placeholder matches it, so nothing shifts. */
const PLAYER_HEIGHT = 152;
/** After a pause the record stops turning, then waits this long before sliding back to its peek. */
const SETTLE_MS = 2000;
/** The arrival (record to its peek) plays once a visit. */
const ARRIVED_KEY = "hos_record_arrived";

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
  /** The player's accessible title (Site Settings, Chapter VI player label). */
  title: string;
};

/**
 * The Spotify player under the record, driving the disc: it turns while the
 * music plays and stops when it pauses.
 *
 * The player area mounts well before the chapter is in view (the embed is
 * heavy), and Spotify's iFrame API builds its player there; the area shows
 * its quiet placeholder until that player is ready, so the visitor never
 * starts a player that is about to be replaced. Its playback events then
 * set data-playing on the record. Only if the API is refused, fails, or is
 * not ready within API_TIMEOUT_MS does the ordinary Spotify iframe take its
 * place: the site never depends on the API to play music.
 *
 * Safety net, with the ordinary iframe (no play or pause signal reaches the
 * page from it): each tap into the player toggles the disc (focus is handed
 * back to the page after a tap, so the next tap is seen too; a keyboard
 * visitor tabbing in keeps their focus and the disc simply starts); the
 * disc stops when the tab is hidden or the section leaves the screen, and
 * it never turns more than BACKUP_MAX_MS without a confirming tap.
 * Reduced motion: the disc never turns (CSS).
 */
/** The safety net never turns the disc longer than this without a new tap. */
const BACKUP_MAX_MS = 30000;

/**
 * Playing: the record slides out and turns. Stopping: it stops turning at
 * once and, marked data-settling, slides back to its peek after a pause
 * (styles/home.css).
 */
const settleTimers = new WeakMap<HTMLElement, number>();
function setPlaying(record: HTMLElement, playing: boolean) {
  const was = record.hasAttribute("data-playing");
  if (playing === was) return;
  window.clearTimeout(settleTimers.get(record));
  record.toggleAttribute("data-playing", playing);
  record.toggleAttribute("data-settling", !playing);
  if (!playing) settleTimers.set(record, window.setTimeout(() => record.removeAttribute("data-settling"), SETTLE_MS));
}

export default function RecordPlayer({ embedSrc, recordId, title }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const plainRef = useRef<HTMLIFrameElement>(null);
  // Mount early, so the API's player is usually ready by the time it is seen.
  const inView = useInView(holderRef, { rootMargin: "1200px 0px" });
  // The API's player is ready and shown.
  const [handedOver, setHandedOver] = useState(false);
  // The API was refused, failed or ran out of time: the ordinary iframe.
  const [fallback, setFallback] = useState(false);
  const uri = toUri(embedSrc);
  // The ordinary iframe: the API failed, or there is no Spotify address for it.
  const plain = fallback || (inView && !uri);

  // Arrival: the record slides from inside the sleeve to its peek when the
  // chapter comes into view, once a visit (later visits find it there).
  useEffect(() => {
    const record = document.getElementById(recordId);
    if (!record) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(ARRIVED_KEY) === "1";
    } catch {
      /* no storage: it simply arrives each time */
    }
    if (seen) {
      record.setAttribute("data-arrived", "");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        record.setAttribute("data-arrived", "");
        try {
          sessionStorage.setItem(ARRIVED_KEY, "1");
        } catch {
          /* see above */
        }
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(record);
    return () => io.disconnect();
  }, [recordId]);

  // The API's player.
  useEffect(() => {
    const mount = mountRef.current;
    if (!inView || !mount) return;
    // Without a Spotify address there is nothing for the API to control.
    if (!uri) return;
    const record = document.getElementById(recordId);
    let stopped = false;
    let handed = false;
    let controller: Controller | null = null;
    const giveUp = () => {
      if (handed || stopped) return;
      stopped = true;
      controller?.destroy();
      controller = null;
      mount.replaceChildren();
      setFallback(true);
    };
    const deadline = window.setTimeout(giveUp, API_TIMEOUT_MS);

    // The API replaces this element with its own iframe; React never
    // renders into the mount, so the swap cannot upset it.
    const target = document.createElement("div");
    mount.appendChild(target);
    // Every frame the API puts here is titled the moment it appears, not
    // only once the player reports ready: until then a screen reader (and
    // axe, found in Firefox) would meet a frame with no name.
    const name = () => mount.querySelectorAll("iframe:not([title])").forEach((f) => f.setAttribute("title", title));
    const watch = new MutationObserver(name);
    watch.observe(mount, { childList: true, subtree: true });
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
            mount.querySelectorAll("iframe").forEach((f) => f.setAttribute("title", title));
            setHandedOver(true);
          });
          c.addListener("playback_update", (e) => {
            if (handed && record) setPlaying(record, e.data?.isPaused === false);
          });
        });
      })
      .catch(giveUp);

    return () => {
      stopped = true;
      watch.disconnect();
      window.clearTimeout(deadline);
      controller?.destroy();
      mount.replaceChildren();
      record?.removeAttribute("data-playing");
      setHandedOver(false);
    };
  }, [inView, uri, recordId, title]);

  // The safety net, only with the ordinary iframe.
  useEffect(() => {
    if (!plain) return;
    const record = document.getElementById(recordId);
    const section = holderRef.current?.closest("section") ?? null;
    let inSection = true;
    let lastKey = 0;
    let cap = 0;
    const stop = () => {
      window.clearTimeout(cap);
      if (record) setPlaying(record, false);
    };
    const start = () => {
      if (!inSection || document.hidden) return;
      if (record) setPlaying(record, true);
      window.clearTimeout(cap);
      cap = window.setTimeout(stop, BACKUP_MAX_MS);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") lastKey = performance.now();
    };
    // Focus moving into the player: a tap (or a keyboard visitor tabbing in).
    const onBlur = () =>
      window.setTimeout(() => {
        const frame = plainRef.current;
        if (!frame || document.activeElement !== frame) return;
        const byKeyboard = performance.now() - lastKey < 800;
        if (byKeyboard) return start();
        if (record?.hasAttribute("data-playing")) stop();
        else start();
        // Hand focus back to the page once the tap has landed, so the next
        // tap into the player is seen as well.
        window.setTimeout(() => {
          if (document.activeElement === frame) holderRef.current?.focus({ preventScroll: true });
        }, 400);
      }, 0);
    const onVisibility = () => {
      if (document.hidden) stop();
    };
    const observer = new IntersectionObserver((entries) => {
      inSection = entries.some((e) => e.isIntersecting);
      if (!inSection) stop();
    });
    if (section) observer.observe(section);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [plain, recordId]);

  return (
    <div ref={holderRef} tabIndex={-1} className="record-player" style={{ height: PLAYER_HEIGHT }}>
      {/* Shown until a player arrives, which then covers it. */}
      <span aria-hidden="true" className="record-player-placeholder">
        Playlist
      </span>
      {/* The API's player, out of sight until it is ready. */}
      <div ref={mountRef} className="record-player-mount" data-ready={handedOver ? "" : undefined} />
      {plain && (
        <iframe
          ref={plainRef}
          title={title}
          src={embedSrc}
          width="100%"
          height={PLAYER_HEIGHT}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="record-player-frame"
        />
      )}
      <noscript>
        <iframe
          title={title}
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
