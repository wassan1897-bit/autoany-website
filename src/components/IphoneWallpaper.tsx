import { useEffect, useState } from "react";
import { MAALI_WALLPAPERS } from "../lib/maali-wallpapers";
import "./IphoneWallpaper.css";

const HOLD_MS = 3200;
const CUT_MS = 140;

export default function IphoneWallpaper({
  unlocked,
  reducedMotion,
  paused = false,
}: {
  unlocked: boolean;
  reducedMotion: boolean;
  paused?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const frozen = paused || unlocked;

  useEffect(() => {
    if (frozen) return;
    let cut = 0;
    const hold = window.setTimeout(() => {
      setLeaving(true);
      cut = window.setTimeout(() => {
        setIndex((current) => (current + 1) % MAALI_WALLPAPERS.length);
        setLeaving(false);
      }, reducedMotion ? 0 : CUT_MS);
    }, HOLD_MS);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(cut);
    };
  }, [index, frozen, reducedMotion]);

  return (
    <div
      className={[
        "iphone-wall",
        unlocked ? "is-soft" : "",
        reducedMotion ? "is-still" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <div className="iphone-wall-track">
        {MAALI_WALLPAPERS.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            draggable={false}
            decoding={i === 0 ? "sync" : "async"}
            fetchPriority={i < 2 ? "high" : "low"}
            className={[
              "iphone-wall-slide",
              i === index ? "is-on" : "",
              i === index && leaving ? "is-leaving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ objectPosition: slide.position }}
          />
        ))}
      </div>
    </div>
  );
}
