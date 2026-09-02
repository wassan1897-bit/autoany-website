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

  /**
   * Hold the WebGL runtime back until the page is painted and idle.
   *
   * Parsing the scene and compiling its shaders is a single ~2s synchronous
   * block; mounting it during startup meant that block landed on top of the
   * loader, so the first thing a visitor got was a frozen tab.
   */
  useEffect(() => {
    if (!canSpline || !active || splineArmed) return;

    let cancelled = false;
    const arm = () => {
      if (cancelled) return;
      preloadSplineScene();
      setSplineArmed(true);
    };

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(arm, { timeout: 1500 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const id = window.setTimeout(arm, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
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
        try {
          (
            spline as Application & { setPixelRatio?: (ratio: number) => void }
          ).setPixelRatio?.(splinePixelRatio(parked || hide));
        } catch {
          /* ignore */
        }
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
        const now = performance.now();
        if (now - lastPointerFeed < pointerGapRef.current) return;
        lastPointerFeed = now;
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
      { idleStopMs: 0 },
    );
    governorRef.current.touch();
    setSplineReady(true);
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
    try {
      (
        spline as Application & { setPixelRatio?: (ratio: number) => void }
      ).setPixelRatio?.(splinePixelRatio(shouldParkSpline()));
    } catch {
      /* ignore */
    }
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
          {canSpline && splineArmed && !splineFailed && (
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
