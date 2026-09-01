export const FEATURES_HEADING = {
  kicker: "Team",
  ghost: "Founders",
  fill: "& builders.",
  sub: "Profiles, links, and the work behind AutoAny.",
} as const;

export type PersonSocialLinks = {
  linkedin?: string;
  upwork?: string;
  contact?: string;
};

export const DEFAULT_TEAM_SOCIAL_LINKS: PersonSocialLinks = {
  linkedin: "https://www.linkedin.com/",
  upwork: "https://www.upwork.com/",
  contact: "https://wa.me/923363068574",
};

export type PersonCard = {
  name: string;
  role?: string;
  tagline?: string;
  image?: string;
  imageAlt?: string;
  /** CSS object-position for the portrait crop */
  objectPosition?: string;
  /** Photo shown as-is - no filters; bottom text scrim only */
  plainPhoto?: boolean;
  social?: PersonSocialLinks;
};

export const PERSON_CARDS: readonly PersonCard[] = [
  {
    name: "Maali Wassan",
    role: "Founder",
    tagline: "Pakistan's sexiest person",
    image: "/assets/maali/home-portrait.png?v=2",
    imageAlt: "Portrait of Maali Wassan",
    objectPosition: "center 28%",
    plainPhoto: true,
    social: {
      contact: "https://wa.me/923363068574",
    },
  },
  {
    name: "Haris Wassan",
    role: "Co-founder",
    tagline:
      "I diagnose the operational bottlenecks that cost businesses the most time, then build the AI systems that fix them.",
    image: "/assets/harish/portrait.png?v=5",
    imageAlt: "Portrait of Haris Wassan",
    objectPosition: "center 12%",
    plainPhoto: true,
    social: {
      linkedin: "https://www.linkedin.com/in/muhammad-haris-wassan/",
      upwork:
        "https://www.upwork.com/freelancers/hariswassan?mp_source=share",
      contact: "https://wa.me/923363383858",
    },
  },
  {
    name: "Romain Ahuja",
    role: "Co-founder",
    image: "/assets/romain/portrait.jpg",
    imageAlt: "Portrait of Romain Ahuja outdoors beside a brick wall",
    objectPosition: "center 32%",
    plainPhoto: true,
    social: {
      linkedin:
        "https://www.linkedin.com/in/romain-ahuja-2b19121a3?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      upwork: "https://www.upwork.com/freelancers/~01a33bbac04537ada3",
      contact: "https://wa.me/923363098482",
    },
  },
] as const;

/** @deprecated use PERSON_CARDS[0] */
export const FOUNDER_CARD = PERSON_CARDS[0];
