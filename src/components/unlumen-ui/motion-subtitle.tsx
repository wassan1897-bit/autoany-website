"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";

export interface MotionSubtitleProps {
  text: string;
  className?: string;
  direction?: "top" | "bottom";
  speed?: number;
  stagger?: number;
}

export function MotionSubtitle({
  text,
  className,
  direction = "top",
  speed = 1,
  stagger = 0.018,
}: MotionSubtitleProps) {
  const chars = Array.from(text);
  const safeSpeed = Math.min(3, Math.max(0.3, speed));
  const speedFactor = 1 / safeSpeed;
  const safeStagger = Math.min(0.08, Math.max(0, stagger));
  const directionY = direction === "bottom" ? 10 : -10;
  const exitY = direction === "bottom" ? -3 : 3;

  return (
    <span
      className={cn(
        "inline-flex min-h-[1.3em] items-center justify-center",
        className,
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          className="inline-flex whitespace-nowrap"
          initial={{ opacity: 0, y: directionY * 0.8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: exitY }}
          transition={{ duration: 0.28 * speedFactor, ease: "easeOut" }}
        >
          {chars.map((char, index) => (
            <motion.span
              key={`${text}-${index}`}
              className="inline-block"
              initial={{ opacity: 0, y: directionY }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: exitY }}
              transition={{
                duration: 0.24 * speedFactor,
                ease: "easeOut",
                delay: index * safeStagger * speedFactor,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default MotionSubtitle;
