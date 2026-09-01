"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "../../../lib/cn";

interface ClippedCircleProps {
  className?: string;
  circleClassName?: string;
  circleSize?: number;
}

function ClippedCircle({
  className,
  circleClassName = "bg-white/20",
  circleSize = 400,
}: ClippedCircleProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [position, setPosition] = React.useState({ x: "50%", y: "50%" });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !container.parentElement) return;

    const parent = container.parentElement;
    let hovering = false;
    let raf = 0;
    let nextX = "50%";
    let nextY = "50%";

    const flush = () => {
      raf = 0;
      setPosition({ x: nextX, y: nextY });
    };

    const point = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      nextX = `${((e.clientX - rect.left) / rect.width) * 100}%`;
      nextY = `${((e.clientY - rect.top) / rect.height) * 100}%`;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      hovering = true;
      point(e);
      flush();
      setIsHovered(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!hovering) return;
      point(e);
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const handleMouseLeave = () => {
      hovering = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setIsHovered(false);
    };

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mousemove", handleMouseMove, { passive: true });
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute rounded-full",
          circleClassName,
        )}
        style={{
          left: position.x,
          top: position.y,
          width: circleSize,
          height: circleSize,
          mixBlendMode: "difference",
        }}
        initial={{ scale: 0, x: "-50%", y: "-50%" }}
        animate={{
          scale: isHovered ? 1 : 0,
          x: "-50%",
          y: "-50%",
        }}
        transition={{
          duration: 0.5,
          ease: [0.19, 1, 0.22, 1],
        }}
      />
    </div>
  );
}

export { ClippedCircle, type ClippedCircleProps };
