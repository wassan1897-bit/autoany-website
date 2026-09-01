type LiveOpts = {
  /** Sticky stacks: a following painted sibling that enters the viewport covers this one. */
  coverNext?: boolean;
  /** Fraction of the viewport. Next sibling `top` below this means covered. */
  coverAt?: number;
  rootMargin?: string;
  /** Toggle `data-live` / `.is-paused-live` on this node. Default true. */
  mark?: boolean;
};

function paintedNext(node: HTMLElement) {
  let next = node.nextElementSibling as HTMLElement | null;
  while (
    next &&
    (next.getAttribute("aria-hidden") === "true" || next.offsetHeight === 0)
  ) {
    next = next.nextElementSibling as HTMLElement | null;
  }
  return next;
}

function inViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return rect.bottom > 40 && rect.top < vh - 40;
}

/** Pause work when a section leaves (or is covered). Restarts when it returns. */
export function bindLiveSection(
  el: Element,
  onChange?: (live: boolean) => void,
  opts: LiveOpts = {},
) {
  const node = el as HTMLElement;
  let live: boolean | null = null;

  const apply = () => {
    const hidden = document.hidden;
    let covered = false;
    if (opts.coverNext) {
      const next = paintedNext(node);
      const limit = (opts.coverAt ?? 0.08) * (window.innerHeight || 1);
      if (next) covered = next.getBoundingClientRect().top < limit;
    }
    const nextLive = inViewport(node) && !covered && !hidden;
    if (nextLive === live) return;
    live = nextLive;
    if (opts.mark !== false) {
      node.dataset.live = live ? "on" : "off";
      node.classList.toggle("is-paused-live", !live);
    }
    onChange?.(live);
  };

  const io = new IntersectionObserver(
    () => {
      apply();
    },
    { rootMargin: opts.rootMargin ?? "10% 0px", threshold: 0 },
  );
  io.observe(node);

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      apply();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", apply);
  apply();

  return () => {
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", apply);
    if (raf) cancelAnimationFrame(raf);
  };
}
