import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type ScrollChapterProps = {
  children: ReactNode;
  /** Extra scroll while this chapter stays pinned. Ignored when pin is false. */
  span?: number;
  z?: number;
  /** Pull this chapter over the previous one so the last page is covered. */
  overlap?: boolean;
  /**
   * How far to pull over the previous chapter (vh).
   * Keep this shorter than the post-workflow hold on OpeningScroll.
   */
  overlapSpan?: number;
  /** Pin to the viewport. Off for tall sections that still need the cover. */
  pin?: boolean;
  /** Override the chapter surface (default: black). */
  surfaceClassName?: string;
};

export default function ScrollChapter({
  children,
  span = 200,
  z = 1,
  overlap = true,
  overlapSpan = 88,
  pin = true,
  surfaceClassName,
}: ScrollChapterProps) {
  const pull = Math.max(0, Math.min(overlapSpan, 120));

  return (
    <div
      className="scroll-chapter relative"
      style={{
        zIndex: z,
        marginTop: overlap ? `-${pull}vh` : undefined,
        ...(pin ? { height: `${span}vh` } : {}),
      }}
    >
      <div
        className={cn(
          pin
            ? "sticky top-0 h-svh overflow-hidden"
            : "relative",
          surfaceClassName ?? "surface-dark bg-black",
        )}
      >
        {children}
      </div>
    </div>
  );
}
