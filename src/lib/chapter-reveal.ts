import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "./scroll-refresh";

gsap.registerPlugin(ScrollTrigger);

function linesOf(copy: HTMLElement | null) {
  if (!copy) return [];
  const kids = [
    ...copy.querySelectorAll<HTMLElement>(":scope > *"),
  ];
  return kids.length ? kids : [copy];
}

function bodiesOf(body: HTMLElement | HTMLElement[] | null) {
  if (!body) return [];
  return Array.isArray(body) ? body : [body];
}

/**
 * Every page uses the same grammar: copy lands one line at a time,
 * then the visual. The visual cannot start until the last line is in.
 * Pinned chapters also reverse on the way out.
 */
export function bindChapterReveal(
  track: HTMLElement,
  copy: HTMLElement | null,
  body: HTMLElement | HTMLElement[] | null,
) {
  const lines = linesOf(copy);
  const visuals = bodiesOf(body);
  if (!lines.length && !visuals.length) return () => undefined;

  const pinned = track.classList.contains("scroll-chapter");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.set(lines, { opacity: 0, y: 20 });
  if (visuals.length) gsap.set(visuals, { opacity: 0, y: 36 });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: track,
      start: pinned ? "top top" : "top 78%",
      end: pinned ? "bottom bottom" : "top 10%",
      scrub: reduce ? 0 : 1.18,
    },
  });

  const lineDur = 0.07;
  const gap = 0.045;
  const enterAt = pinned ? 0.08 : 0;
  lines.forEach((line, i) => {
    tl.to(
      line,
      { opacity: 1, y: 0, duration: lineDur },
      enterAt + i * gap,
    );
  });
  const textDone = enterAt + Math.max(0, lines.length - 1) * gap + lineDur;
  const visualAt = textDone + 0.08;
  if (visuals.length) {
    tl.to(
      visuals,
      { opacity: 1, y: 0, duration: 0.16 },
      visualAt,
    );
  }

  if (pinned) {
    const leave = 0.72;
    if (visuals.length) {
      tl.to(visuals, { opacity: 0, y: -24, duration: 0.1 }, leave);
    }
    lines.forEach((line, i) => {
      tl.to(
        line,
        { opacity: 0, y: -18, duration: 0.05 },
        leave + 0.1 + i * 0.04,
      );
    });
    tl.to({}, { duration: 0.06 }, 0.98);
  }

  scheduleScrollTriggerRefresh();

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}
