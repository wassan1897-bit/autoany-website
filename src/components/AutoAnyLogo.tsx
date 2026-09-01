import type { MouseEvent } from "react";
import { cn } from "../lib/cn";

type AutoAnyLogoProps = {
  className?: string;
  onJumpHome: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export default function AutoAnyLogo({ className, onJumpHome }: AutoAnyLogoProps) {
  return (
    <a
      href="#home"
      className={cn("nk-brand", className)}
      aria-label="AutoAny home"
      onClick={onJumpHome}
    >
      <span className="nk-brand-lockup">
        <svg
          className="nk-brand-mark"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="none"
          aria-hidden
        >
          <path
            className="nk-brand-plate"
            d="M16 2.2 L27.9 9.05 V22.95 L16 29.8 L4.1 22.95 V9.05 Z"
            fill="currentColor"
          />
          <path
            className="nk-brand-a"
            fill="currentColor"
            fillRule="evenodd"
            d="M16 8.4 L24.85 25.2 H21.15 L19.55 21.35 H12.45 L10.85 25.2 H7.15 L16 8.4 ZM16 13.35 L13.55 19.05 H18.45 L16 13.35 Z"
          />
          <path
            className="nk-brand-mark-stroke"
            pathLength={100}
            d="M16 2.2 L27.9 9.05 V22.95 L16 29.8 L4.1 22.95 V9.05 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle className="nk-brand-rivet" cx="16" cy="4.55" r="1.35" fill="currentColor" />
        </svg>
        <span className="nk-brand-word">AutoAny</span>
        <span className="nk-brand-flash" aria-hidden>
          <span className="nk-brand-flash-bar" />
        </span>
      </span>
    </a>
  );
}
