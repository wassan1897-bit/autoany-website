import { useEffect, useRef, useState, type ReactNode } from "react";
import { onScrollFrame } from "../lib/scroll-bus";

type DeferredSectionProps = {
  children: ReactNode;
  /** Minimum wait after mount before showing (ms). */
  delay?: number;
  minHeight?: string;
  /**
   * Hold hydration until this section (e.g. `#work`) has mostly scrolled past.
   */
  waitUntilBelow?: string;
};

function pastScrollGate(waitUntilBelow?: string) {
  if (!waitUntilBelow) return true;
  const anchor = document.getElementById(waitUntilBelow);
  if (!anchor) return true;
  return anchor.getBoundingClientRect().bottom < window.innerHeight * 0.55;
}

export default function DeferredSection({
  children,
  delay = 0,
  minHeight = "50vh",
  waitUntilBelow,
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;

    let done = false;
    const open = () => {
      if (done) return;
      if (!pastScrollGate(waitUntilBelow)) return;
      done = true;
      setShow(true);
    };

    const timers: number[] = [];
    if (delay > 0) timers.push(window.setTimeout(open, delay));
    timers.push(window.setTimeout(open, delay + 2800));

    const node = ref.current;
    const io =
      node &&
      new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) open();
        },
        { rootMargin: "0px 0px 120px 0px", threshold: 0 },
      );
    if (node && io) io.observe(node);

    const unsubscribeScroll = waitUntilBelow
      ? onScrollFrame(() => {
          if (!done) open();
        })
      : undefined;

    const idleId =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(open, { timeout: Math.max(600, delay + 1200) })
        : null;

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      io?.disconnect();
      if (idleId) cancelIdleCallback(idleId);
      unsubscribeScroll?.();
    };
  }, [delay, show, waitUntilBelow]);

  return (
    <div ref={ref} style={{ minHeight }}>
      {show ? children : null}
    </div>
  );
}
