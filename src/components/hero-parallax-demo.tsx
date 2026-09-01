import { HeroParallax, type HeroParallaxProduct } from "./ui/hero-parallax";
import { SYSTEMS } from "../lib/systems";

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

/** First implementation: 3×5 cards, pad with early systems for density. */
function buildProducts(): HeroParallaxProduct[] {
  const base: HeroParallaxProduct[] = SYSTEMS.map((system) => {
    const still = WORK_STILLS[system.slug];
    const photo = system.poster === "photo";
    return {
      title: system.label,
      link: `/systems/${system.slug}`,
      thumbnail: still?.image ?? system.image,
      fit: still?.fit ?? (photo ? "cover" : "contain"),
      objectPosition: still?.objectPosition ?? "50% 50%",
    };
  });

  const filled = [...base];
  let i = 0;
  while (filled.length < 15) {
    filled.push(base[i % base.length]!);
    i += 1;
  }
  return filled.slice(0, 15);
}

export const products = buildProducts();

export default function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}
