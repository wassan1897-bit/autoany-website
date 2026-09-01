import { motion, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import AutoAnyLogo from "./AutoAnyLogo";

type FooterLink = { label: string; href: string; external?: boolean };

const PAGES: FooterLink[] = [
  { label: "Selected work", href: "#work" },
  { label: "Systems", href: "#journal" },
  { label: "Tools stack", href: "#resume" },
  { label: "Team", href: "#features" },
  { label: "Client reviews", href: "#reviews" },
];

const SOCIALS: FooterLink[] = [
  { label: "X / Twitter", href: "https://x.com", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com", external: true },
  { label: "GitHub", href: "https://github.com", external: true },
];

const LEGAL: FooterLink[] = [
  { label: "Privacy Policy", href: "mailto:hello@autoany.io?subject=Privacy%20Policy" },
  { label: "Terms of Service", href: "mailto:hello@autoany.io?subject=Terms%20of%20Service" },
  { label: "Cookie Policy", href: "mailto:hello@autoany.io?subject=Cookie%20Policy" },
];

const CONTACT: FooterLink[] = [
  { label: "Book a consult", href: "mailto:hello@autoany.io" },
  { label: "hello@autoany.io", href: "mailto:hello@autoany.io" },
  { label: "Available for builds", href: "mailto:hello@autoany.io?subject=Project%20inquiry" },
];

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: "Pages", links: PAGES },
  { title: "Socials", links: SOCIALS },
  { title: "Legal", links: LEGAL },
  { title: "Contact", links: CONTACT },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function jump(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  event.preventDefault();
  const id = href.slice(1);
  window.dispatchEvent(new CustomEvent("site-scroll-to", { detail: id }));
}

function jumpHome(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  window.dispatchEvent(new CustomEvent("site-scroll-to", { detail: "home" }));
}

export default function Footer() {
  const reduce = useReducedMotion() ?? false;
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative z-10 overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/[0.14]"
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto flex min-h-[min(72svh,42rem)] max-w-[1200px] flex-col px-6 pt-16 pb-28 sm:px-8 md:px-10 md:pt-20 md:pb-36 lg:px-16 lg:pt-24 lg:pb-44"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2, margin: "0px 0px -4% 0px" }}
        transition={{ duration: reduce ? 0.35 : 0.85, ease: EASE }}
      >
        <div className="relative z-10 flex flex-1 flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-12 lg:gap-20">
          <div className="w-full shrink-0 md:max-w-[17.5rem] lg:max-w-[19rem]">
            <AutoAnyLogo onJumpHome={jumpHome} />
            <p className="mt-5 max-w-[16rem] text-[0.8125rem] leading-relaxed text-white/40">
              Automate everything. Achieve anything.
            </p>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-white/30">
              © copyright AutoAny {year}. All rights reserved.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid w-full flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-6 md:max-w-none md:gap-x-8 lg:gap-x-10"
          >
            {COLUMNS.map((column) => (
              <div key={column.title} className="min-w-0">
                <p className="mb-4 text-[0.6875rem] font-semibold tracking-[0.16em] text-white uppercase">
                  {column.title}
                </p>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        onClick={
                          link.href.startsWith("#")
                            ? (event) => jump(event, link.href)
                            : undefined
                        }
                        className="text-[0.8125rem] leading-snug text-white/55 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </motion.div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex select-none justify-center overflow-hidden"
        aria-hidden
      >
        <span className="translate-y-[42%] font-display text-[clamp(4.5rem,22vw,16rem)] leading-none tracking-tight text-white/[0.045] italic whitespace-nowrap">
          AutoAny
        </span>
      </div>
    </footer>
  );
}
