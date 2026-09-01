import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconTerminal2,
  IconBriefcase,
  IconMessageCircle,
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandUpwork,
} from "@tabler/icons-react";

export default function FloatingDockDemo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#home",
    },
    {
      title: "Work",
      icon: <IconBriefcase className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#work",
    },
    {
      title: "Tools",
      icon: <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#resume",
    },
    {
      title: "Consult",
      icon: <IconMessageCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "mailto:hello@autoany.io",
    },
    {
      title: "LinkedIn",
      icon: <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "https://www.linkedin.com/",
    },
    {
      title: "GitHub",
      icon: <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "https://github.com/",
    },
    {
      title: "Upwork",
      icon: <IconBrandUpwork className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "https://www.upwork.com/",
    },
  ];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        >
          <div className="pointer-events-auto">
            <FloatingDock
              mobileClassName="translate-y-20" // only for demo, remove for production
              items={links}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
