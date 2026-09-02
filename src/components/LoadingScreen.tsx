import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { AssetReadiness } from "../lib/critical-assets";
import { LOADER_MAX_MS, LOADER_MIN_MS } from "../lib/critical-assets";
import { EncryptedText } from "./ui/encrypted-text";

const COMPLETE_DELAY = 400;

const LINES = [
  "Voice agents. CRM pipes. Workflows that ship.",
  "Built for operators who hate the bottleneck.",
  "autoany.io - automate everything.",
] as const;

function waitUntil(deadline: number) {
  const remaining = deadline - performance.now();
  if (remaining <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, remaining);
  });
}

type LoadingScreenProps = {
  onComplete: () => void;
  readiness: AssetReadiness;
};

export default function LoadingScreen({
  onComplete,
  readiness,
}: LoadingScreenProps) {
  const [count, setCount] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let raf = 0;
    let timeout: number | undefined;
    let finished = false;
    const loaderStart = performance.now();
    const maxDeadline = loaderStart + LOADER_MAX_MS;
    const minDeadline = loaderStart + LOADER_MIN_MS;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setCount(100);
      timeout = window.setTimeout(
        () => onCompleteRef.current(),
        COMPLETE_DELAY,
      );
    };

    const unsub = readiness.subscribe((assetProgress) => {
      if (finished) return;
      const elapsed = performance.now() - loaderStart;
      const timeProgress = Math.min(elapsed / LOADER_MAX_MS, 1) * 100;
      setCount(
        Math.round(Math.min(99, Math.max(timeProgress, assetProgress))),
      );
    });

    const tick = (now: number) => {
      if (finished) return;
      const elapsed = now - loaderStart;
      const timeProgress = Math.min(elapsed / LOADER_MAX_MS, 1) * 100;
      const assetProgress = readiness.getProgress();
      setCount(
        Math.round(Math.min(99, Math.max(timeProgress, assetProgress))),
      );
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const wait = async () => {
      await Promise.all([
        waitUntil(minDeadline),
        Promise.race([readiness.whenReady(), waitUntil(maxDeadline)]),
      ]);
      finish();
    };

    void wait();

    return () => {
      finished = true;
      unsub();
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [readiness]);

  useEffect(() => {
    const interval = window.setInterval(
      () => setLineIndex((i) => (i + 1) % LINES.length),
      1600,
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#000000] text-white"
      style={{ backgroundColor: "#000000" }}
      aria-label="Loading"
      aria-live="polite"
    >
      <motion.p
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute left-6 top-6 text-[11px] font-medium tracking-[0.36em] text-white/70 uppercase md:left-10 md:top-10 md:text-xs"
      >
        AutoAny
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="absolute top-6 right-6 text-[10px] tracking-[0.28em] text-white/30 uppercase md:top-10 md:right-10 md:text-[11px]"
      >
        Systems online
      </motion.p>

      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[18ch] font-display text-[clamp(2.4rem,7vw,4.75rem)] leading-[1.05] tracking-[-0.03em] italic md:max-w-[22ch]"
        >
          <EncryptedText
            text="Welcome to autoany.io"
            encryptedClassName="text-white/30"
            revealedClassName="text-white"
            revealDelayMs={48}
            flipDelayMs={48}
          />
        </motion.div>

        <motion.p
          key={lineIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-8 max-w-[28rem] text-sm leading-relaxed text-white/40 md:mt-10 md:text-[15px]"
        >
          {LINES[lineIndex]}
        </motion.p>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] tracking-[0.24em] text-white/25 uppercase md:mt-14 md:text-[11px]"
        >
          <li>Voice</li>
          <li aria-hidden className="text-white/12">
            ·
          </li>
          <li>CRM</li>
          <li aria-hidden className="text-white/12">
            ·
          </li>
          <li>n8n</li>
          <li aria-hidden className="text-white/12">
            ·
          </li>
          <li>Ops</li>
        </motion.ul>
      </div>

      <div className="absolute right-6 bottom-6 md:right-10 md:bottom-10">
        <span className="font-display text-6xl leading-none text-white/95 tabular-nums italic md:text-8xl lg:text-9xl">
          {String(count).padStart(3, "0")}
        </span>
      </div>
    </motion.div>
  );
}
