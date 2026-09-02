type Listener = () => void;

const listeners = new Set<Listener>();
let frame = 0;
let bound = false;

/**
 * One `scroll`/`resize` listener for the whole app, flushed once per frame.
 *
 * Every section used to attach its own passive scroll handler; a dozen of them
 * each doing their own layout reads is what turned scrolling into a stutter.
 * Subscribers here are batched into a single rAF callback.
 */
function flush() {
  frame = 0;
  for (const listener of listeners) listener();
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(flush);
}

function bind() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", schedule);
}

/** Subscribe to a coalesced scroll/resize/visibility tick. */
export function onScrollFrame(listener: Listener): () => void {
  bind();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Run the subscribers on the next frame without waiting for user scroll. */
export function pokeScrollFrame() {
  schedule();
}
