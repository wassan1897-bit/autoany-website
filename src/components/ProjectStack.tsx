import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/cn";
import IntakeQuizPhone from "./IntakeQuizPhone";
import "./TeamNote.css";

type TeamMember = {
  number: string;
  role: string;
  name: string;
  href: string;
  cta: string;
  phone?: boolean;
  portrait?: { src: string; alt: string };
  note: { body: string; sign: string };
};

/** Placeholder members - swap names, roles, and notes when confirmed. */
const TEAM: TeamMember[] = [
  {
    number: "01",
    role: "LEAD",
    name: "Maali Wassan",
    href: "mailto:hello@autoany.io",
    cta: "Say hi",
    phone: true,
    note: {
      body: "I don't ship dashboards that look busy. I sit with the bottleneck, then wire n8n and GHL until the thing actually runs - intake, follow-up, the unglamorous pipes. If it dies when I leave, it wasn't finished.",
      sign: "Maali",
    },
  },
  {
    number: "02",
    role: "SPECIALIST",
    name: "Member Two",
    href: "mailto:hello@autoany.io",
    cta: "Say hi",
    portrait: {
      src: "/assets/haris-portrait.png",
      alt: "Portrait placeholder for member two",
    },
    note: {
      body: "Note goes here. A short handwritten intro from this person - what they actually build, not a bio.",
      sign: "Member Two",
    },
  },
  {
    number: "03",
    role: "OPERATOR",
    name: "Member Three",
    href: "mailto:hello@autoany.io",
    cta: "Say hi",
    portrait: {
      src: "/assets/team-portrait.png",
      alt: "Portrait placeholder for member three",
    },
    note: {
      body: "Note goes here. Keep it in their voice. We'll drop the real copy when names are confirmed.",
      sign: "Member Three",
    },
  },
];

const WELL =
  "min-h-0 overflow-hidden rounded-[40px] border border-[#D7E2EA]/25 bg-[#0C0C0C] sm:rounded-[50px] md:rounded-[60px]";
const PHONE_WELL =
  "flex h-full min-h-0 items-center justify-center overflow-visible rounded-[40px] border border-[#D7E2EA]/25 bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-5 md:rounded-[60px] md:p-6";

export default function ProjectStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="about"
      aria-labelledby="team-heading"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] sm:-mt-12 sm:rounded-t-[50px] md:-mt-14 md:rounded-t-[60px]"
    >
      <div className="px-6 pt-14 sm:px-10 sm:pt-16 md:px-16 md:pt-20 lg:px-20">
        <h2
          id="team-heading"
          className="font-display w-fit bg-gradient-to-r from-[#646973] to-[#BBCCD7] bg-clip-text text-[clamp(3.25rem,10vw,6rem)] leading-[0.9] tracking-[-0.03em] text-transparent italic"
        >
          Team
        </h2>
      </div>

      <div
        ref={containerRef}
        className="relative mt-8 px-4 pb-24 sm:mt-10 sm:px-6 md:mt-12 md:px-8 lg:px-12"
      >
        {TEAM.map((member, index) => (
          <TeamCard
            key={member.number}
            member={member}
            index={index}
            total={TEAM.length}
            progress={scrollYProgress}
          />
        ))}
        <div aria-hidden className="pointer-events-none h-[55vh] md:h-[70vh]" />
      </div>
    </section>
  );
}

function TeamCard({
  member,
  index,
  total,
  progress,
}: {
  member: TeamMember;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, targetScale]);
  const stackOffset = index * 28;

  return (
    <article className="sticky top-24 flex h-[85vh] items-start md:top-32">
      <motion.div
        style={{
          scale: reduceMotion ? 1 : scale,
          top: `${stackOffset}px`,
          maxHeight: `calc(100% - ${stackOffset}px)`,
          zIndex: index,
        }}
        className={cn(
          "relative flex w-full max-w-[92rem] origin-top flex-col overflow-hidden rounded-[40px] border-2 border-[#D7E2EA]/50 bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8",
        )}
      >
        <header className="mb-4 flex shrink-0 flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-5 md:mb-6">
          <div className="flex min-w-0 items-start gap-3 sm:gap-5 md:gap-6">
            <span className="font-display shrink-0 text-[clamp(2.75rem,6vw,5.5rem)] leading-none tracking-[-0.04em] text-[#BBCCD7] italic">
              {member.number}
            </span>
            <div className="min-w-0 pt-1 sm:pt-2">
              <p className="text-[11px] font-medium tracking-[0.28em] text-[#A8B4BE] uppercase">
                {member.role}
              </p>
              <h3 className="mt-1 text-[clamp(1.2rem,3vw,2.35rem)] leading-tight tracking-[-0.03em] text-balance text-[#D7E2EA]">
                {member.name}
              </h3>
            </div>
          </div>

          <a
            href={member.href}
            className="inline-flex h-11 shrink-0 items-center rounded-full border-2 border-[#D7E2EA]/70 px-4 text-[10px] font-medium tracking-[0.2em] text-[#D7E2EA] uppercase transition-colors duration-200 hover:bg-[#D7E2EA]/10 focus-visible:ring-2 focus-visible:ring-[#BBCCD7] focus-visible:outline-none sm:px-5 sm:text-xs sm:tracking-[0.28em]"
          >
            {member.cta}
          </a>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[minmax(0,18.5rem)_minmax(0,1fr)] md:gap-5 lg:grid-cols-[minmax(0,20.5rem)_minmax(0,1fr)]">
          <div className={PHONE_WELL}>
            {member.phone ? (
              <div className="w-full max-w-[min(17.5rem,calc((85vh-15rem)*415/874))]">
                <IntakeQuizPhone />
              </div>
            ) : member.portrait ? (
              <img
                src={member.portrait.src}
                alt={member.portrait.alt}
                className="-m-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] object-cover sm:-m-4 sm:h-[calc(100%+2rem)] sm:w-[calc(100%+2rem)] md:-m-5 md:h-[calc(100%+2.5rem)] md:w-[calc(100%+2.5rem)]"
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>

          <div className={`${WELL} h-full min-h-[16rem]`}>
            <HandNote body={member.note.body} sign={member.note.sign} />
          </div>
        </div>
      </motion.div>
    </article>
  );
}

function HandNote({ body, sign }: { body: string; sign: string }) {
  return (
    <figure className="team-note">
      <blockquote className="team-note-body">{body}</blockquote>
      <figcaption className="team-note-sign">- {sign}</figcaption>
    </figure>
  );
}
