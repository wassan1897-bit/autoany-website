import { ScrollTrigger } from "gsap/ScrollTrigger";

let timer = 0;

/** How long to wait for the mount storm to settle before re-measuring. */
const SETTLE_MS = 260;

/**
 * Coalesce layout-measure refreshes so mount storms don't reflow the page N
 * times.
 *
 * A single rAF was not enough: the deferred sections open 100ms apart, so each
 * one landed in its own frame and triggered its own full-page re-measure right
 * as the user started scrolling. A short trailing debounce collapses them.
 */
export function scheduleScrollTriggerRefresh() {
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = 0;
    ScrollTrigger.refresh();
  }, SETTLE_MS);
}
