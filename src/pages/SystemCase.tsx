import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { cn } from "../lib/cn";
import {
  getSystem,
  SYSTEMS,
  type SystemRecord,
  type SystemStackId,
} from "../lib/systems";
import { MarqueeRow } from "../components/WorkflowLogoMarquee";
import PageTransition from "../components/PageTransition";
import NotFound from "./NotFound";
import SecondaryNav from "../components/SecondaryNav";
import { HoverBorderGradientDemo } from "../components/hover-border-gradient-demo";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function SectionLabel({
  children,
  align = "center",
}: {
  children: string;
  align?: "center" | "start";
}) {
  return (
    <p
      className={cn(
        "text-[11px] tracking-[0.22em] text-white/70 uppercase",
        align === "center" ? "text-center" : "text-left",
      )}
    >
      {children}
    </p>
  );
}

function StagePhoto({
  src,
  position = "50% 50%",
  blur = false,
  overlay = "bg-black/60",
}: {
  src: string;
  position?: string;
  blur?: boolean;
  overlay?: string;
}) {
  return (
    <>
      <img
        src={src}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          blur ? "scale-[1.45] blur-[28px]" : "scale-105",
        )}
        style={{ objectPosition: position }}
        aria-hidden
      />
      <div className={cn("absolute inset-0", overlay)} />
    </>
  );
}

function IconMarquee({
  stack,
  direction,
}: {
  stack: SystemStackId[];
  direction: "left" | "right";
}) {
  return (
    <div className="workflow-marquee">
      <MarqueeRow tools={stack} direction={direction} size="panel" />
    </div>
  );
}

function ArchitectureCard({
  system,
  reduced,
}: {
  system: SystemRecord;
  reduced: boolean;
}) {
  const photo = system.poster === "photo";
  const dense = system.steps.length > 5;

  return (
    <motion.article
      className="relative flex min-h-[34rem] flex-col overflow-hidden rounded-2xl bg-black lg:h-full lg:min-h-0"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.2 : 0.55,
        delay: reduced ? 0 : 0.1,
        ease: EASE,
      }}
    >
      <StagePhoto
        src={system.image}
        position={photo ? "50% 72%" : "42% 38%"}
        blur={!photo}
        overlay={photo ? "bg-black/48" : "bg-black/58"}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/86 via-black/28 to-black/36"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col px-5 py-5 md:px-6 md:py-6">
        <SectionLabel>Workflow architecture</SectionLabel>

        <ol className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {system.steps.map((step, i) => (
            <motion.li
              key={step.n}
              className="flex min-h-0 flex-1 gap-3"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0.2 : 0.42,
                delay: reduced ? 0 : 0.18 + i * 0.07,
                ease: EASE,
              }}
            >
              <div className="flex w-7 shrink-0 flex-col items-center">
                <p
                  className="text-[11px] leading-none tracking-[0.18em] tabular-nums"
                  style={{ color: system.accent }}
                >
                  {step.n}
                </p>
                {i < system.steps.length - 1 && (
                  <span
                    className="mt-2 w-px flex-1 bg-white/15"
                    aria-hidden
                  />
                )}
              </div>
              <div className={cn("min-w-0 pt-px", dense ? "pb-1.5" : "pb-3")}>
                <h3
                  className={cn(
                    "leading-tight font-semibold tracking-tight text-white uppercase",
                    dense ? "text-[11px]" : "text-[12px]",
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-white/68",
                    dense
                      ? "text-[11px] leading-[1.32]"
                      : "text-[12px] leading-[1.4]",
                  )}
                >
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        <ul className="mt-3 grid shrink-0 grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/12 pt-3">
          {system.platforms.map((row) => (
            <li
              key={row.name}
              className="text-[11px] leading-snug text-white/55"
            >
              <span className="font-medium text-white/88">{row.name}</span>
              <span> · {row.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

function CaseView({ system }: { system: SystemRecord }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <PageTransition>
      <SecondaryNav />
      <section
        className="relative z-10 flex min-h-svh flex-col bg-black px-4 py-5 font-[Inter,ui-sans-serif,system-ui,sans-serif] text-text-primary antialiased sm:px-6 sm:py-6 md:px-10 md:py-8 lg:px-14 lg:py-8"
        style={{ ["--system-accent" as string]: system.accent }}
      >

        <header className="mb-4 flex shrink-0 flex-col gap-5 sm:mb-5 md:mb-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <motion.div
            data-chapter-copy
            className="max-w-3xl"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.55, ease: EASE }}
          >
            <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
              {system.index} {system.sublabel}
            </p>
            <h1 className="mt-2 text-[28px] leading-[1.12] font-normal tracking-tight sm:text-3xl md:text-4xl lg:text-[44px]">
              {system.label}
            </h1>
            <motion.span
              className="mt-3 block h-px w-24 origin-left"
              style={{ backgroundColor: system.accent }}
              initial={{ scaleX: reduced ? 1 : 0, opacity: reduced ? 0 : 1 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: reduced ? 0.2 : 0.56,
                delay: reduced ? 0 : 0.08,
                ease: EASE,
              }}
            />
            <p className="mt-3 max-w-2xl text-sm leading-[1.55] text-muted md:text-[15px]">
              {system.lede}
            </p>
          </motion.div>

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? 0.2 : 0.5,
              delay: reduced ? 0 : 0.12,
              ease: EASE,
            }}
            className="self-start shrink-0"
          >
            <HoverBorderGradientDemo />
          </motion.div>
        </header>

        <div
          data-chapter-body
          className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,3.5fr)_minmax(0,3.5fr)]"
        >
          <ArchitectureCard system={system} reduced={reduced} />

          <div className="grid min-h-0 gap-4 md:gap-5 lg:grid-rows-[auto_1fr]">
            <motion.article
              className="noise-overlay relative overflow-hidden rounded-2xl bg-black p-5 md:p-6"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0.2 : 0.5,
                delay: reduced ? 0 : 0.22,
                ease: EASE,
              }}
            >
              <StagePhoto
                src={system.image}
                position="40% 28%"
                blur
                overlay="bg-black/72"
              />
              <div className="relative z-10">
                <SectionLabel>What it delivers</SectionLabel>
                <ul className="mt-3.5 space-y-2">
                  {system.delivers.map((line, i) => (
                    <motion.li
                      key={line}
                      className="flex gap-2.5 text-[13px] leading-[1.45] text-white/85"
                      initial={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: reduced ? 0.2 : 0.35,
                        delay: reduced ? 0 : 0.32 + i * 0.07,
                        ease: EASE,
                      }}
                    >
                      <span
                        className="mt-2 h-px w-3 shrink-0"
                        style={{ backgroundColor: system.accent }}
                        aria-hidden
                      />
                      {line}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.article>

            <motion.article
              className="relative min-h-[220px] overflow-hidden rounded-2xl bg-black lg:min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.22,
                delay: reduced ? 0 : 0.34,
                ease: EASE,
              }}
            >
              <StagePhoto
                src={system.image}
                position="72% 42%"
                blur
                overlay="bg-black/50"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-10">
                <motion.p
                  className="text-5xl font-light tracking-tight text-white drop-shadow sm:text-6xl md:text-7xl lg:text-[80px]"
                  initial={
                    reduced ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 16 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0.2 : 0.7,
                    delay: reduced ? 0 : 0.38,
                    ease: EASE,
                  }}
                >
                  {system.metric}
                </motion.p>
                <p className="absolute inset-x-0 bottom-5 text-center text-sm text-white/85">
                  {system.metricCaption}
                </p>
              </div>
            </motion.article>
          </div>

          <div className="grid min-h-0 gap-4 md:gap-5 lg:grid-rows-[1fr_auto]">
            <motion.article
              className="relative min-h-[240px] overflow-hidden rounded-2xl bg-black lg:min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.22,
                delay: reduced ? 0 : 0.26,
                ease: EASE,
              }}
            >
              <StagePhoto
                src={system.image}
                position="22% 68%"
                blur
                overlay="bg-black/45"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative z-10 flex h-full min-h-[11rem] flex-col justify-end gap-3 p-5 md:min-h-[12rem] md:p-6">
                <SectionLabel>Daily Software</SectionLabel>
                <div className="space-y-2">
                  <IconMarquee stack={system.stack} direction="left" />
                  <IconMarquee
                    stack={[...system.stack].reverse()}
                    direction="right"
                  />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="noise-overlay relative overflow-hidden rounded-2xl bg-black p-5 md:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.22,
                delay: reduced ? 0 : 0.4,
                ease: EASE,
              }}
            >
              <StagePhoto
                src={system.image}
                position="88% 22%"
                blur
                overlay="bg-black/70"
              />
              <a
                href="mailto:hello@autoany.io"
                className="liquid-glass absolute top-5 right-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-105"
                aria-label="Email AutoAny"
              >
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <div className="relative z-10">
                <SectionLabel align="start">Reach Me</SectionLabel>
                <div className="mt-5 space-y-1.5 pr-14 text-sm md:text-[15px]">
                  <a
                    href="mailto:hello@autoany.io"
                    className="block cursor-pointer text-white/90 transition-colors duration-200 hover:text-white"
                  >
                    hello@autoany.io
                  </a>
                  <p className="text-white/55">
                    Automate Everything. Achieve Anything.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>
        </div>

        {/* More Systems Section to add density and scroll depth */}
        <motion.div
          className="mt-16 border-t border-white/10 pt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
        >
          <SectionLabel align="start">Explore other systems</SectionLabel>
          <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [scrollbar-width:none]">
            {SYSTEMS.filter((s) => s.slug !== system.slug).map((s) => (
              <Link
                key={s.slug}
                to={`/systems/${s.slug}`}
                className="group relative flex h-48 w-72 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 p-5 transition-all hover:border-white/20 hover:bg-black/60"
              >
                <div className="absolute inset-0 z-0 opacity-40 transition-opacity group-hover:opacity-60">
                  <img
                    src={s.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="relative z-10 mt-auto">
                  <p
                    className="mb-1 text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: s.accent }}
                  >
                    {s.sublabel}
                  </p>
                  <p className="text-lg font-medium text-white shadow-black drop-shadow-md">
                    {s.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>
    </PageTransition>
  );
}

export default function SystemCase() {
  const { slug } = useParams();
  const system = getSystem(slug);
  if (!system) return <NotFound />;
  return <CaseView key={system.slug} system={system} />;
}

export function FeaturesRedirect() {
  const system = getSystem("leads");
  if (!system) return <NotFound />;
  return <CaseView system={system} />;
}
