import type { Application } from "@splinetool/runtime";
import {
  getEffectQuality,
  splineMaxFps,
  type EffectQuality,
} from "./performance";

type SplineApp = Application & {
  renderMode?: "auto" | "manual" | "continuous";
  renderOnDemand?: boolean;
};

export type SplineGovernorOptions = {
  /** 0 disables idle pause (hero keeps the bot animating while it is on screen). */
  idleStopMs?: number;
};

/** Pause WebGL after this idle window when parked/off-screen (0 = disabled). */
export function splineIdleStopMs(
  quality: EffectQuality = getEffectQuality(),
): number {
  switch (quality) {
    case "high":
      return 2800;
    case "medium":
      return 2200;
    default:
      return 1800;
  }
}

export type SplineGovernor = {
  touch: () => void;
  destroy: () => void;
};

export function createSplineGovernor(
  spline: Application,
  isActive: () => boolean,
  options: SplineGovernorOptions = {},
): SplineGovernor {
  const quality = getEffectQuality();
  const maxFps = splineMaxFps(quality);
  const idleMs = options.idleStopMs ?? splineIdleStopMs(quality);
  const app = spline as SplineApp;

  try {
    app.renderMode = "manual";
  } catch {
    /* runtime may not expose renderMode on older builds */
  }

  let raf = 0;
  let lastRender = 0;
  let lastActivity = performance.now();
  let destroyed = false;
  const frameInterval = 1000 / maxFps;

  const requestFrame = () => {
    try {
      spline.requestRender();
    } catch {
      /* ignore */
    }
  };

  /**
   * Stop the WebGL loop *and* our own rAF. The previous version re-armed
   * `requestAnimationFrame` before checking `isActive()`, so the governor kept
   * waking 60x/s — each wake running a `querySelector` and a
   * `getBoundingClientRect` — for the entire life of the page, even with the
   * hero scrolled far out of view.
   */
  const park = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (!spline.isStopped) spline.stop();
  };

  const tick = (now: number) => {
    raf = 0;
    if (destroyed) return;

    // Only pay for the liveness checks at the render cadence, not every frame.
    if (now - lastRender >= frameInterval) {
      if (!isActive()) {
        park();
        return;
      }

      if (idleMs > 0 && now - lastActivity >= idleMs) {
        park();
        return;
      }

      if (spline.isStopped) spline.play();
      requestFrame();
      lastRender = now;
    }

    raf = requestAnimationFrame(tick);
  };

  /** Wake the loop after a park, and reset the idle timer. */
  const touch = () => {
    if (destroyed) return;
    lastActivity = performance.now();
    if (spline.isStopped) spline.play();
    requestFrame();
    if (!raf) raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return {
    touch,
    destroy: () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

export function splinePointerIntervalMs(): number {
  const fps = splineMaxFps();
  return fps >= 60 ? 16 : 1000 / fps;
}
