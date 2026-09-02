import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SiteNav from "./SiteNav";
import ScrollAtmosphere from "./ScrollAtmosphere";
import { EncryptedText } from "./ui/encrypted-text";
import { HoverBorderGradientDemo } from "./hover-border-gradient-demo";
import { CyberButton } from "./ui/CyberButton";
import { bindLiveSection } from "../lib/live-section";
import "./Hero.css";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function heroCovered() {
  const stage = document.querySelector(".open-stage") as HTMLElement | null;
  if (stage) {
    return Number(stage.style.getPropertyValue("--open") || 0) > 0.22;
  }
  return window.scrollY > window.innerHeight * 0.42;
}

type HeroProps = {
  active: boolean;
};

export default function Hero({ active }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const applyFog = () => {
      if (document.querySelector(".open-stage")) return;
      const p = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 0.95)),
      );
      section.style.setProperty("--fog", p.toFixed(4));
    };

    const unbind = bindLiveSection(
      section,
      (live) => {
        if (live && !heroCovered()) applyFog();
      },
      { mark: false },
    );

    let raf = 0;
    const onScroll = () => {
      if (heroCovered()) return;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          applyFog();
        });
      }
    };

    applyFog();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      unbind();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="nk-hero"
      style={{ ["--fog" as string]: 0 }}
    >
      <motion.div
        className="nk-stage"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.15, delay: active ? 0.15 : 0, ease: EASE }}
      >
        <div className="nk-fog" aria-hidden />
        <div className="nk-mist" aria-hidden />
      </motion.div>

      <ScrollAtmosphere variant="hero" draw />

      <SiteNav active={active} />

      <motion.div
        className="nk-bottom"
        initial={{ opacity: 0, y: 18 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.95, delay: active ? 0.28 : 0, ease: EASE }}
      >
        <div className="nk-bottom-inner">
          <div>
            <motion.p
              data-open-out
              className="nk-kicker"
              initial={{ opacity: 0, y: 14 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.8, delay: active ? 0.35 : 0, ease: EASE }}
            >
              <span className="nk-kicker-dot" aria-hidden />
              Built for operators
            </motion.p>

            <motion.h1
              className="nk-heading"
              initial={{ opacity: 0, y: 18 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.95, delay: active ? 0.48 : 0, ease: EASE }}
            >
              <span data-open-out className="nk-heading-line">
                {active ? (
                  <EncryptedText
                    text="Automate Everything."
                    encryptedClassName="nk-heading-encrypted"
                    revealedClassName="nk-heading-revealed"
                    revealDelayMs={55}
                    flipDelayMs={58}
                  />
                ) : (
                  "Automate Everything."
                )}
              </span>
              <span data-open-out className="nk-heading-line">
                {active ? (
                  <EncryptedText
                    text="Achieve Anything."
                    encryptedClassName="nk-heading-encrypted"
                    revealedClassName="nk-heading-revealed"
                    revealDelayMs={55}
                    flipDelayMs={58}
                  />
                ) : (
                  "Achieve Anything."
                )}
              </span>
            </motion.h1>

            <motion.p
              data-open-out
              className="nk-sub"
              initial={{ opacity: 0, y: 14 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.85, delay: active ? 0.72 : 0, ease: EASE }}
            >
              We sit with the bottleneck, then wire automation into the tools
              you already run.
            </motion.p>

            <motion.div
              data-open-out
              className="nk-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.85, delay: active ? 0.9 : 0, ease: EASE }}
            >
              <CyberButton href="#work" text="See systems" />
              <HoverBorderGradientDemo />
            </motion.div>
          </div>

          <motion.div
            data-open-out
            className="nk-pills"
            initial={{ opacity: 0, y: 12 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: active ? 1.05 : 0, ease: EASE }}
          >
            <span className="nk-pill">Voice</span>
            <span className="nk-pill">CRM</span>
            <span className="nk-pill">Ops</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
