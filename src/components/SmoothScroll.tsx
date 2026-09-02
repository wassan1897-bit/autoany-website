import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { allowSmoothScroll } from "../lib/performance";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled || !allowSmoothScroll()) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      lerp: reduceMotion ? 0.2 : 0.14,
      smoothWheel: true,
      wheelMultiplier: reduceMotion ? 1 : 1,
      touchMultiplier: reduceMotion ? 1 : 1.1,
      syncTouch: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onVis = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const onJump = (event: Event) => {
      const detail = (event as CustomEvent<
        string | { id: string; center?: boolean; duration?: number }
      >).detail;
      const id = typeof detail === "string" ? detail : detail?.id;
      if (!id) return;
      const duration =
        typeof detail === "object" && detail.duration != null
          ? detail.duration
          : 1.05;
      if (typeof detail === "object" && detail.center) {
        const el = document.getElementById(id);
        const height = el?.getBoundingClientRect().height ?? 0;
        const offset = -((window.innerHeight - height) / 2);
        lenis.scrollTo(`#${id}`, { offset, duration, easing: ease });
        return;
      }
      lenis.scrollTo(`#${id}`, { offset: -12, duration, easing: ease });
    };
    window.addEventListener("site-scroll-to", onJump);

    const onJumpY = (event: Event) => {
      const detail = (event as CustomEvent<number | { top: number; duration?: number }>).detail;
      const top = typeof detail === "number" ? detail : detail?.top;
      if (top == null || !Number.isFinite(top)) return;
      const duration = typeof detail === "object" ? (detail.duration ?? 0.58) : 0.58;
      lenis.scrollTo(top, { duration, easing: ease });
    };
    window.addEventListener("site-scroll-y", onJumpY);

    const tick = (time: number) => {
      if (document.hidden) return;
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      window.removeEventListener("site-scroll-to", onJump);
      window.removeEventListener("site-scroll-y", onJumpY);
      document.removeEventListener("visibilitychange", onVis);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}
