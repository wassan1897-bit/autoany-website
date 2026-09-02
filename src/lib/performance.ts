/** Quality tiers — never hide features, only tune cost. */

export type EffectQuality = "high" | "medium" | "low";

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function isTouchPrimary(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function isWeakDesktop(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  if (nav.deviceMemory != null && nav.deviceMemory <= 2) return true;
  if (nav.hardwareConcurrency != null && nav.hardwareConcurrency <= 2) {
    return true;
  }
  return false;
}

function connectionInfo() {
  if (typeof navigator === "undefined") return undefined;
  return (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
}

export function getEffectQuality(): EffectQuality {
  if (typeof window === "undefined") return "high";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  const connection = connectionInfo();
  if (connection?.saveData) return "low";

  const slowNet =
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "3g";
  if (slowNet) return "low";

  if (isMobileViewport() || isTouchPrimary() || isWeakDesktop()) {
    return "medium";
  }

  return "high";
}

/** Softer motion only — does not remove UI. */
export function shouldReduceEffects(): boolean {
  return getEffectQuality() !== "high";
}

export function isLowPowerDevice(): boolean {
  return shouldReduceEffects();
}

/** Animation duration multiplier (1 = full, lower = snappier on weak devices). */
export function animationScale(): number {
  switch (getEffectQuality()) {
    case "low":
      return 0.55;
    case "medium":
      return 0.78;
    default:
      return 1;
  }
}

/** Spline shows on all devices unless the user enabled data saver. */
export function allowSpline(): boolean {
  if (typeof navigator === "undefined") return false;
  return !connectionInfo()?.saveData;
}

export function splinePixelRatio(scrolledAway = false): number {
  const dpr = window.devicePixelRatio || 1;
  if (scrolledAway) return Math.min(dpr, 0.62);

  switch (getEffectQuality()) {
    case "low":
      return Math.min(dpr, 0.58);
    case "medium":
      return Math.min(dpr, 0.72);
    default:
      return Math.min(dpr, 1.02);
  }
}

/** Target Spline render cadence for the current device tier. */
export function splineMaxFps(quality: EffectQuality = getEffectQuality()): number {
  switch (quality) {
    case "low":
      return 24;
    case "medium":
      return 30;
    default:
      return 45;
  }
}

export function allowSmoothScroll(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  return !isTouchPrimary() && !isMobileViewport();
}

export function allowAuroraMotion(): boolean {
  return getEffectQuality() === "high";
}

export function allowHoverMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function allowAtmosphereDraw(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Pause WebGL when work section dominates the viewport. */
export function shouldParkSpline(): boolean {
  const work = document.getElementById("work");
  if (!work) return false;
  const rect = work.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.42;
}

export function applyEffectQualityToDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.effectQuality = getEffectQuality();
}
