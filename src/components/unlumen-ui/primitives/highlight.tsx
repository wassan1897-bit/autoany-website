import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/cn";

type Box = { x: number; y: number; w: number; h: number };

type HighlightContextValue = {
  container: HTMLDivElement | null;
  setBox: (box: Box | null) => void;
};

const HighlightContext = createContext<HighlightContextValue | null>(null);

type HighlightProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  style?: CSSProperties;
  mode?: "parent" | "children";
  controlledItems?: boolean;
  hover?: boolean;
};

export function Highlight({
  children,
  className,
  containerClassName,
  style,
}: HighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBoxState] = useState<Box | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const setBox = useCallback((next: Box | null) => {
    setBoxState(next);
  }, []);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainer(node);
  }, []);

  return (
    <HighlightContext.Provider value={{ container, setBox }}>
      <div
        ref={setContainerRef}
        className={cn("relative", containerClassName)}
        onPointerLeave={() => setBox(null)}
      >
        {box && (
          <motion.div
            className={cn("absolute", className)}
            style={{
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              ...style,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            layout
          />
        )}
        {children}
      </div>
    </HighlightContext.Provider>
  );
}

type HighlightItemProps = {
  children: ReactNode;
  asChild?: boolean;
};

export function HighlightItem({ children, asChild }: HighlightItemProps) {
  const ctx = useContext(HighlightContext);
  const itemRef = useRef<HTMLElement | null>(null);

  const activate = () => {
    const node = itemRef.current;
    const parent = ctx?.container;
    if (!node || !parent || !ctx) return;
    const nr = node.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    ctx.setBox({
      x: nr.left - pr.left,
      y: nr.top - pr.top,
      w: nr.width,
      h: nr.height,
    });
  };

  const bind = {
    ref: (node: HTMLElement | null) => {
      itemRef.current = node;
    },
    onPointerEnter: activate,
    onFocus: activate,
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      ...bind,
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        (
          child.props.onPointerEnter as
            | ((e: PointerEvent<HTMLElement>) => void)
            | undefined
        )?.(event);
        activate();
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        (
          child.props.onFocus as
            | ((e: FocusEvent<HTMLElement>) => void)
            | undefined
        )?.(event);
        activate();
      },
    });
  }

  return (
    <div {...bind} className="relative">
      {children}
    </div>
  );
}
