import { onScrollFrame } from "./scroll-bus";

function isFiller(el: HTMLElement) {
  return el.getAttribute("aria-hidden") === "true" && !el.id;
}

function inFlowTop(el: HTMLElement): number {
  if (getComputedStyle(el).position === "sticky") {
    const next = el.nextElementSibling as HTMLElement | null;
    if (next) return inFlowTop(next) - el.offsetHeight;
  }
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    if (getComputedStyle(node).position !== "sticky") y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

function nextTrack(el: HTMLElement) {
  let node = el.nextElementSibling as HTMLElement | null;
  while (node && isFiller(node)) {
    node = node.nextElementSibling as HTMLElement | null;
  }
  return node;
}

export function bindWorkflowProgress(root: HTMLElement) {
  const section =
    (root.closest(".scroll-chapter") as HTMLElement | null) ??
    (root.closest("section") as HTMLElement | null) ??
    root;

  /**
   * Geometry is measured lazily and reused until the viewport changes.
   *
   * `inFlowTop` walks the offsetParent chain calling `getComputedStyle` on every
   * ancestor; running that twice per scroll frame was pure layout thrash for
   * numbers that only move on resize.
   */
  let cache: { start: number; span: number; key: string } | null = null;

  const measure = () => {
    const key = `${window.innerWidth}x${window.innerHeight}x${document.body.scrollHeight}`;
    if (cache && cache.key === key) return cache;
    const start = inFlowTop(section);
    const next = nextTrack(section);
    const nextTop = next
      ? inFlowTop(next)
      : start + Math.max(section.offsetHeight, window.innerHeight);
    const pinned =
      getComputedStyle(section).position === "sticky" ||
      section.classList.contains("scroll-chapter");
    const end = pinned ? nextTop - window.innerHeight : nextTop;
    cache = { start, span: Math.max(1, end - start), key };
    return cache;
  };

  const paint = () => {
    const { start, span } = measure();
    const raw = (window.scrollY - start) / span;
    const t = Math.min(1, Math.max(0, raw));
    root.style.setProperty("--wf-p", t.toFixed(4));
    root.querySelectorAll<HTMLElement>("[data-lit]").forEach((node) => {
      const lit = Number(node.dataset.lit);
      node.classList.toggle("is-lit", t >= lit);
    });
  };

  paint();
  return onScrollFrame(paint);
}
