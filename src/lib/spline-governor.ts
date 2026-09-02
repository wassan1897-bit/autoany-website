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
  /**
   * Fired once with the frame rate the device actually sustained, shortly after
   * the scene starts rendering. Lets the caller drop the scene on hardware that
   * cannot drive it, rather than guessing from CPU/RAM/viewport - none of which
   * say anything about GPU capability.
   */
  onCapabilityMeasured?: (achievedFps: number, targetFps: number) => void;
};

/** Shader compilation and the first frames are not representative. */
const PROBE_WARMUP_MS = 700;
/** Length of the measurement window itself. */
const PROBE_WINDOW_MS = 1000;
/**
 * Hard deadline. A device slow enough to not fill the window in this long has
 * already answered the question, so report whatever was achieved rather than
 * leaving the scene running unmeasured forever.
 */
const PROBE_DEADLINE_MS = 2600;

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

  // --- capability probe state ---
  const probe = options.onCapabilityMeasured;
  let probeDone = !probe;
  let firstRenderAt = 0;
  let windowStart = 0;
  let windowFrames = 0;
  /**
   * Restart the measurement.
   *
   * Called from `park()` rather than inferred from a time gap: on the very
   * devices this is meant to catch, a single frame can legitimately take
   * hundreds of milliseconds, so treating a long frame as "we were parked"
   * meant the window reset forever and the scene was never judged at all.
   */
  const resetProbe = () => {
    firstRenderAt = 0;
    windowStart = 0;
    windowFrames = 0;
  };

  /** Count one rendered frame and report once the window is full. */
  const measure = (now: number) => {
    if (probeDone) return;
    if (firstRenderAt === 0) {
      firstRenderAt = now;
      return;
    }
    if (now - firstRenderAt < PROBE_WARMUP_MS) return;
    if (windowStart === 0) {
      windowStart = now;
      windowFrames = 0;
      return;
    }
    windowFrames += 1;
    const elapsed = now - windowStart;
    const expired = now - firstRenderAt >= PROBE_DEADLINE_MS;
    if (elapsed < PROBE_WINDOW_MS && !expired) return;
    probeDone = true;
    probe?.(Math.round((windowFrames * 1000) / Math.max(elapsed, 1)), maxFps);
  };

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
    // Time spent parked is not evidence about the device.
    resetProbe();
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
      measure(now);
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

/**
 * Minimum gap between cursor feeds. At the top tier this is 0: the feed already
 * runs inside a `requestAnimationFrame`, so it is naturally capped at the
 * display rate, and any extra throttle on top of that is what makes the bot
 * feel like it is lagging behind the pointer.
 */
export function splinePointerIntervalMs(): number {
  const fps = splineMaxFps();
  return fps >= 60 ? 0 : 1000 / fps;
}
