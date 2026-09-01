import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type PageStackProps = {
  children: ReactNode;
  z?: number;
  className?: string;
  spacer?: boolean;
};

/**
 * Full-page sticky stack - same idea as gate → Selected work.
 * Next page slides up over the previous. No negative-margin overlap,
 * no overflow:hidden clipping of the page itself.
 */
export default function PageStack({
  children,
  z = 1,
  className,
  spacer = true,
}: PageStackProps) {
  return (
    <div
      className={cn("sticky top-0 h-svh w-full bg-black/40 backdrop-blur-md", spacer && "mb-[75vh]", className)}
      style={{ zIndex: z }}
    >
      <div className="surface-dark h-full w-full overflow-y-auto overscroll-contain bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
