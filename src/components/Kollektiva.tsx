import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "../lib/scroll-refresh";
import ScrollAtmosphere from "./ScrollAtmosphere";
import { TiltCard } from "./unlumen-ui/tilt-card";
import "./Kollektiva.css";

gsap.registerPlugin(ScrollTrigger);

const DISPLAY =
  "font-display italic text-[clamp(2rem,4vw,3.75rem)] leading-[1.08] tracking-[-0.02em] text-text-primary";

const TEAM_CARDS = [
  {
    title: "Maali Wassan",
    description: "Automation specialist. n8n systems and GHL pipelines that actually run.",
    price: "Lead",
    badgeLabel: "n8n",
    imageSrc: "/assets/maali/home-portrait.png",
    imageAlt: "Portrait of Maali Wassan",
  },
  {
    title: "Haris Wassan",
    description: "Ops partner. CRM, follow-up, and the pipes behind the calls.",
    price: "Ops",
    badgeLabel: "GHL",
    imageSrc: "/assets/haris-portrait.png",
    imageAlt: "Portrait of Haris Wassan",
  },
  {
    title: "Voice pipes",
    description: "Retell agents, intake, and the first message already waiting.",
    price: "Voice",
    badgeLabel: "Retell",
    imageSrc: "/assets/maali/03-olive-smile.webp",
    imageAlt: "Voice systems still",
  },
  {
    title: "Studio engine",
    description: "Research to draft. Tracked, stored, and ready to publish.",
    price: "Studio",
    badgeLabel: "n8n",
    imageSrc: "/assets/maali/04-sunlight.webp",
    imageAlt: "Studio systems still",
  },
] as const;

export default function Kollektiva() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLHeadingElement>(null);
  const rightRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const gate = gateRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const cue = cueRef.current;
    const sheet = sheetRef.current;
    const grid = gridRef.current;
    if (!root || !gate || !left || !right || !cue || !sheet || !grid) return;

    const items = Array.from(grid.children);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set([left, right, cue], { opacity: 1, y: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([left, right, cue], { opacity: 0, y: 40 });
      gsap.set(items, { opacity: 0, y: 48, force3D: false });

      gsap.to(left, {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: gate,
          start: "top 84%",
          endTrigger: sheet,
          end: "top 42%",
          scrub: 1.22,
        },
      });
      gsap.to(cue, {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: gate,
          start: "top 74%",
          endTrigger: sheet,
          end: "top 36%",
          scrub: 1.16,
        },
      });
      gsap.to(right, {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: gate,
          start: "top 72%",
          endTrigger: sheet,
          end: "top 34%",
          scrub: 1.3,
        },
      });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sheet,
          start: "top bottom",
          end: "top 32%",
          scrub: 1.15,
        },
      });
    }, root);

    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative z-10">
      <section
        ref={gateRef}
        id="about"
        aria-labelledby="kollektiva-heading"
        className="sticky top-0 z-0 flex h-screen items-center overflow-hidden bg-transparent px-6 sm:px-10 lg:px-16"
      >
        <ScrollAtmosphere variant="team" />
        <div className="relative z-10 grid w-full grid-cols-1 items-center gap-8 md:grid-cols-3 md:gap-10">
          <h2 ref={leftRef} id="kollektiva-heading" className={`max-w-xl ${DISPLAY}`}>
            Meet the
            <br />
            AutoAny team
          </h2>

          <div
            ref={cueRef}
            className="flex flex-col items-center justify-center text-center"
          >
            <span className="font-display text-lg text-muted italic sm:text-xl">
              Keep scrolling
            </span>
            <span className="gate-scroll-line mt-4 block h-12 w-px bg-text-primary/55" />
          </div>

          <p ref={rightRef} className={`max-w-md md:justify-self-end md:text-right ${DISPLAY}`}>
            Specialists in n8n,
            <br />
            GHL, and automation.
          </p>
        </div>
      </section>

      <div aria-hidden className="pointer-events-none h-screen" />

      <section
        ref={sheetRef}
        id="team"
        aria-label="AutoAny team"
        className="nk-sheet team-sheet relative z-10"
      >
        <div ref={gridRef} className="team-sheet-grid">
          {TEAM_CARDS.map((card) => (
            <TiltCard
              key={card.title}
              title={card.title}
              description={card.description}
              price={card.price}
              badgeLabel={card.badgeLabel}
              badgeVariant="success"
              imageSrc={card.imageSrc}
              imageAlt={card.imageAlt}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
