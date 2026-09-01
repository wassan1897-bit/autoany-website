import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import {
  IconBrandLinkedin,
  IconBrandUpwork,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import {
  DEFAULT_TEAM_SOCIAL_LINKS,
  FEATURES_HEADING,
  PERSON_CARDS,
} from "../lib/features-cards";
import { Card } from "./ui/apple-cards-carousel";
import type { DockItem } from "./ui/floating-dock";
import "./FeaturesCards.css";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function LockLine({
  children,
  className,
  delay,
  reduce,
}: {
  children: ReactNode;
  className: string;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: reduce ? 0.35 : 0.9,
        ease: EASE,
        delay: reduce ? delay * 0.3 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function initialsAvatar(name: string) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%23222222"/><text x="32" y="39" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="600" fill="%23f5f5f5">${initials}</text></svg>`;
  return `data:image/svg+xml,${svg}`;
}

function buildDockItems(person: (typeof PERSON_CARDS)[number]): DockItem[] {
  const social = { ...DEFAULT_TEAM_SOCIAL_LINKS, ...person.social };

  return [
    {
      title: "LinkedIn",
      href: social.linkedin ?? DEFAULT_TEAM_SOCIAL_LINKS.linkedin!,
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Upwork",
      href: social.upwork ?? DEFAULT_TEAM_SOCIAL_LINKS.upwork!,
      icon: <IconBrandUpwork className="h-full w-full text-neutral-300" />,
    },
    {
      title: "WhatsApp",
      href: social.contact ?? DEFAULT_TEAM_SOCIAL_LINKS.contact!,
      icon: (
        <IconBrandWhatsapp className="h-full w-full text-neutral-300" />
      ),
    },
  ];
}

export default function FeaturesCards() {
  const reduce = useReducedMotion() ?? false;
  
  const teamCards = PERSON_CARDS.map((person) => {
    return {
      category: person.role,
      title: person.name,
      src: person.image || initialsAvatar(person.name),
      objectPosition: person.objectPosition,
      dockItems: buildDockItems(person),
      content: (
        <div className="bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4">
          <p className="text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-200">{person.name}</span>
            {person.role ? (
              <>
                <br />
                <span className="text-neutral-500">{person.role}</span>
              </>
            ) : null}
            {person.tagline ? (
              <>
                <br />
                <br />
                {person.tagline}
              </>
            ) : null}
          </p>
        </div>
      ),
    };
  });

  return (
    <section
      id="features"
      className="fc-section noise-overlay fc-noise section-veil surface-dark"
      aria-labelledby="features-heading"
    >
      <div className="fc-inner">
        <header className="fc-lock">
          <h2 id="features-heading" className="sr-only">
            {FEATURES_HEADING.kicker} {FEATURES_HEADING.ghost}{" "}
            {FEATURES_HEADING.fill}
          </h2>

          <LockLine className="fc-kicker" delay={0} reduce={reduce}>
            {FEATURES_HEADING.kicker}
          </LockLine>

          <h3 className="fc-pay" aria-hidden>
            <LockLine className="fc-pay-line" delay={0.18} reduce={reduce}>
              {FEATURES_HEADING.ghost} {FEATURES_HEADING.fill}
            </LockLine>
          </h3>

          <LockLine className="fc-sub" delay={0.52} reduce={reduce}>
            {FEATURES_HEADING.sub}
          </LockLine>
        </header>

        <div className="fc-team-grid">
          {teamCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reduce ? 0.35 : 0.7,
                ease: EASE,
                delay: reduce ? index * 0.05 : index * 0.12,
              }}
            >
              <Card card={card} index={index} fluid />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
