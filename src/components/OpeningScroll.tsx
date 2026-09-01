import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "../lib/scroll-refresh";
import "./OpeningScroll.css";

gsap.registerPlugin(ScrollTrigger);

export default function OpeningScroll({
  children,
}: {
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const hero = stage.querySelector<HTMLElement>(".nk-hero");
    const visual = stage.querySelector<HTMLElement>(".nk-stage");
    const outs = [
      ...stage.querySelectorAll<HTMLElement>("[data-open-out]"),
    ];
    const ins = [
      ...stage.querySelectorAll<HTMLElement>("[data-open-in]"),
    ];
    const cue = stage.querySelector<HTMLElement>(".gate-cue");
    if (!hero || !visual || !outs.length || !ins.length || !cue) return;

    gsap.set(outs, { opacity: 1, y: 0 });
    gsap.set(visual, { opacity: 1, scale: 1 });
    gsap.set(ins, { opacity: 0, y: 20 });
    gsap.set(cue, { opacity: 0, y: 16 });
    hero.style.setProperty("--fog", "0");
    stage.style.setProperty("--open", "0");
    stage.style.setProperty("--wf", "0");
    stage.classList.remove("is-wf");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: reduce ? 0 : 1.2,
        onUpdate: (self) => {
          stage.style.setProperty("--open", self.progress.toFixed(4));
          const wf = Number(stage.style.getPropertyValue("--wf") || 0);
          stage.classList.toggle("is-wf", wf > 0.001);
        },
      },
    });

    outs.forEach((line, i) => {
      tl.to(
        line,
        { opacity: 0, y: -22, duration: 0.05 },
        0.06 + i * 0.024,
      );
    });

    const fog = { v: 0 };
    tl.to(
      fog,
      {
        v: 1,
        duration: 0.14,
        onUpdate: () => {
          hero.style.setProperty("--fog", fog.v.toFixed(4));
        },
      },
      0.16,
    );
    tl.to(visual, { opacity: 0, scale: 1.04, duration: 0.14 }, 0.18);
    tl.to({}, { duration: 0.04 }, 0.32);

    ins.forEach((line, i) => {
      tl.to(
        line,
        { opacity: 1, y: 0, duration: 0.045 },
        0.34 + i * 0.03,
      );
    });
    tl.to(cue, { opacity: 1, y: 0, duration: 0.05 }, 0.48);
    tl.to({}, { duration: 0.03 }, 0.52);

    // Slow graph: roughly one scroll per node hop, then a short hold before cover.
    const graph = { v: 0 };
    tl.to(
      graph,
      {
        v: 1,
        duration: 0.4,
        onUpdate: () => {
          stage.style.setProperty("--wf", graph.v.toFixed(4));
          stage.classList.toggle("is-wf", graph.v > 0.001);
        },
      },
      0.48,
    );
    tl.to({}, { duration: 0.12 }, 0.88);

    scheduleScrollTriggerRefresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={trackRef} className="open-track">
      <div ref={stageRef} className="open-stage">
        {children}
      </div>
    </div>
  );
}
