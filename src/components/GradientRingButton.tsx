import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type Variant = "solid" | "outline" | "pill";

const INNER_STYLES: Record<Variant, string> = {
  solid:
    "bg-text-primary px-7 py-3.5 text-sm font-medium text-bg group-hover:bg-bg group-hover:text-text-primary",
  outline:
    "border-2 border-stroke bg-bg px-7 py-3.5 text-sm font-medium text-text-primary group-hover:border-transparent",
  pill: "border border-stroke bg-bg px-5 py-2.5 text-sm text-muted group-hover:border-transparent group-hover:text-text-primary",
};

type GradientRingButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  children: ReactNode;
};

export default function GradientRingButton({
  variant = "solid",
  children,
  className = "",
  ...rest
}: GradientRingButtonProps) {
  return (
    <a
      className={cn(
        "group relative inline-flex transition-transform duration-300 hover:scale-105",
        className,
      )}
      {...rest}
    >
      <span
        className="accent-gradient-animated pointer-events-none absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <span
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full transition-colors duration-300",
          INNER_STYLES[variant],
        )}
      >
        {children}
      </span>
    </a>
  );
}
