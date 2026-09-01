import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import "./FlowFeatures.css";

const BG = "/assets/studio-backdrop.png";

type Feature = {
  id: string;
  title: string;
  description: string;
  poster: string;
  video?: string;
  icon: "ease" | "start" | "focus";
};

const FEATURES: Feature[] = [
  {
    id: "flow-ease",
    title: "Built for ease, not urgency",
    description:
      "Drift strips away the noise that makes organizing feel draining. Every surface is made to be soft, quiet, and intuitive so you can move forward, not get stuck decoding.",
    poster: "/assets/work/01-studio.jpg",
    icon: "ease",
  },
  {
    id: "flow-start",
    title: "The gentlest way to start",
    description:
      "The first step should feel natural, not daunting. Intake, follow-up, and the first message already waiting - not another blank dashboard to decode.",
    poster: "/assets/work/03-intake.jpg",
    icon: "start",
  },
  {
    id: "flow-focus",
    title: "Deep, undivided focus",
    description:
      "No interruptions. No clutter. The pipes run in the background so you can stay on the one thing that actually needs a human.",
    poster: "/assets/work/06-data.jpg",
    icon: "focus",
  },
];

export default function FlowFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeId, setActiveId] = useState(FEATURES[0].id);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (!cards.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      for (const card of cards) card.classList.add("is-in");
    }

    const revealObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-in");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    const syncActive = () => {
      const lock = window.innerHeight * 0.42;
      let best = FEATURES[0].id;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.bottom < 96 || rect.top > window.innerHeight - 64) continue;
        const dist = Math.abs(rect.top + rect.height * 0.35 - lock);
        if (dist < bestDist) {
          bestDist = dist;
          best = card.id;
        }
      }
      setActiveId((prev) => (prev === best ? prev : best));
    };

    for (const card of cards) revealObs.observe(card);
    syncActive();
    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);

    return () => {
      revealObs.disconnect();
      window.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, []);

  const jumpTo = (id: string) => {
    window.dispatchEvent(
      new CustomEvent("site-scroll-to", { detail: { id, center: true } }),
    );
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="flow-heading"
      className="flow-features relative isolate font-[family-name:var(--font-body)]"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="sticky top-0 h-screen w-full">
          <img
            src={BG}
            alt=""
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1C1B17]/55" />
        </div>
      </div>

      <div className="px-5 py-20 md:px-10 md:py-40 lg:px-16 lg:py-0">
        <div className="grid grid-cols-1 items-start gap-12 md:gap-16 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-24 xl:grid-cols-[460px_minmax(0,1fr)] xl:gap-48">
          <aside className="flex flex-col gap-10 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:justify-between lg:py-16">
            <div>
              <a
                href="#journal"
                aria-label="Back to systems"
                className="mb-8 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                onClick={(event) => {
                  event.preventDefault();
                  window.dispatchEvent(new CustomEvent("site-scroll-to", { detail: "journal" }));
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M10 3.5 5.5 8 10 12.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <h2
                id="flow-heading"
                className="text-[clamp(2.25rem,3.6vw,2.875rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-white lg:text-[46px]"
              >
                Software that flows with your mind, not over it
              </h2>

              <nav aria-label="Features" className="mt-10 flex flex-col items-start gap-2">
                {FEATURES.map((feature) => {
                  const active = feature.id === activeId;
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => jumpTo(feature.id)}
                      className={cn(
                        "max-w-full cursor-pointer rounded-2xl px-4 py-2.5 text-left text-[15px] leading-snug font-medium tracking-[-0.015em]",
                        "bg-black/20 backdrop-blur-sm transition-[color,background-color] duration-300",
                        "focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none",
                        active ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70",
                      )}
                    >
                      {feature.title}
                    </button>
                  );
                })}
              </nav>
            </div>

            <Cta className="hidden lg:block" />
          </aside>

          <div className="flex flex-col gap-8 md:gap-12 lg:gap-14 lg:py-48">
            {FEATURES.map((feature, index) => (
              <article
                key={feature.id}
                id={feature.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className="flow-card rounded-[32px] bg-white/[0.05] p-6 backdrop-blur-md md:rounded-[40px] md:p-10"
              >
                <FeatureIcon name={feature.icon} />
                <h3 className="mt-5 text-[22px] leading-snug font-medium tracking-[-0.02em] text-white md:text-2xl">
                  {feature.title}
                </h3>
                <div className="mt-6 overflow-hidden rounded-2xl bg-black/25 md:rounded-[22px]">
                  <FeatureMedia feature={feature} />
                </div>
                <p className="mt-6 max-w-[54ch] text-[13px] leading-[1.7] text-white/60 md:text-[14px]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <Cta className="max-w-sm lg:hidden" />
        </div>
      </div>
    </section>
  );
}

function Cta({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-[22rem]", className)}>
      <p className="text-sm leading-relaxed text-white/80">
        No noise. No complicated systems. Just your day, gently sorted.
      </p>
      <a
        href="#contact"
        className="mt-5 inline-flex h-10 cursor-pointer items-center rounded-full bg-white px-5 text-[13px] font-medium text-black transition-colors duration-200 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        onClick={(event) => {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("site-scroll-to", { detail: "contact" }));
        }}
      >
        Start for free
      </a>
    </div>
  );
}

function FeatureMedia({ feature }: { feature: Feature }) {
  if (feature.video) {
    return (
      <video
        className="aspect-video w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={feature.poster}
        aria-label={feature.title}
      >
        <source src={feature.video} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      src={feature.poster}
      alt=""
      width={1600}
      height={900}
      loading="lazy"
      decoding="async"
      className="aspect-video w-full object-cover"
    />
  );
}

function FeatureIcon({ name }: { name: Feature["icon"] }) {
  const common = {
    width: 40,
    height: 40,
    viewBox: "0 0 40 40",
    fill: "none",
    "aria-hidden": true as const,
  };

  if (name === "ease") {
    return (
      <svg {...common}>
        <rect x="7" y="7" width="11" height="11" rx="3" fill="white" fillOpacity="0.86" />
        <rect x="22" y="7" width="11" height="11" rx="3" fill="white" fillOpacity="0.86" />
        <rect x="7" y="22" width="11" height="11" rx="3" fill="white" fillOpacity="0.86" />
        <rect x="22" y="22" width="11" height="11" rx="3" fill="white" fillOpacity="0.86" />
      </svg>
    );
  }

  if (name === "start") {
    return (
      <svg {...common}>
        <path
          d="M12 20h16M22 14l6 6-6 6"
          stroke="white"
          strokeOpacity="0.86"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="20" cy="20" r="7" stroke="white" strokeOpacity="0.86" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="14.5" stroke="white" strokeOpacity="0.35" strokeWidth="1.4" />
    </svg>
  );
}
