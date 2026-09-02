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
  /** 0 disables idle pause (recommended for hero). */
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
  let wasActive = false;
  const frameInterval = 1000 / maxFps;

  const requestFrame = () => {
    try {
      spline.requestRender();
    } catch {
      /* ignore */
    }
  };

  const touch = () => {
    lastActivity = performance.now();
    if (spline.isStopped) spline.play();
    requestFrame();
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const active = isActive();

    if (!active) {
      wasActive = false;
      return;
    }

    if (!wasActive) {
      wasActive = true;
      lastActivity = now;
      if (spline.isStopped) spline.play();
      requestFrame();
    }

    const idle = idleMs > 0 && now - lastActivity >= idleMs;
    if (idle) {
      if (!spline.isStopped) spline.stop();
      return;
    }

    if (spline.isStopped) spline.play();

    if (now - lastRender >= frameInterval) {
      requestFrame();
      lastRender = now;
    }
  };

  raf = requestAnimationFrame(tick);

  return {
    touch,
    destroy: () => {
      cancelAnimationFrame(raf);
    },
  };
}

export function splinePointerIntervalMs(): number {
  const fps = splineMaxFps();
  return fps >= 60 ? 16 : 1000 / fps;
}
