"use client";

import { cn } from "@/lib/utils";
import { useState, type MouseEvent } from "react";
import { motion, type Variants } from "motion/react";

type EdgeLink = { label: string; href: string; external?: boolean };

const PAGE_LINKS: EdgeLink[] = [
  { label: "Selected work", href: "#work" },
  { label: "Systems", href: "#journal" },
  { label: "Tools stack", href: "#resume" },
  { label: "Team", href: "#features" },
  { label: "Client reviews", href: "#reviews" },
];

const CONTACT_LINKS: EdgeLink[] = [
  { label: "Book a consult", href: "mailto:hello@autoany.io" },
  { label: "hello@autoany.io", href: "mailto:hello@autoany.io" },
  {
    label: "Available for builds",
    href: "mailto:hello@autoany.io?subject=Project%20inquiry",
  },
];

const PARTNERSHIP_POINTS = [
  {
    title: "Collaborative Approach",
    copy: "We integrate with your existing team and workflows, not replace them.",
  },
  {
    title: "Knowledge Transfer",
    copy: "Your team learns to maintain and scale automations independently.",
  },
  {
    title: "Long-term Support",
    copy: "Ongoing partnership for continuous optimization and growth.",
  },
] as const;

const SOCIAL_LINKS: EdgeLink[] = [
  { label: "X", href: "https://x.com", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com", external: true },
  { label: "GitHub", href: "https://github.com", external: true },
];

function jumpHash(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  event.preventDefault();
  window.dispatchEvent(
    new CustomEvent("site-scroll-to", { detail: href.slice(1) }),
  );
}

const CARD_SPACING = 32;

type HeroCard = {
  activeSrc: string;
  left: string;
  /** Section id on the page - click scrolls here. */
  sectionId: string;
  label: string;
  showIdleSwap?: boolean;
  className?: string;
};

const HERO_CARDS: HeroCard[] = [
  // Left → right: Reviews … Home (first page on the right)
  {
    activeSrc: "/assets/fey/card-05-reviews.png",
    left: "left-[32px]",
    sectionId: "reviews",
    label: "Client reviews",
  },
  {
    activeSrc: "/assets/fey/card-04-stack.png",
    left: "left-[64px]",
    sectionId: "resume",
    label: "Tools stack",
  },
  {
    activeSrc: "/assets/fey/card-03-systems.png",
    left: "left-[96px]",
    sectionId: "journal",
    label: "Systems",
  },
  {
    activeSrc: "/assets/fey/card-02-work.png",
    left: "left-[128px]",
    sectionId: "work",
    label: "Selected work",
  },
  {
    activeSrc: "/assets/fey/card-01-home.png",
    left: "left-[160px]",
    sectionId: "home",
    label: "Home",
    className: "transition-opacity duration-300",
  },
];

type SpringConfig = {
  type: "spring";
  bounce?: number;
  visualDuration?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
};

const defaultSpring: SpringConfig = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.2,
};

export interface FeyCardsProps {
  spring?: SpringConfig;
  shiftDistance?: number;
  swapDuration?: number;
  entranceStagger?: number;
}

export const controls = {
  spring: defaultSpring,
  shiftDistance: [60, 0, 200, 5],
  swapDuration: [0.5, 0, 2, 0.05],
  entranceStagger: [0.1, 0, 0.5, 0.01],
};

function jumpToSection(sectionId: string) {
  window.dispatchEvent(
    new CustomEvent("site-scroll-to", {
      detail: { id: sectionId, duration: 1.35 },
    }),
  );
}

export const FeyCards = ({
  spring = defaultSpring,
  shiftDistance = 60,
  swapDuration = 0.5,
  entranceStagger = 0.2,
}: FeyCardsProps = {}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [flyingIndex, setFlyingIndex] = useState<number | null>(null);
  const isHovered = activeIndex !== null;
  const swapStyle = { transitionDuration: `${swapDuration}s` };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: entranceStagger,
        staggerDirection: -1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: (offset: number) => ({ x: offset }),
    visible: { x: 0, transition: spring },
  };

  function openCard(index: number, sectionId: string) {
    if (flyingIndex !== null) return;
    setActiveIndex(index);
    setFlyingIndex(index);
    window.setTimeout(() => {
      jumpToSection(sectionId);
      window.setTimeout(() => setFlyingIndex(null), 400);
    }, 280);
  }

  const year = new Date().getFullYear();

  return (
    <div
      id="contact"
      className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-black"
    >
      {/* Edge information - does not alter the card cluster */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute top-0 inset-x-0 flex items-start justify-between gap-8 px-5 pt-6 sm:px-8 md:px-10 md:pt-8 lg:px-14">
          <div className="max-w-[min(100%,22rem)] md:max-w-[24rem]">
            <h2 className="max-w-[16ch] text-[1.65rem] leading-[1.12] tracking-tight text-white md:text-[2rem] lg:text-[2.25rem]">
              The best automation systems are built{" "}
              <span className="font-display italic">side by side.</span>
            </h2>
            <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-white/45 md:mt-4 md:text-[0.9375rem]">
              Partnership, not just service. We work alongside your team to
              ensure every automation solution perfectly fits your unique
              business needs.
            </p>
            <ul className="mt-6 hidden space-y-4 border-l border-white/15 pl-4 md:mt-8 md:block">
              {PARTNERSHIP_POINTS.map((point) => (
                <li key={point.title}>
                  <p className="text-[0.8125rem] font-medium tracking-tight text-white/85">
                    {point.title}
                  </p>
                  <p className="mt-1 text-[0.75rem] leading-snug text-white/40">
                    {point.copy}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <a
            href="mailto:hello@autoany.io"
            className="shrink-0 text-[0.75rem] tracking-wide text-white/50 transition-colors hover:text-white"
          >
            hello@autoany.io
          </a>
        </div>

        <nav
          aria-label="Contact"
          className="pointer-events-auto absolute top-1/2 right-5 hidden w-40 -translate-y-1/2 text-right lg:block lg:right-10 xl:right-14"
        >
          <p className="mb-3 text-[0.625rem] font-semibold tracking-[0.18em] text-white/40 uppercase">
            Contact
          </p>
          <ul className="space-y-2">
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[0.8125rem] text-white/45 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 md:px-10 md:pb-8 lg:px-14">
          <div>
            <p className="text-[0.75rem] text-white/35">
              © AutoAny {year}. All rights reserved.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 lg:hidden">
              {PAGE_LINKS.slice(0, 3).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => jumpHash(event, link.href)}
                  className="text-[0.6875rem] text-white/40 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[0.75rem] text-white/40 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex select-none justify-center overflow-hidden"
          aria-hidden
        >
          <span className="translate-y-[48%] font-display text-[clamp(4rem,18vw,12rem)] leading-none tracking-tight text-white/[0.04] italic whitespace-nowrap">
            AutoAny
          </span>
        </div>
      </div>

      <div className="relative z-20">
        <motion.h1
          key="solid"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 z-50 mx-auto w-fit -translate-x-1/2 -translate-y-1/2 text-center text-xl font-bold tracking-tight whitespace-nowrap md:text-5xl",
            "bg-clip-text py-4 text-transparent transition-all duration-500",
            "bg-[linear-gradient(to_right,white_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.2)_80%,white_100%)]",
          )}
        >
          Automate everything. Achieve anything.
        </motion.h1>
        <motion.h1
          key="gradient"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 0 : 1,
          }}
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 z-50 mx-auto w-fit -translate-x-1/2 -translate-y-1/2 text-center text-xl font-bold tracking-tight whitespace-nowrap md:text-5xl",
            "bg-clip-text py-4 text-transparent transition-all duration-500",
            "bg-[linear-gradient(to_right,white,white)]",
          )}
        >
          Automate everything. Achieve anything.
        </motion.h1>
        <motion.div
          className="relative flex h-120 w-96 mask-b-from-10%"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <img
            src="/assets/fey/main.webp"
            alt="Hero"
            width={1000}
            height={1000}
            className="absolute inset-y-0 left-0 h-120 w-40 object-contain"
          />

          {HERO_CARDS.map((card, index) => {
            const shouldShift = activeIndex !== null && index > activeIndex;
            const isActive = activeIndex === index;
            const isFlying = flyingIndex === index;
            const entranceOffset = -index * CARD_SPACING;
            return (
              <motion.div
                key={card.activeSrc}
                role="link"
                tabIndex={0}
                aria-label={`Open ${card.label}`}
                className={`group absolute -bottom-2 ${card.left} z-20 h-120 w-40 cursor-pointer ${card.className ?? ""}`}
                variants={cardVariants}
                custom={entranceOffset}
                onMouseEnter={() => {
                  if (flyingIndex === null) setActiveIndex(index);
                }}
                onMouseLeave={() => {
                  if (flyingIndex === null) setActiveIndex(null);
                }}
                onClick={() => openCard(index, card.sectionId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openCard(index, card.sectionId);
                  }
                }}
              >
                <motion.div
                  className="relative h-full w-full"
                  animate={
                    isFlying
                      ? {
                          x: shouldShift ? shiftDistance : 0,
                          scale: 1.12,
                          y: -28,
                          zIndex: 40,
                        }
                      : {
                          x: shouldShift ? shiftDistance : 0,
                          scale: 1,
                          y: 0,
                          zIndex: 20,
                        }
                  }
                  transition={
                    isFlying
                      ? { type: "spring", stiffness: 260, damping: 22 }
                      : spring
                  }
                >
                  {card.showIdleSwap !== false ? (
                    <>
                      <img
                        src={card.activeSrc}
                        alt={card.label}
                        width={1000}
                        height={1000}
                        style={swapStyle}
                        className={cn(
                          "absolute inset-0 aspect-9/16 h-full w-full object-contain opacity-0 transition-opacity group-hover:opacity-100",
                          isActive && "opacity-100",
                        )}
                      />
                      <img
                        src="/assets/fey/idle.webp"
                        alt=""
                        width={1000}
                        height={1000}
                        style={swapStyle}
                        className={cn(
                          "absolute inset-0 aspect-9/16 h-full w-full object-contain opacity-100 transition-opacity group-hover:opacity-0",
                          isActive && "opacity-0",
                        )}
                      />
                      <div className="absolute top-8 left-2 z-50 h-full w-4 bg-black blur-md" />
                    </>
                  ) : (
                    <img
                      src={card.activeSrc}
                      alt={card.label}
                      width={1000}
                      height={1000}
                      style={swapStyle}
                      className="absolute inset-0 aspect-9/16 h-full w-full object-contain transition-opacity"
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default FeyCards;
