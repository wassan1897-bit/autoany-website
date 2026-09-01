import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Why", href: "#resume" },
];

function Divider() {
  return <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" aria-hidden />;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);

      const probe = window.scrollY + window.innerHeight * 0.4;
      let current = "#home";
      for (const link of NAV_LINKS) {
        const el = document.querySelector<HTMLElement>(link.href);
        if (el && el.offsetTop <= probe) current = link.href;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-[80] flex justify-center px-4 pt-4 md:pt-6">
      <nav
        className={cn(
          "inline-flex items-center rounded-full border border-stroke bg-surface px-2 py-2 backdrop-blur-md transition-shadow duration-500",
          scrolled && "shadow-md shadow-black/10",
        )}
        aria-label="Primary"
      >
        <a
          href="#home"
          className="group relative mr-1 flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-300 hover:scale-110"
          aria-label="AutoAny home"
        >
          <span className="absolute inset-0 rounded-full border border-stroke-strong bg-raised" />
          <span className="absolute inset-0 rounded-full border border-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center rounded-full bg-bg font-display text-[13px] text-text-primary italic">
            AA
          </span>
        </a>

        <Divider />

        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs transition-colors duration-300 sm:px-4 sm:py-2 sm:text-sm",
              active === link.href
                ? "bg-stroke/50 text-text-primary"
                : "text-muted hover:bg-stroke/50 hover:text-text-primary",
            )}
          >
            {link.label}
          </a>
        ))}

        <Divider />

        <a
          href="mailto:hello@autoany.io"
          className="group relative ml-1 inline-flex"
        >
          <span
            className="accent-gradient-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-text-primary backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
            Consult
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
          </span>
        </a>
      </nav>
    </header>
  );
}
