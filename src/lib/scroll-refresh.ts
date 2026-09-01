import { ScrollTrigger } from "gsap/ScrollTrigger";

let frame = 0;

/** Coalesce layout-measure refreshes so mount storms don't reflow the page N times. */
export function scheduleScrollTriggerRefresh() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    ScrollTrigger.refresh();
  });
}
