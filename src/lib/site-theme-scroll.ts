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
  let frame = 0;

  const paint = () => {
    frame = 0;
    const start = inFlowTop(section);
    const next = nextTrack(section);
    const nextTop = next ? inFlowTop(next) : start + Math.max(section.offsetHeight, window.innerHeight);
    const pinned =
      getComputedStyle(section).position === "sticky" ||
      section.classList.contains("scroll-chapter");
    const end = pinned ? nextTop - window.innerHeight : nextTop;
    const span = Math.max(1, end - start);
    const raw = (window.scrollY - start) / span;
    const t = Math.min(1, Math.max(0, raw));
    root.style.setProperty("--wf-p", t.toFixed(4));
    root.querySelectorAll<HTMLElement>("[data-lit]").forEach((node) => {
      const lit = Number(node.dataset.lit);
      node.classList.toggle("is-lit", t >= lit);
    });
  };

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(paint);
  };

  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}
