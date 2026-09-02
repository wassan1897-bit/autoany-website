import { STACK_TOOLS } from "./stack-tools";
import { bestRasterSrc } from "./picture";

export const SPLINE_SCENE_URL =
  "https://prod.spline.design/V8ffAat3AjccN4Cj/scene.splinecode";

/**
 * Only what is actually painted behind the loader.
 *
 * The system stills and work photos used to sit here too, but every one of them
 * is below the fold and already lazy-loaded by the component that shows it, so
 * preloading them only delayed the first paint.
 */
const CRITICAL_IMAGES = [
  "/assets/studio-backdrop.png",
  ...STACK_TOOLS.map((tool) => tool.src),
] as const;

const WEIGHTS = {
  images: 45,
  fonts: 20,
  chunks: 35,
} as const;

/** Loader timing caps (shared with LoadingScreen). */
export const LOADER_MIN_MS = 1800;
export const LOADER_MAX_MS = 5000;

type ProgressListener = (progress: number) => void;

function preloadImage(src: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const img = new Image();
    const done = () => {
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = src;
    signal.addEventListener("abort", done, { once: true });
  });
}

/**
 * Warm the Spline scene. Called by the hero when it arms the canvas, *not*
 * during startup - it used to compete with the fonts and hero images for
 * bandwidth while the user was still looking at a black screen.
 */
export function preloadSplineScene() {
  if (typeof document === "undefined") return;
  const id = "autoany-spline-preload";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "preload";
  link.as = "fetch";
  link.href = SPLINE_SCENE_URL;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

export type AssetReadiness = {
  start: () => () => void;
  getProgress: () => number;
  whenReady: () => Promise<void>;
  subscribe: (listener: ProgressListener) => () => void;
};

export function createAssetReadiness(): AssetReadiness {
  let imagesDone = false;
  let fontsDone = false;
  let chunksDone = false;
  let started = false;
  let abort: AbortController | null = null;
  const listeners = new Set<ProgressListener>();

  const notify = () => {
    const progress = getProgress();
    listeners.forEach((listener) => listener(progress));
  };

  function getProgress(): number {
    let total = 0;
    if (imagesDone) total += WEIGHTS.images;
    if (fontsDone) total += WEIGHTS.fonts;
    if (chunksDone) total += WEIGHTS.chunks;
    return total;
  }

  async function preloadImages(signal: AbortSignal) {
    const unique = [...new Set(CRITICAL_IMAGES.map((src) => bestRasterSrc(src)))];
    await Promise.all(unique.map((src) => preloadImage(src, signal)));
    if (signal.aborted) return;
    imagesDone = true;
    notify();
  }

  async function preloadFonts(signal: AbortSignal) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
    if (signal.aborted) return;
    fontsDone = true;
    notify();
  }

  /**
   * Scroll and motion runtimes only. `@splinetool/react-spline` is deliberately
   * absent: it pulls a 4.4MB chunk that used to be awaited here, putting the
   * whole WebGL runtime on the critical path before first paint.
   */
  async function preloadChunks(signal: AbortSignal) {
    await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("motion/react"),
      import("lenis"),
    ]);
    if (signal.aborted) return;
    chunksDone = true;
    notify();
  }

  function start() {
    if (started) return () => undefined;
    started = true;
    abort = new AbortController();
    const signal = abort.signal;

    void preloadFonts(signal);
    void preloadImages(signal);
    void preloadChunks(signal);
    notify();

    return () => {
      abort?.abort();
      abort = null;
    };
  }

  function whenReady(): Promise<void> {
    if (getProgress() >= 100) return Promise.resolve();
    return new Promise((resolve) => {
      const unsub = subscribe((progress) => {
        if (progress >= 100) {
          unsub();
          resolve();
        }
      });
    });
  }

  function subscribe(listener: ProgressListener) {
    listeners.add(listener);
    listener(getProgress());
    return () => listeners.delete(listener);
  }

  return {
    start,
    getProgress,
    whenReady,
    subscribe,
  };
}

let handle: AssetReadiness | null = null;

export function getAssetReadiness(): AssetReadiness {
  if (!handle) handle = createAssetReadiness();
  return handle;
}
