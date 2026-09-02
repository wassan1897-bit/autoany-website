import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { cn } from "../../lib/cn";
import { bestRasterSrc } from "../../lib/picture";

export type HoverExpandItem = {
  label: string;
  /** e.g. country, year, category */
  sublabel?: string;
  image: string;
  imageAlt?: string;
  /** short descriptor shown when expanded */
  description?: string;
  /** CSS object-position for the hover crop, e.g. "80% 50%" */
  objectPosition?: string;
  /** Where the label sits when the row is expanded. @default "top" */
  headingPlacement?: "top" | "bottom";
  /** Opens this route on click / Enter */
  href?: string;
  /** object-fit when expanded. Collapsed rows always cover. @default "cover" */
  expandedFit?: "cover" | "contain";
  /** Hide Inter chrome when expanded so baked HUD type is the only voice. */
  hideExpandedChrome?: boolean;
  /** Override row height when expanded. */
  expandedHeight?: number;
};

export type HoverExpandProps = {
  items: HoverExpandItem[];
  /**
   * Row height when collapsed, in pixels.
   * @default 68
   */
  collapsedHeight?: number;
  /**
   * Row height when expanded, in pixels.
   * @default 320
   */
  expandedHeight?: number;
  className?: string;
};

const HEIGHT_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 32,
  mass: 0.9,
};

const IMAGE_SPRING = {
  type: "spring" as const,
  stiffness: 120,
  damping: 22,
  mass: 1.1,
};

const REVEAL_EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

function subscribeFinePointer(onStoreChange: () => void) {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function HoverExpand({
  items,
  collapsedHeight = 68,
  expandedHeight = 320,
  className,
}: HoverExpandProps) {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const canFineHover = React.useSyncExternalStore(
    subscribeFinePointer,
    getFinePointer,
    () => false,
  );

  const rootRef = React.useRef<HTMLDivElement>(null);

  /**
   * Warm the expanded stills, but only once the rows are near the viewport and
   * the browser is idle. Preloading all ten on mount put ~600KB in front of the
   * first paint for a section that is well below the fold.
   */
  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    let idleId: number | null = null;
    const warm = () => {
      items.forEach((item) => {
        const img = new Image();
        img.src = bestRasterSrc(item.image);
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        idleId =
          typeof requestIdleCallback !== "undefined"
            ? requestIdleCallback(warm, { timeout: 2000 })
            : window.setTimeout(warm, 200);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (idleId !== null) {
        if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, [items]);

  const openRow = (index: number) => {
    setHoveredIndex(index);
  };

  const closeRow = () => setHoveredIndex(null);

  const toggleRow = (index: number) => {
    if (hoveredIndex === index) closeRow();
    else openRow(index);
  };

  return (
    <div ref={rootRef} role="list" className={cn("w-full", className)}>
      {items.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const isOtherHovered = hoveredIndex !== null && !isHovered;
        const headingBottom = item.headingPlacement === "bottom";
        const rowExpandedHeight = item.expandedHeight ?? expandedHeight;
        const hideChrome = Boolean(isHovered && item.hideExpandedChrome);
        const containHud = Boolean(isHovered && item.expandedFit === "contain");

        return (
          <React.Fragment key={`${item.label}-${i}`}>
            <motion.div
              role="listitem"
              tabIndex={0}
              aria-expanded={isHovered}
              aria-label={
                item.href ? `${item.label}, open page` : item.label
              }
              className={cn(
                "relative w-full cursor-pointer overflow-hidden",
                containHud && "bg-black",
              )}
              initial={false}
              animate={{
                height: isHovered ? rowExpandedHeight : collapsedHeight,
                opacity: isOtherHovered && canFineHover ? 0.38 : 1,
              }}
              transition={{
                height: HEIGHT_SPRING,
                opacity: { duration: 0.22, ease: "easeOut" },
              }}
              onHoverStart={() => canFineHover && openRow(i)}
              onHoverEnd={() => canFineHover && closeRow()}
              onPointerEnter={() => {
                const img = new Image();
                img.src = bestRasterSrc(item.image);
              }}
              onFocus={() => openRow(i)}
              onBlur={() => canFineHover && closeRow()}
              onClick={() => {
                if (!canFineHover) {
                  toggleRow(i);
                  return;
                }
                if (item.href) navigate(item.href);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setHoveredIndex(null);
                  event.currentTarget.blur();
                }
                if (
                  item.href &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  if (!canFineHover && hoveredIndex !== i) {
                    openRow(i);
                    return;
                  }
                  navigate(item.href);
                }
              }}
            >
              <motion.span
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left bg-white/70"
                initial={false}
                animate={{
                  scaleX: isHovered ? 1 : 0,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: isHovered ? 0.08 : 0,
                  ease: REVEAL_EASE,
                }}
                aria-hidden
              />

              <motion.div
                className="pointer-events-none absolute inset-0 h-full w-full"
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 1.12,
                  y: isHovered ? 0 : 10,
                }}
                transition={{
                  opacity: { duration: 0.4, ease: REVEAL_EASE },
                  scale: IMAGE_SPRING,
                  y: IMAGE_SPRING,
                }}
              >
                <motion.img
                  src={bestRasterSrc(item.image)}
                  alt={item.imageAlt ?? ""}
                  className={cn(
                    "h-full w-full",
                    containHud ? "object-contain" : "object-cover",
                  )}
                  style={{ objectPosition: item.objectPosition ?? "50% 50%" }}
                  loading={isHovered ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={isHovered ? "high" : "auto"}
                  initial={false}
                  animate={{
                    scale: containHud || hideChrome ? 1 : isHovered ? 1.04 : 1,
                  }}
                  transition={{
                    duration: containHud || hideChrome ? 0.45 : isHovered ? 8 : 0.5,
                    ease: containHud || hideChrome ? REVEAL_EASE : "linear",
                  }}
                />
                <motion.div
                  className={cn(
                    "absolute inset-0",
                    headingBottom
                      ? "bg-gradient-to-t from-black/75 via-black/20 to-black/25"
                      : "bg-gradient-to-b from-black/70 via-black/20 to-black/45",
                  )}
                  initial={false}
                  animate={{
                    opacity: hideChrome ? 0 : isHovered ? 1 : canFineHover ? 0.4 : 0.22,
                  }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={false}
                  animate={{
                    x: isHovered ? ["-40%", "140%"] : "-40%",
                    opacity: isHovered ? [0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 1.05,
                    delay: isHovered ? 0.18 : 0,
                    ease: REVEAL_EASE,
                    times: [0, 0.45, 1],
                  }}
                  aria-hidden
                />
              </motion.div>

              <motion.div
                className={cn(
                  "relative z-10 flex h-full justify-between px-6",
                  isHovered
                    ? headingBottom
                      ? "items-end pb-7"
                      : "items-start pt-7"
                    : "items-center",
                )}
                initial={false}
                animate={{ opacity: hideChrome ? 0 : 1 }}
                transition={{ duration: 0.28, ease: REVEAL_EASE }}
                aria-hidden={hideChrome}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <motion.span
                    className="shrink-0 text-xs tabular-nums opacity-40"
                    animate={{
                      color: isHovered ? "#ffffff" : "currentColor",
                      opacity: isHovered ? 0.5 : 0.4,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>

                  <motion.span
                    className="min-w-0 truncate font-semibold tracking-tight"
                    style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)" }}
                    animate={{
                      color: isHovered ? "#ffffff" : "currentColor",
                      y: isHovered ? 0 : 0,
                      letterSpacing: isHovered ? "-0.02em" : "0em",
                    }}
                    transition={{ duration: 0.28, ease: REVEAL_EASE }}
                  >
                    {item.label}
                  </motion.span>

                  {item.description && (
                    <motion.span
                      className="hidden overflow-hidden whitespace-nowrap text-sm text-white/70 sm:block"
                      initial={false}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -12,
                        maxWidth: isHovered ? 320 : 0,
                      }}
                      transition={{
                        duration: 0.4,
                        delay: isHovered ? 0.16 : 0,
                        ease: REVEAL_EASE,
                      }}
                    >
                      - {item.description}
                    </motion.span>
                  )}
                </div>

                {item.sublabel && (
                  <motion.span
                    className="shrink-0 text-xs tracking-widest uppercase"
                    animate={{
                      color: isHovered
                        ? "rgba(255,255,255,0.55)"
                        : "currentColor",
                      opacity: isHovered ? 1 : canFineHover ? 0.45 : 0.72,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.sublabel}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>

            {i < items.length - 1 && (
              <div className="h-px w-full bg-stroke" aria-hidden />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
