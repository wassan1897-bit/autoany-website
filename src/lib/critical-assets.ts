import { STACK_TOOLS } from "./stack-tools";
import { allowSpline } from "./performance";
import { bestRasterSrc } from "./picture";

export const SPLINE_SCENE_URL =
  "https://prod.spline.design/V8ffAat3AjccN4Cj/scene.splinecode";

const SYSTEM_STILLS = [
  "/assets/systems/01-ai-content-engine.png",
  "/assets/systems/02-sales-follow-up.png",
  "/assets/systems/03-client-onboarding.png",
  "/assets/systems/04-lead-outreach.png",
  "/assets/systems/05-linkedin-carousel.png",
  "/assets/systems/06-monthly-intake.png",
  "/assets/systems/07-multi-agent-support.png",
  "/assets/systems/09-gmail-triage.png",
  "/assets/systems/10-job-intake.png",
  "/assets/systems/11-voice-booking.png",
] as const;

const CRITICAL_IMAGES = [
  "/assets/studio-backdrop.png",
  "/assets/work/01-studio.jpg",
  "/assets/work/03-intake.jpg",
  "/assets/work/06-data.jpg",
  ...SYSTEM_STILLS,
  ...STACK_TOOLS.slice(0, 10).map((tool) => tool.src),
] as const;

const WEIGHTS = {
  spline: 40,
  images: 25,
  fonts: 15,
  chunks: 20,
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

function preloadSplineScene() {
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
  markSplineReady: () => void;
};

export function createAssetReadiness(): AssetReadiness {
  let splineDone = !allowSpline();
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
    if (splineDone) total += WEIGHTS.spline;
    if (imagesDone) total += WEIGHTS.images;
    if (fontsDone) total += WEIGHTS.fonts;
    if (chunksDone) total += WEIGHTS.chunks;
    return total;
  }

  function markSplineReady() {
    if (splineDone) return;
    splineDone = true;
    notify();
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

  async function preloadChunks(signal: AbortSignal) {
    await Promise.all([
      import("@splinetool/react-spline"),
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

    preloadSplineScene();
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
    markSplineReady,
  };
}

let handle: AssetReadiness | null = null;

export function getAssetReadiness(): AssetReadiness {
  if (!handle) handle = createAssetReadiness();
  return handle;
}

export function markSplineReady() {
  getAssetReadiness().markSplineReady();
}
