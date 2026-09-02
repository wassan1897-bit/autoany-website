import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Application, SPEObject } from "@splinetool/runtime";
import SiteNav from "./SiteNav";
import ScrollAtmosphere from "./ScrollAtmosphere";
import ErrorBoundary from "./ErrorBoundary";
import { EncryptedText } from "./ui/encrypted-text";
import { HoverBorderGradientDemo } from "./hover-border-gradient-demo";
import { CyberButton } from "./ui/CyberButton";
import { useTheme, type Theme } from "../lib/theme";
import { bindLiveSection } from "../lib/live-section";
import { onScrollFrame } from "../lib/scroll-bus";
import {
  preloadSplineScene,
  SPLINE_SCENE_URL,
} from "../lib/critical-assets";
import {
  allowSpline,
  shouldParkSpline,
  splinePixelRatio,
} from "../lib/performance";
import {
  createSplineGovernor,
  splinePointerIntervalMs,
  type SplineGovernor,
} from "../lib/spline-governor";
import "./Hero.css";

const Spline = lazy(() => import("@splinetool/react-spline"));

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const envChrome = new WeakMap<SPEObject, { visible: boolean }>();

/**
 * Cached, because this is called from the pointer and scroll paths as well as
 * the Spline render cadence - a `querySelector` per mouse move was showing up
 * as ~120 document queries a second.
 */
let openStage: HTMLElement | null = null;

function heroCovered() {
  if (!openStage || !openStage.isConnected) {
    openStage = document.querySelector(".open-stage");
  }
  if (openStage) {
    return Number(openStage.style.getPropertyValue("--open") || 0) > 0.22;
  }
  return window.scrollY > window.innerHeight * 0.42;
}

function paintSplineCanvas(spline: Application, _theme: Theme) {
  try {
    spline.setBackgroundColor("transparent");
  } catch {
    /* ignore */
  }
  spline.canvas.style.backgroundColor = "transparent";

  for (const obj of spline.getAllObjects()) {
    const original = envChrome.get(obj);
    if (original?.visible) obj.show();
  }
}

/**
 * Apply the tier's pixel ratio to the Spline canvas.
 *
 * Two things were wrong here before:
 *
 * 1. `Application` does not expose `setPixelRatio` at all - it lives on the
 *    internal renderer. The old call was `spline.setPixelRatio?.(ratio)`, which
 *    is `undefined`, so the optional call silently did nothing.
 * 2. Setting the ratio on the renderer is still not enough. Three.js only
 *    rebuilds the drawing buffer inside `setSize`, so the canvas stays at
 *    whatever size Spline gave it on load. Measured on a DPR-2 viewport: the
 *    ratio field read back correctly while the buffer stayed at 3004px wide for
 *    a 1592px canvas - 1.89x, roughly 4x the fragment work the tier intended.
 *
 * Calling `setSize(cssWidth, cssHeight, false)` after the ratio is what actually
 * resizes the buffer. `false` leaves the canvas CSS alone, which Hero.css owns.
 */
type RendererHandle = {
  setPixelRatio?: (ratio: number) => void;
  setSize?: (width: number, height: number, updateStyle: boolean) => void;
};

function applySplinePixelRatio(spline: Application, ratio: number): boolean {
  const app = spline as Application & RendererHandle & {
    _renderer?: RendererHandle;
    renderer?: RendererHandle;
  };

  for (const target of [app._renderer, app.renderer, app]) {
    if (!target || typeof target.setPixelRatio !== "function") continue;
    try {
      target.setPixelRatio(ratio);
      const canvas = spline.canvas;
      if (canvas && typeof target.setSize === "function") {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          target.setSize(Math.round(rect.width), Math.round(rect.height), false);
        }
      }
      return true;
    } catch {
      /* try the next handle */
    }
  }
  return false;
}

function syncSplinePlayback(spline: Application, hide: boolean) {
  if (hide) {
    if (!spline.isStopped) spline.stop();
  } else if (spline.isStopped) {
    spline.play();
  }
  if (spline.canvas) {
    spline.canvas.style.visibility = hide ? "hidden" : "visible";
  }
}

function feedSplineCursor(
  spline: Application,
  clientX: number,
  clientY: number,
) {
  const canvas = spline.canvas;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(rect.width, 1);
  const h = Math.max(rect.height, 1);
  const nx = ((clientX - rect.left) / w) * 2 - 1;
  const ny = -((clientY - rect.top) / h) * 2 + 1;
  const app = spline as Application & {
    mouse?: { x: number; y: number };
    _mouse?: { x: number; y: number };
  };
  if (app.mouse) {
    app.mouse.x = nx;
    app.mouse.y = ny;
  } else {
    app.mouse = { x: nx, y: ny };
  }
  if (app._mouse) {
    app._mouse.x = nx;
    app._mouse.y = ny;
  }
  canvas.dispatchEvent(
    new PointerEvent("pointermove", {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      pointerId: 1,
      pointerType: "mouse",
      view: window,
    }),
  );
  canvas.dispatchEvent(
    new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      view: window,
    }),
  );
}

/**
 * Frame rate the device must actually sustain for the bot to stay.
 *
 * The tier system reads CPU cores, RAM, viewport and connection - none of which
 * say anything about the GPU, which is the only thing that decides whether this
 * scene is smooth. A budget laptop reporting 4 cores and 8GB lands on the top
 * tier and then manages 3fps. So the scene is measured rather than predicted.
 *
 * 22 rather than 24 leaves a little slack on the tier whose target *is* 24.
 */
const MIN_SUSTAINED_FPS = 22;

/**
 * The hero entrance is a staggered framer-motion sequence whose last element
 * starts at 1.05s and runs 0.8s. Mounting the WebGL scene before that lands
 * would let shader compilation stall the one animation every visitor sees.
 */
const HERO_INTRO_SETTLE_MS = 1900;

type HeroProps = {
  active: boolean;
};

export default function Hero({ active }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const splineRef = useRef<Application | null>(null);
  const governorRef = useRef<SplineGovernor | null>(null);
  const pointerGapRef = useRef(splinePointerIntervalMs());
  const activeRef = useRef(active);
  activeRef.current = active;
  const themeRef = useRef<Theme>("dark");
  const { theme } = useTheme();
  themeRef.current = theme;
  const canSpline = useRef(allowSpline()).current;
  const [splineReady, setSplineReady] = useState(false);
  const [splineArmed, setSplineArmed] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);
  /** Set when the measured frame rate says this device cannot drive the scene. */
  const [splineUnderpowered, setSplineUnderpowered] = useState(false);

  /**
   * Hold the WebGL runtime back until the intro has finished and the page is
   * idle.
   *
   * Parsing the scene and compiling its shaders is a single multi-second
   * synchronous block; mounting it during startup meant that block landed on
   * top of the loader, so the first thing a visitor got was a frozen tab.
   *
   * The network fetch is started immediately though - it costs no main thread,
   * so it can overlap the intro for free. Only the expensive mount waits.
   */
  useEffect(() => {
    if (!canSpline || !active || splineArmed) return;

    preloadSplineScene();

    let cancelled = false;
    let idleId: number | null = null;
    const arm = () => {
      if (!cancelled) setSplineArmed(true);
    };

    const schedule = () => {
      if (cancelled) return;
      idleId =
        typeof requestIdleCallback !== "undefined"
          ? requestIdleCallback(arm, { timeout: 1200 })
          : window.setTimeout(arm, 200);
    };

    // Long enough for the staggered hero entrance to land before the scene
    // starts competing for the main thread.
    const settle = window.setTimeout(schedule, HERO_INTRO_SETTLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(settle);
      if (idleId !== null) {
        if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, [active, canSpline, splineArmed]);

  useEffect(() => {
    if (!canSpline) return;
    const spline = splineRef.current;
    if (spline) {
      syncSplinePlayback(
        spline,
        !active || heroCovered() || document.hidden,
      );
      if (active) governorRef.current?.touch();
    }
  }, [active, canSpline]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const hasOpenStage = () => {
      if (!openStage || !openStage.isConnected) {
        openStage = document.querySelector(".open-stage");
      }
      return Boolean(openStage);
    };

    const applyFog = () => {
      if (hasOpenStage()) return;
      const p = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 0.95)),
      );
      section.style.setProperty("--fog", p.toFixed(4));
    };

    const sync = (hide: boolean) => {
      const parked = shouldParkSpline();
      const spline = splineRef.current;
      if (spline) {
        syncSplinePlayback(spline, hide || !activeRef.current || parked);
        applySplinePixelRatio(spline, splinePixelRatio(parked || hide));
      }
    };

    const unbind = bindLiveSection(
      section,
      (live) => {
        const covered = heroCovered();
        sync(!live || covered || document.hidden);
        if (live && !covered && !document.hidden) {
          applyFog();
          // The governor parks its own rAF when it goes inactive, so coming
          // back into view has to wake it explicitly.
          governorRef.current?.touch();
        }
      },
      { mark: false },
    );

    /**
     * Everything here is inside the frame callback on purpose. It used to run
     * the covered check, the park sync and a WebGL render request on every raw
     * scroll event, outside the rAF guard that was meant to throttle it.
     */
    const onScrollTick = () => {
      const covered = heroCovered();
      const hidden = document.hidden;
      sync(covered || hidden);
      if (covered || hidden) return;
      governorRef.current?.touch();
      applyFog();
    };

    let pointerRaf = 0;
    let pointerX = 0;
    let pointerY = 0;
    let lastPointerFeed = 0;
    const onPointer = (event: PointerEvent) => {
      if (!activeRef.current || !splineRef.current) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerRaf) return;
      pointerRaf = requestAnimationFrame(() => {
        pointerRaf = 0;
        const live = splineRef.current;
        if (!live || heroCovered() || document.hidden) return;
        // Already once-per-frame here; the extra gap only applies on the
        // reduced-cadence tiers, where the scene renders slower than the
        // display anyway.
        const gap = pointerGapRef.current;
        if (gap > 0) {
          const now = performance.now();
          if (now - lastPointerFeed < gap) return;
          lastPointerFeed = now;
        }
        governorRef.current?.touch();
        feedSplineCursor(live, pointerX, pointerY);
      });
    };

    applyFog();
    const unsubscribeScroll = onScrollFrame(onScrollTick);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      unbind();
      unsubscribeScroll();
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
      window.removeEventListener("pointermove", onPointer);
      governorRef.current?.destroy();
      governorRef.current = null;
      const spline = splineRef.current;
      if (spline && !spline.isStopped) spline.stop();
    };
  }, []);

  useEffect(() => {
    const spline = splineRef.current;
    if (spline) paintSplineCanvas(spline, theme);
  }, [theme]);

  /**
   * Tear the scene down when the probe says the device cannot drive it. What is
   * left behind is the empty `.nk-spline-slot` - background only, no poster and
   * no placeholder card.
   */
  useEffect(() => {
    if (!splineUnderpowered) return;
    governorRef.current?.destroy();
    governorRef.current = null;
    const spline = splineRef.current;
    splineRef.current = null;
    if (spline) {
      try {
        if (!spline.isStopped) spline.stop();
      } catch {
        /* the runtime is going away with the canvas anyway */
      }
    }
  }, [splineUnderpowered]);

  const onSplineLoad = (spline: Application) => {
    splineRef.current = spline;
    governorRef.current?.destroy();
    governorRef.current = createSplineGovernor(
      spline,
      () => {
        if (!activeRef.current || heroCovered() || document.hidden) return false;
        if (shouldParkSpline()) return false;
        return true;
      },
      {
        idleStopMs: 0,
        /**
         * The canvas stays hidden (no `is-ready` class) until this fires, so a
         * device that fails the check never shows the bot at all - no flash of
         * a scene that then disappears, and no placeholder in its place.
         */
        onCapabilityMeasured: (achievedFps) => {
          if (achievedFps >= MIN_SUSTAINED_FPS) {
            setSplineReady(true);
            return;
          }
          setSplineUnderpowered(true);
        },
      },
    );
    governorRef.current.touch();
    const controls = spline.controls;
    if (controls) {
      controls.enableZoom = false;
      controls.enablePan = false;
    }
    spline.canvas.style.pointerEvents = "auto";
    spline.canvas.style.touchAction = "pan-y";
    spline.canvas.addEventListener(
      "wheel",
      (event) => event.stopImmediatePropagation(),
      { capture: true, passive: true },
    );
    paintSplineCanvas(spline, themeRef.current);
    syncSplinePlayback(
      spline,
      !activeRef.current || heroCovered() || document.hidden,
    );
    applySplinePixelRatio(spline, splinePixelRatio(shouldParkSpline()));
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="nk-hero"
      style={{ ["--fog" as string]: 0 }}
    >
      <motion.div
        className="nk-stage"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.15, delay: active ? 0.15 : 0, ease: EASE }}
      >
        <div className={`nk-spline${splineReady ? " is-ready" : ""}`}>
          <div className="nk-spline-slot" aria-hidden />
          {canSpline && splineArmed && !splineFailed && !splineUnderpowered && (
            <ErrorBoundary onError={() => setSplineFailed(true)}>
              <Suspense fallback={null}>
                <Spline
                  scene={SPLINE_SCENE_URL}
                  onLoad={onSplineLoad}
                  renderOnDemand
                  style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: "auto",
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>
        <div className="nk-fog" aria-hidden />
        <div className="nk-mist" aria-hidden />
      </motion.div>

      <ScrollAtmosphere variant="hero" draw />

      <SiteNav active={active} />

      <motion.div
        className="nk-bottom"
        initial={{ opacity: 0, y: 18 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.95, delay: active ? 0.28 : 0, ease: EASE }}
      >
        <div className="nk-bottom-inner">
          <div>
            <motion.p
              data-open-out
              className="nk-kicker"
              initial={{ opacity: 0, y: 14 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.8, delay: active ? 0.35 : 0, ease: EASE }}
            >
              <span className="nk-kicker-dot" aria-hidden />
              Built for operators
            </motion.p>

            <motion.h1
              className="nk-heading"
              initial={{ opacity: 0, y: 18 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.95, delay: active ? 0.48 : 0, ease: EASE }}
            >
              <span data-open-out className="nk-heading-line">
                {active ? (
                  <EncryptedText
                    text="Automate Everything."
                    encryptedClassName="nk-heading-encrypted"
                    revealedClassName="nk-heading-revealed"
                    revealDelayMs={55}
                    flipDelayMs={58}
                  />
                ) : (
                  "Automate Everything."
                )}
              </span>
              <span data-open-out className="nk-heading-line">
                {active ? (
                  <EncryptedText
                    text="Achieve Anything."
                    encryptedClassName="nk-heading-encrypted"
                    revealedClassName="nk-heading-revealed"
                    revealDelayMs={55}
                    flipDelayMs={58}
                  />
                ) : (
                  "Achieve Anything."
                )}
              </span>
            </motion.h1>

            <motion.p
              data-open-out
              className="nk-sub"
              initial={{ opacity: 0, y: 14 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.85, delay: active ? 0.72 : 0, ease: EASE }}
            >
              We sit with the bottleneck, then wire automation into the tools
              you already run.
            </motion.p>

            <motion.div
              data-open-out
              className="nk-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.85, delay: active ? 0.9 : 0, ease: EASE }}
            >
              <CyberButton href="#work" text="See systems" />
              <HoverBorderGradientDemo />
            </motion.div>
          </div>

          <motion.div
            data-open-out
            className="nk-pills"
            initial={{ opacity: 0, y: 12 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: active ? 1.05 : 0, ease: EASE }}
          >
            <span className="nk-pill">Voice</span>
            <span className="nk-pill">CRM</span>
            <span className="nk-pill">Ops</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
