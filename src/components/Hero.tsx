import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Application, SPEObject } from "@splinetool/runtime";
import SiteNav from "./SiteNav";
import ScrollAtmosphere from "./ScrollAtmosphere";
import { EncryptedText } from "./ui/encrypted-text";
import { HoverBorderGradientDemo } from "./hover-border-gradient-demo";
import { CyberButton } from "./ui/CyberButton";
import { useTheme, type Theme } from "../lib/theme";
import { bindLiveSection } from "../lib/live-section";
import "./Hero.css";

const Spline = lazy(() => import("@splinetool/react-spline"));

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPLINE_SCENE =
  "https://prod.spline.design/V8ffAat3AjccN4Cj/scene.splinecode";

const envChrome = new WeakMap<SPEObject, { visible: boolean }>();

function allowSpline() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return false;
  return true;
}

function heroCovered() {
  const stage = document.querySelector(".open-stage") as HTMLElement | null;
  if (stage) {
    return Number(stage.style.getPropertyValue("--open") || 0) > 0.22;
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

  try {
    spline.requestRender();
  } catch {
    /* ignore */
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
  const themeRef = useRef<Theme>("light");
  const { theme } = useTheme();
  themeRef.current = theme;
  const [splineOn, setSplineOn] = useState(false);
  const splineOnRef = useRef(false);

  useEffect(() => {
    if (!active) {
      const spline = splineRef.current;
      if (spline) syncSplinePlayback(spline, true);
      if (splineOnRef.current) {
        splineOnRef.current = false;
        setSplineOn(false);
      }
      return;
    }

    if (allowSpline() && !heroCovered()) {
      splineOnRef.current = true;
      setSplineOn(true);
    }
  }, [active]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const applyFog = () => {
      if (document.querySelector(".open-stage")) return;
      const p = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 0.95)),
      );
      section.style.setProperty("--fog", p.toFixed(4));
    };

    const sync = (hide: boolean) => {
      if (!active) {
        const spline = splineRef.current;
        if (spline) syncSplinePlayback(spline, true);
        return;
      }
      const spline = splineRef.current;
      if (spline) syncSplinePlayback(spline, hide);
      if (hide) {
        if (splineOnRef.current) {
          splineOnRef.current = false;
          setSplineOn(false);
        }
      } else if (allowSpline() && !splineOnRef.current) {
        splineOnRef.current = true;
        setSplineOn(true);
      }
    };

    const unbind = bindLiveSection(
      section,
      (live) => {
        const covered = heroCovered();
        sync(!live || covered || document.hidden);
        if (live && !covered) applyFog();
      },
      { mark: false },
    );

    let raf = 0;
    const onScroll = () => {
      const covered = heroCovered();
      sync(covered || document.hidden);
      if (covered) return;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          applyFog();
        });
      }
    };

    let pointerRaf = 0;
    let pointerX = 0;
    let pointerY = 0;
    const onPointer = (event: PointerEvent) => {
      if (!active || heroCovered() || document.hidden) return;
      const spline = splineRef.current;
      if (!spline || spline.isStopped) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerRaf) return;
      pointerRaf = requestAnimationFrame(() => {
        pointerRaf = 0;
        const live = splineRef.current;
        if (!live || live.isStopped || heroCovered() || document.hidden) return;
        feedSplineCursor(live, pointerX, pointerY);
      });
    };

    applyFog();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      unbind();
      if (raf) cancelAnimationFrame(raf);
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      const spline = splineRef.current;
      if (spline && !spline.isStopped) spline.stop();
    };
  }, [active]);

  useEffect(() => {
    const spline = splineRef.current;
    if (spline) paintSplineCanvas(spline, theme);
  }, [theme]);

  const onSplineLoad = (spline: Application) => {
    splineRef.current = spline;
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
    // Hold the bot until the loading screen has handed off.
    syncSplinePlayback(spline, !active || heroCovered() || document.hidden);
    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      (
        spline as Application & { setPixelRatio?: (ratio: number) => void }
      ).setPixelRatio?.(dpr);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const spline = splineRef.current;
    if (!spline) return;
    syncSplinePlayback(spline, !active || heroCovered() || document.hidden);
  }, [active]);

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
        <div className="nk-spline">
          {splineOn && (
            <Suspense fallback={null}>
              <Spline
                scene={SPLINE_SCENE}
                onLoad={onSplineLoad}
                style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
              />
            </Suspense>
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
