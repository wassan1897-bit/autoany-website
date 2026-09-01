import { cn } from "../lib/cn";
import {
  HOMEPAGE_MARQUEE,
  TOOL_MARKS,
  type MarqueeToolId,
} from "../lib/stack-icons";

type MarqueeSize = "hud" | "panel";

function loopTools(ids: readonly MarqueeToolId[], min = 14) {
  const base = [...ids];
  while (base.length < min) base.push(...ids);
  return [...base, ...base];
}

export function MarqueeRow({
  tools,
  direction,
  size = "panel",
  className,
}: {
  tools: readonly MarqueeToolId[];
  direction: "left" | "right";
  size?: MarqueeSize;
  className?: string;
}) {
  const unique = tools.length;
  const loop = loopTools(tools);

  return (
    <div
      className={cn(
        "workflow-marquee-row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "workflow-marquee-track flex w-max",
          direction === "left"
            ? "animate-marquee-left"
            : "animate-marquee-right",
          size === "hud" ? "gap-1.5 md:gap-2" : "gap-2",
        )}
      >
        {loop.map((id, i) => {
          const tile = TOOL_MARKS[id];
          const isClone = i >= unique;
          return (
            <span
              key={`${direction}-${id}-${i}`}
              title={isClone ? undefined : tile.label}
              aria-hidden={isClone}
              className={cn(
                "flex shrink-0 cursor-default items-center justify-center rounded-xl transition-transform duration-200 hover:scale-110",
                size === "hud"
                  ? "stack-tile h-10 w-10 sm:h-11 sm:w-11 md:h-14 md:w-14"
                  : "liquid-glass h-14 w-14 text-white/85 md:h-16 md:w-16",
              )}
            >
              <tile.Icon
                className={cn(
                  size === "hud"
                    ? "h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]"
                    : "h-5 w-5",
                )}
                strokeWidth={1.5}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function WorkflowLogoMarquee({
  size = "hud",
  className,
}: {
  size?: MarqueeSize;
  className?: string;
}) {
  return (
    <div
      className={cn("workflow-marquee pointer-events-auto", className)}
      aria-label="Tools wired across AutoAny systems"
    >
      <MarqueeRow
        tools={HOMEPAGE_MARQUEE.top}
        direction="left"
        size={size}
      />
      <MarqueeRow
        tools={HOMEPAGE_MARQUEE.bottom}
        direction="right"
        size={size}
        className="mt-1.5 md:mt-2"
      />
    </div>
  );
}
