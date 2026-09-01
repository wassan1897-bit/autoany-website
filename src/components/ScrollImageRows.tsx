import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SYSTEMS } from "../lib/systems";
import { bindLiveSection } from "../lib/live-section";
import { bindChapterReveal } from "../lib/chapter-reveal";
import { HoverBorderGradientDemo } from "./hover-border-gradient-demo";
import { useNavigate } from "react-router-dom";

type Workflow = {
  id: string;
  label: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  objectPosition: string;
  fit: "contain" | "cover";
};

const WORK_STILLS: Record<
  string,
  { image: string; objectPosition?: string; fit?: "contain" | "cover" }
> = {
  studio: {
    image: "/assets/systems/01-ai-content-engine.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  sales: {
    image: "/assets/systems/02-sales-follow-up.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  intake: {
    image: "/assets/systems/03-client-onboarding.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  leads: {
    image: "/assets/systems/04-lead-outreach.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  linkedin: {
    image: "/assets/systems/05-linkedin-carousel.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  data: {
    image: "/assets/systems/06-monthly-intake.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  support: {
    image: "/assets/systems/07-multi-agent-support.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  gmail: {
    image: "/assets/systems/09-gmail-triage.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  jobs: {
    image: "/assets/systems/10-job-intake.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
  booking: {
    image: "/assets/systems/11-voice-booking.png",
    objectPosition: "50% 50%",
    fit: "contain",
  },
};

const WORKFLOWS: Workflow[] = SYSTEMS.map((system) => {
  const still = WORK_STILLS[system.slug];
  const photo = system.poster === "photo";
  return {
    id: system.slug,
    label: system.label,
    title: system.label,
    body: system.lede,
    image: still?.image ?? system.image,
    imageAlt: system.imageAlt,
    objectPosition: still?.objectPosition ?? "50% 50%",
    fit: still?.fit ?? (photo ? "cover" : "contain"),
  };
});

const ROW_ONE = WORKFLOWS.slice(0, 6);
const ROW_TWO = WORKFLOWS.slice(6);

function double<T>(items: readonly T[]) {
  return [...items, ...items];
}

const AUTO_SPEED = 36;

function wrap(value: number, width: number) {
  if (width <= 0) return 0;
  return ((value % width) + width) % width;
}

export default function ScrollImageRows() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowOneRef = useRef<HTMLDivElement>(null);
  const rowTwoRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(1);
  const [active, setActive] = useState<Workflow | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const section = sectionRef.current;
    const rowOne = rowOneRef.current;
    const rowTwo = rowTwoRef.current;
    if (!section || !rowOne || !rowTwo) return;

    let raf = 0;
    let auto = 0;
    let last = performance.now();
    let visible = false;

    const paint = (now: number) => {
      raf = 0;
      if (!visible) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) auto += AUTO_SPEED * speedRef.current * dt;

      const progress = auto;
      const w1 = rowOne.scrollWidth / 2;
      const w2 = rowTwo.scrollWidth / 2;
      const p1 = wrap(progress, w1);
      const p2 = wrap(progress, w2);

      rowOne.style.transform = `translate3d(${-w1 + p1}px,0,0)`;
      rowTwo.style.transform = `translate3d(${-p2}px,0,0)`;

      raf = requestAnimationFrame(paint);
    };

    const unbind = bindLiveSection(
      section,
      (live) => {
        visible = live;
        if (live && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(paint);
        }
      },
      { rootMargin: "20% 0px" },
    );

    return () => {
      unbind();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    speedRef.current = active ? 0 : 1;
  }, [active]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const copy = section.querySelector<HTMLElement>("[data-chapter-copy]");
    const body = section.querySelector<HTMLElement>("[data-chapter-body]");
    return bindChapterReveal(section, copy, body);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-labelledby="work-heading"
      className="section-veil surface-dark nk-sheet relative z-10 overflow-hidden bg-black pt-16 pb-12 sm:pt-20 md:pt-24"
      onPointerEnter={() => {
        if (!active) speedRef.current = 0.22;
      }}
      onPointerLeave={() => {
        if (!active) speedRef.current = 1;
      }}
    >
      <div className="relative z-[1] mx-auto mb-10 max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div data-chapter-copy>
          <h2
            id="work-heading"
            className="max-w-[16ch] text-4xl tracking-tight text-text-primary md:text-5xl"
          >
            Selected <span className="font-display italic">work</span>
          </h2>
          <p className="mt-4 max-w-[36rem] text-sm leading-relaxed text-muted md:text-base">
            Systems already in production - open a still to see the workflow.
          </p>
        </div>
      </div>
      <div data-chapter-body className="relative z-[1] flex flex-col gap-8">
        <div
          ref={rowOneRef}
          className="flex flex-nowrap gap-3"
          style={{ willChange: "transform" }}
        >
          {double(ROW_ONE).map((item, i) => (
            <Tile
              key={`one-${item.id}-${i}`}
              item={item}
              onOpen={(workflow) => navigate(`/systems/${workflow.id}`)}
            />
          ))}
        </div>
        <div
          ref={rowTwoRef}
          className="flex flex-nowrap gap-3"
          style={{ willChange: "transform" }}
        >
          {double(ROW_TWO).map((item, i) => (
            <Tile
              key={`two-${item.id}-${i}`}
              item={item}
              onOpen={(workflow) => navigate(`/systems/${workflow.id}`)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-bg/70 p-6 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workflow-title"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex w-full max-w-3xl flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 aspect-[3/2] w-full overflow-hidden rounded-2xl bg-black">
                <img
                  src={active.image}
                  alt=""
                  className={
                    active.fit === "cover"
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-contain"
                  }
                  style={{ objectPosition: active.objectPosition }}
                />
              </div>
              <h3
                id="workflow-title"
                className="mb-3 font-display text-3xl text-text-primary italic md:text-4xl"
              >
                {active.title}
              </h3>
              <p className="mb-8 max-w-md text-sm text-muted md:text-base">
                {active.body}
              </p>
              <HoverBorderGradientDemo />
            </motion.div>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute top-6 right-6 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-stroke bg-surface text-text-primary transition-transform duration-300 hover:rotate-90"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Tile({
  item,
  onOpen,
}: {
  item: Workflow;
  onOpen: (item: Workflow) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="w-[420px] shrink-0 cursor-pointer text-center"
    >
      <div className="h-[280px] w-[420px] overflow-hidden rounded-2xl bg-black">
        <img
          src={item.image}
          alt={item.imageAlt}
          loading="lazy"
          decoding="async"
          className={
            item.fit === "cover"
              ? "h-full w-full object-cover transition-[filter] duration-200"
              : "h-full w-full object-contain transition-[filter] duration-200"
          }
          style={{ objectPosition: item.objectPosition }}
          draggable={false}
        />
      </div>
      <span className="mt-3 block min-h-[2.7em] px-2 font-display text-[1.0625rem] leading-snug text-pretty text-text-primary/95 italic line-clamp-2">
        {item.label}
      </span>
    </button>
  );
}
