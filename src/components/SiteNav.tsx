import { motion } from "framer-motion";
import { useState, useEffect, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import AutoAnyLogo from "./AutoAnyLogo";
import { AppleSwitch } from "./AppleSwitch";
import { useTheme } from "../lib/theme";
import { SYSTEMS } from "../lib/systems";
import { STACK_TOOLS } from "../lib/stack-tools";
import { cn } from "../lib/cn";
import {
  MotionNavigationMenu,
  MotionNavigationMenuContent,
  MotionNavigationMenuItem,
  MotionNavigationMenuLink,
  MotionNavigationMenuList,
  MotionNavigationMenuTrigger,
  motionNavigationMenuTriggerStyle,
} from "./unlumen-ui/motion-navigation-menu";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const listHighlight = "bg-hero-fg/10 rounded-lg";

type SiteNavProps = {
  active: boolean;
};

function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  window.dispatchEvent(new CustomEvent("site-scroll-to", { detail: id }));
}

export default function SiteNav({ active }: SiteNavProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function openSystem(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    event.preventDefault();
    navigate(`/systems/${slug}`);
  }

  function closeNav() {
    setNavValue("");
  }

  function jumpResume(event: MouseEvent<HTMLAnchorElement>) {
    closeNav();
    jump(event, "resume");
  }

  return (
    <motion.div
      className="nk-site-nav"
      initial={{ opacity: 0, y: -16 }}
      animate={active && !isScrolled ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: 1, delay: active && !isScrolled ? 0.2 : 0, ease: EASE }}
      style={{ pointerEvents: isScrolled ? "none" : undefined }}
    >
      <AutoAnyLogo onJumpHome={(event) => jump(event, "home")} />

      <MotionNavigationMenu
        className="nk-site-nav-menu"
        aria-label="Primary"
        viewportClassName="border-stroke shadow-none"
        springStiffness={350}
        springDamping={32}
        value={navValue}
        onValueChange={setNavValue}
      >
        <MotionNavigationMenuList highlightClassName={listHighlight}>
          <MotionNavigationMenuItem value="systems">
            <MotionNavigationMenuTrigger>Systems</MotionNavigationMenuTrigger>
            <MotionNavigationMenuContent highlightClassName="nk-systems-hi">
              <div className="nk-systems-grid grid w-[min(92vw,22rem)] grid-cols-1 gap-2 sm:w-[420px] sm:grid-cols-2">
                {SYSTEMS.map((system) => (
                  <MotionNavigationMenuLink
                    key={system.slug}
                    href={`/systems/${system.slug}`}
                    className="nk-systems-tile"
                    onClick={(event) => openSystem(event, system.slug)}
                  >
                    <span className="text-sm font-medium">{system.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {system.description}
                    </span>
                  </MotionNavigationMenuLink>
                ))}
              </div>
            </MotionNavigationMenuContent>
          </MotionNavigationMenuItem>

          <MotionNavigationMenuItem value="tools">
            <MotionNavigationMenuTrigger>Tools</MotionNavigationMenuTrigger>
            <MotionNavigationMenuContent highlightClassName="nk-systems-hi">
              <div className="nk-systems-grid nk-tools-grid grid w-[min(92vw,22rem)] grid-cols-1 gap-2 sm:w-[420px] sm:grid-cols-2">
                {STACK_TOOLS.map((tool) => (
                  <MotionNavigationMenuLink
                    key={tool.id}
                    href="#resume"
                    className="nk-systems-tile nk-tools-tile"
                    onClick={jumpResume}
                  >
                    <span className="nk-tools-plate">
                      <img
                        src={tool.src}
                        alt=""
                        width={40}
                        height={40}
                        decoding="async"
                        draggable={false}
                      />
                    </span>
                    <span className="nk-tools-name">{tool.name}</span>
                  </MotionNavigationMenuLink>
                ))}
                <MotionNavigationMenuLink
                  href="#resume"
                  className="nk-systems-tile nk-tools-tile nk-tools-all"
                  onClick={jumpResume}
                >
                  <span className="nk-tools-name">All tools</span>
                </MotionNavigationMenuLink>
              </div>
            </MotionNavigationMenuContent>
          </MotionNavigationMenuItem>

          <MotionNavigationMenuItem>
            <MotionNavigationMenuLink
              href="#resume"
              className={cn(motionNavigationMenuTriggerStyle(), "nk-nav-link")}
              onPointerEnter={closeNav}
              onFocus={closeNav}
              onClick={(event) => jump(event, "resume")}
            >
              About
            </MotionNavigationMenuLink>
          </MotionNavigationMenuItem>

          <MotionNavigationMenuItem>
            <MotionNavigationMenuLink
              href="#work"
              className={cn(motionNavigationMenuTriggerStyle(), "nk-nav-link")}
              onPointerEnter={closeNav}
              onFocus={closeNav}
              onClick={(event) => jump(event, "work")}
            >
              Work
            </MotionNavigationMenuLink>
          </MotionNavigationMenuItem>

          <MotionNavigationMenuItem>
            <MotionNavigationMenuLink
              href="#reviews"
              className={cn(motionNavigationMenuTriggerStyle(), "nk-nav-link")}
              onPointerEnter={closeNav}
              onFocus={closeNav}
              onClick={(event) => jump(event, "reviews")}
            >
              Testimonials
            </MotionNavigationMenuLink>
          </MotionNavigationMenuItem>

          <MotionNavigationMenuItem>
            <MotionNavigationMenuLink
              href="#contact"
              className={cn(motionNavigationMenuTriggerStyle(), "nk-nav-link")}
              onPointerEnter={closeNav}
              onFocus={closeNav}
              onClick={(event) => jump(event, "contact")}
            >
              Book a Call
            </MotionNavigationMenuLink>
          </MotionNavigationMenuItem>
        </MotionNavigationMenuList>
      </MotionNavigationMenu>

      <div className="nk-site-nav-switch">
        <AppleSwitch
          checked={theme === "dark"}
          onCheckedChange={(on) => setTheme(on ? "dark" : "light")}
          size="md"
          tone="neutral"
          aria-label="Dark mode"
        />
      </div>
    </motion.div>
  );
}
