"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bindLiveSection } from "../../lib/live-section";
import { cn } from "../../lib/cn";
import { MotionSubtitle } from "./motion-subtitle";

gsap.registerPlugin(ScrollTrigger);

export interface OrbitalImageWheelImage {
  src: string;
  alt?: string;
  label?: string;
  subtitle?: string;
}

export interface OrbitalImageWheelProps {
  images: OrbitalImageWheelImage[];
  turns?: number;
  blur?: number;
  dim?: number;
  brightnessBoost?: number;
  darknessStrength?: number;
  minSaturation?: number;
  saturationStrength?: number;
  focusSpread?: number;
  scaleEffect?: number;
  scrollSensitivity?: number;
  itemWidth?: number;
  itemHeight?: number;
  wheelSize?: number;
  cropRatio?: number;
  scrollLength?: number;
  captionOffset?: number;
  showCaption?: boolean;
  subtitleDirection?: "top" | "bottom";
  subtitleSpeed?: number;
  subtitleStagger?: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  autoplay?: boolean;
  autoplaySecondsPerItem?: number;
  autoplayLift?: number;
  className?: string;
  header?: ReactNode;
}

const DEFAULT_TURNS = 4;
const DEFAULT_BLUR = 4;
const DEFAULT_DIM = 40;
const DEFAULT_BRIGHTNESS_BOOST = 30;
const DEFAULT_DARKNESS_STRENGTH = 1.05;
const DEFAULT_MIN_SATURATION = 55;
const DEFAULT_SATURATION_STRENGTH = 0.6;
const DEFAULT_FOCUS_SPREAD = 0.34;
const DEFAULT_SCALE_EFFECT = 0.06;
const DEFAULT_SCROLL_SENSITIVITY = 0.7;
const DEFAULT_ITEM_WIDTH = 220;
const DEFAULT_ITEM_HEIGHT = 300;
const DEFAULT_SCROLL_LENGTH = 330;
const DEFAULT_CROP_RATIO = 0.75;
const DEFAULT_CAPTION_OFFSET = 15;
const DEFAULT_SUBTITLE_DIRECTION = "top";
const DEFAULT_SUBTITLE_SPEED = 1;
const DEFAULT_SUBTITLE_STAGGER = 0.018;
const DEFAULT_AUTOPLAY_SECONDS = 2.45;
/** Keep 0 so the active logo sits on the center crown of the arc. */
const AUTOPLAY_FOCUS_TURN = 0;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function shortestAngleDistance(a: number, b: number) {
  const full = Math.PI * 2;
  const raw = ((a - b + Math.PI) % full) - Math.PI;
  const normalized = raw < -Math.PI ? raw + full : raw;
  return Math.abs(normalized);
}

function applyScrollSensitivity(progress: number, sensitivity: number) {
  const safeSensitivity = clamp(sensitivity, 0.25, 1.6);
  const exponent = 1 / safeSensitivity;
  return Math.pow(clamp(progress, 0, 1), exponent);
}

function getFocusedImageIndexWithHysteresis(
  progress: number,
  total: number,
  turns: number,
  currentIndex: number,
  hysteresis = 0.18,
) {
  if (total <= 0 || turns <= 0) return 0;

  const phaseRaw = total * (0.25 + progress * turns);
  const phase = ((phaseRaw % total) + total) % total;

  if (currentIndex < 0) {
    return Math.round(phase) % total;
  }

  let next = currentIndex;
  let delta = phase - next;

  if (delta > total / 2) delta -= total;
  if (delta < -total / 2) delta += total;

  const threshold = 0.5 + clamp(hysteresis, 0, 0.35);

  while (delta > threshold) {
    next = (next + 1) % total;
    delta -= 1;
  }

  while (delta < -threshold) {
    next = (next - 1 + total) % total;
    delta += 1;
  }

  return next;
}

function getSnapProgressForIndex(
  index: number,
  total: number,
  turns: number,
  currentProgress: number,
) {
  if (total <= 0 || turns <= 0) return clamp(currentProgress, 0, 1);

  const safeIndex = ((index % total) + total) % total;
  const minCycle = Math.floor(-turns - 2);
  const maxCycle = Math.ceil(turns + 2);
  let nearest = clamp(currentProgress, 0, 1);
  let minDistance = Number.POSITIVE_INFINITY;

  for (let cycle = minCycle; cycle <= maxCycle; cycle += 1) {
    const progress = (safeIndex / total - 0.25 - cycle) / turns;
    if (progress < 0 || progress > 1) continue;

    const distance = Math.abs(progress - currentProgress);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = progress;
    }
  }

  if (!Number.isFinite(minDistance)) {
    return clamp((safeIndex / total - 0.25) / turns, 0, 1);
  }

  return nearest;
}

function useViewportWidth(viewportRef: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const update = () => setWidth(viewport.clientWidth || 1200);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [viewportRef]);

  return width;
}

export function OrbitalImageWheel({
  images,
  turns = DEFAULT_TURNS,
  blur = DEFAULT_BLUR,
  dim = DEFAULT_DIM,
  brightnessBoost = DEFAULT_BRIGHTNESS_BOOST,
  darknessStrength = DEFAULT_DARKNESS_STRENGTH,
  minSaturation = DEFAULT_MIN_SATURATION,
  saturationStrength = DEFAULT_SATURATION_STRENGTH,
  focusSpread = DEFAULT_FOCUS_SPREAD,
  scaleEffect = DEFAULT_SCALE_EFFECT,
  scrollSensitivity = DEFAULT_SCROLL_SENSITIVITY,
  itemWidth = DEFAULT_ITEM_WIDTH,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  wheelSize,
  cropRatio = DEFAULT_CROP_RATIO,
  scrollLength = DEFAULT_SCROLL_LENGTH,
  captionOffset = DEFAULT_CAPTION_OFFSET,
  showCaption = true,
  subtitleDirection = DEFAULT_SUBTITLE_DIRECTION,
  subtitleSpeed = DEFAULT_SUBTITLE_SPEED,
  subtitleStagger = DEFAULT_SUBTITLE_STAGGER,
  scrollContainerRef,
  autoplay = false,
  autoplaySecondsPerItem = DEFAULT_AUTOPLAY_SECONDS,
  autoplayLift = -24,
  className,
  header,
}: OrbitalImageWheelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const wheelScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const titleClickTweenRef = useRef<gsap.core.Tween | null>(null);
  const titleViewportRef = useRef<HTMLDivElement>(null);
  const titleTrackRef = useRef<HTMLDivElement>(null);
  const titleStartSpacerRef = useRef<HTMLSpanElement>(null);
  const titleEndSpacerRef = useRef<HTMLSpanElement>(null);
  const titleTrackXToRef = useRef<((value: number) => void) | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const orbitTweenRef = useRef<gsap.core.Tween | null>(null);
  const seatTweenRef = useRef<gsap.core.Tween | null>(null);
  const activeIndexRef = useRef(0);
  const radiusRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const viewportWidth = useViewportWidth(viewportRef);

  const boundedTurns = clamp(turns, 0.2, 4);
  const boundedBlur = clamp(blur, 0, 36);
  const boundedDim = clamp(dim, 0, 100);
  const boundedBrightnessBoost = clamp(brightnessBoost, 0, 120);
  const boundedDarknessStrength = clamp(darknessStrength, 0.2, 3);
  const boundedMinSaturation = clamp(minSaturation, 0, 100);
  const boundedSaturationStrength = clamp(saturationStrength, 0.2, 3);
  const boundedFocusSpread = clamp(focusSpread, 0.08, 0.8);
  const boundedScaleEffect = clamp(scaleEffect, 0, 0.3);
  const boundedScrollSensitivity = clamp(scrollSensitivity, 0.25, 1.6);
  const boundedItemWidth = clamp(itemWidth, 140, 520);
  const boundedItemHeight = clamp(itemHeight, 180, 620);
  const boundedCropRatio = clamp(cropRatio, 0.2, 0.8);
  const boundedScrollLength = clamp(scrollLength, 180, 700);
  const boundedCaptionOffset = clamp(captionOffset, 2, 22);
  const boundedSubtitleSpeed = clamp(subtitleSpeed, 0.3, 3);
  const boundedSubtitleStagger = clamp(subtitleStagger, 0, 0.08);
  const boundedSubtitleDirection =
    subtitleDirection === "bottom" ? "bottom" : "top";
  const boundedAutoplaySeconds = clamp(autoplaySecondsPerItem, 1.2, 6);
  const boundedAutoplayLift = clamp(autoplayLift, -220, 320);

  const responsiveWheelSize = clamp(viewportWidth * 1.65, 900, 2400);
  const boundedWheelSize = clamp(wheelSize ?? responsiveWheelSize, 700, 2600);
  const radius = boundedWheelSize / 2;
  radiusRef.current = radius;
  const wheelBottom = autoplay
    ? -(boundedWheelSize * boundedCropRatio) + boundedAutoplayLift
    : -(boundedWheelSize * boundedCropRatio);
  const titleLabels = useMemo(
    () => images.map((img, i) => img.label ?? img.alt ?? `Image ${i + 1}`),
    [images],
  );
  const titleTrackLabels = useMemo(() => titleLabels, [titleLabels]);
  const activeTitleTrackIndex = Math.max(
    0,
    Math.min(activeIndex, titleTrackLabels.length - 1),
  );

  const updateTitlePills = useCallback((nextIndex: number) => {
    const track = titleTrackRef.current;
    if (!track) return;

    track.querySelectorAll<HTMLButtonElement>("[data-title-index]").forEach((btn) => {
      const index = Number(btn.dataset.titleIndex);
      const distance = Math.abs(index - nextIndex);
      btn.classList.remove("is-active", "is-near", "is-far", "is-distant");
      if (distance === 0) btn.classList.add("is-active");
      else if (distance === 1) btn.classList.add("is-near");
      else if (distance === 2) btn.classList.add("is-far");
      else btn.classList.add("is-distant");
      if (distance === 0) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });

    const subtitle = subtitleRef.current;
    if (subtitle) {
      const image = images[nextIndex];
      subtitle.textContent = image?.subtitle ?? image?.alt ?? "";
    }

    const viewport = titleViewportRef.current;
    const activeTitle = track.querySelector<HTMLElement>(
      `[data-title-index="${nextIndex}"]`,
    );
    if (!viewport || !activeTitle || !titleTrackXToRef.current) return;

    const viewportWidthPx = viewport.clientWidth;
    const activeCenter = activeTitle.offsetLeft + activeTitle.offsetWidth / 2;
    let targetX = Math.round(viewportWidthPx / 2 - activeCenter);

    if (track.scrollWidth <= viewportWidthPx) {
      targetX = Math.round((viewportWidthPx - track.scrollWidth) / 2);
    } else {
      const minX = viewportWidthPx - track.scrollWidth;
      targetX = Math.round(clamp(targetX, minX, 0));
    }

    titleTrackXToRef.current(targetX);
  }, [images]);

  const positionAutoplayCards = useCallback(
    (orbitProgress = 0) => {
      const wheel = wheelRef.current;
      if (!wheel) return;

      const cards = Array.from(wheel.querySelectorAll<HTMLElement>(".oiw-item"));
      if (cards.length === 0) return;

      // Visible crown of the arc (below the header veil), not true top.
      const focusAnchor = -Math.PI / 2 + AUTOPLAY_FOCUS_TURN * Math.PI * 2;
      const focusArc = Math.PI * boundedFocusSpread;
      const currentRadius = radiusRef.current;
      const spin = -orbitProgress * Math.PI * 2;

      cards.forEach((card, index) => {
        // Index 0 starts on the visible focus seat.
        const base = focusAnchor + (index / cards.length) * Math.PI * 2;
        const theta = base + spin;
        const x = Math.cos(base) * currentRadius;
        const y = Math.sin(base) * currentRadius;
        const distanceToFocus = shortestAngleDistance(theta, focusAnchor);
        const focusIntensity = clamp(distanceToFocus / focusArc, 0, 1);
        const darkIntensity = clamp(
          focusIntensity * boundedDarknessStrength,
          0,
          1,
        );
        const currentScale = 1 - darkIntensity * boundedScaleEffect;

        gsap.set(card, {
          x,
          y,
          xPercent: -50,
          yPercent: -50,
          rotate: 0,
          scale: currentScale,
          opacity: 0.34 + (1 - darkIntensity) * 0.66,
          zIndex: Math.round((1 - focusIntensity) * 100),
          force3D: true,
        });
      });
    },
    [boundedDarknessStrength, boundedFocusSpread, boundedScaleEffect],
  );

  const handleTitleClick = useCallback(
    (index: number) => {
      if (autoplay) {
        const count = images.length;
        if (count === 0) return;
        const progress = (index % count) / count;
        orbitTweenRef.current?.progress(progress);
        seatTweenRef.current?.progress(progress);
        positionAutoplayCards(progress);
        activeIndexRef.current = index;
        setActiveIndex(index);
        updateTitlePills(index);
        return;
      }
      const trigger = wheelScrollTriggerRef.current;
      if (!trigger || images.length === 0) return;

      const currentProgress = clamp(trigger.progress, 0, 1);
      const targetProgress = getSnapProgressForIndex(
        index,
        images.length,
        boundedTurns,
        currentProgress,
      );

      const scrollStart = trigger.start;
      const scrollEnd = trigger.end;
      const scrollRange = scrollEnd - scrollStart;
      if (scrollRange <= 0) return;

      const fromScroll = scrollStart + currentProgress * scrollRange;
      const toScroll = scrollStart + targetProgress * scrollRange;

      setActiveIndex(index);
      titleClickTweenRef.current?.kill();

      const proxy = { scroll: fromScroll };
      titleClickTweenRef.current = gsap.to(proxy, {
        scroll: toScroll,
        duration: 0.58,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          trigger.scroll(proxy.scroll);
        },
        onComplete: () => {
          setActiveIndex(index);
        },
      });
    },
    [
      autoplay,
      images.length,
      boundedTurns,
      positionAutoplayCards,
      updateTitlePills,
    ],
  );

  useEffect(() => {
    if (!autoplay) return;

    const orbit = orbitRef.current;
    const count = images.length;
    if (!orbit || count === 0) return;

    const period = count * boundedAutoplaySeconds;
    const seats = orbit.querySelectorAll<HTMLElement>(".oiw-seat");

    const syncFromProgress = (progress: number) => {
      const nextIndex = Math.round(progress * count) % count;
      positionAutoplayCards(progress);
      if (nextIndex === activeIndexRef.current) return;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      updateTitlePills(nextIndex);
    };

    gsap.set(orbit, { rotation: 0, transformOrigin: "50% 50%" });
    gsap.set(seats, { rotation: 0, transformOrigin: "50% 50%" });
    positionAutoplayCards(0);
    activeIndexRef.current = 0;
    setActiveIndex(0);
    updateTitlePills(0);

    let sectionLive = true;
    let syncSkip = 0;
    const orbitTween = gsap.to(orbit, {
      rotation: -360,
      duration: period,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        if (document.hidden || !sectionLive) return;
        // Half-rate sync: still smooth, half the gsap.set work on 20 cards.
        syncSkip = (syncSkip + 1) % 2;
        if (syncSkip !== 0) return;
        syncFromProgress(orbitTween.progress());
      },
    });
    const seatTween = gsap.to(seats, {
      rotation: 360,
      duration: period,
      ease: "none",
      repeat: -1,
    });
    orbitTweenRef.current = orbitTween;
    seatTweenRef.current = seatTween;

    const applyOrbitLive = () => {
      const live = sectionLive && !document.hidden;
      if (live) {
        orbitTween.resume();
        seatTween.resume();
      } else {
        orbitTween.pause();
        seatTween.pause();
      }
    };

    const onVis = () => applyOrbitLive();
    document.addEventListener("visibilitychange", onVis);

    const liveHost =
      (sectionRef.current?.closest("#resume") as HTMLElement | null) ??
      sectionRef.current;
    const unbindLive = liveHost
      ? bindLiveSection(liveHost, (live) => {
          sectionLive = live;
          applyOrbitLive();
        })
      : undefined;

    const viewport = viewportRef.current;
    let resizeTimer = 0;
    const observer = viewport
      ? new ResizeObserver(() => {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => {
            syncFromProgress(orbitTween.progress());
          }, 120);
        })
      : null;
    if (viewport && observer) observer.observe(viewport);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      unbindLive?.();
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      orbitTween.kill();
      seatTween.kill();
      orbitTweenRef.current = null;
      seatTweenRef.current = null;
    };
  }, [
    autoplay,
    images.length,
    boundedAutoplaySeconds,
    positionAutoplayCards,
    updateTitlePills,
  ]);

  useEffect(() => {
    return () => {
      titleClickTweenRef.current?.kill();
      wheelScrollTriggerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (autoplay) return;

    const section = sectionRef.current;
    const wheel = wheelRef.current;
    if (!section || !wheel || images.length === 0) return;

    let previousActive = -1;

    const context = gsap.context(() => {
      const cards = Array.from(
        wheel.querySelectorAll<HTMLElement>(".oiw-item"),
      );
      if (cards.length === 0) return;

      const topAnchor = -Math.PI / 2;
      const focusArc = Math.PI * boundedFocusSpread;

      const applyState = (rawProgress: number) => {
        const p = applyScrollSensitivity(rawProgress, boundedScrollSensitivity);
        const rotation = -p * boundedTurns * Math.PI * 2;
        const focusedIndex = getFocusedImageIndexWithHysteresis(
          p,
          cards.length,
          boundedTurns,
          previousActive,
        );

        cards.forEach((card, index) => {
          const base = (index / cards.length) * Math.PI * 2 - Math.PI;
          const theta = base + rotation;
          const x = Math.cos(theta) * radius;
          const y = Math.sin(theta) * radius;

          const distanceToFocus = shortestAngleDistance(theta, topAnchor);
          const focusIntensity = clamp(distanceToFocus / focusArc, 0, 1);

          const darkIntensity = clamp(
            focusIntensity * boundedDarknessStrength,
            0,
            1,
          );
          const saturationIntensity = clamp(
            focusIntensity * boundedSaturationStrength,
            0,
            1,
          );

          const currentBlur = darkIntensity * boundedBlur;
          const peakBrightness = clamp(100 + boundedBrightnessBoost, 100, 220);
          const currentBrightness =
            boundedDim + (1 - darkIntensity) * (peakBrightness - boundedDim);
          const currentSaturation =
            boundedMinSaturation +
            (1 - saturationIntensity) * (100 - boundedMinSaturation);
          const currentScale = 1 - darkIntensity * boundedScaleEffect;
          const drift = clamp(x / radius, -1, 1);
          const tilt = drift * 8;
          const depth = clamp((1 - focusIntensity) * 100, 0, 100);

          gsap.set(card, {
            x,
            y,
            xPercent: -50,
            yPercent: -50,
            z: depth,
            rotate: tilt,
            scale: currentScale,
            filter: `blur(${currentBlur}px) brightness(${currentBrightness}%) saturate(${currentSaturation}%)`,
            zIndex: Math.round(depth),
          });
        });

        if (focusedIndex !== previousActive) {
          previousActive = focusedIndex;
          setActiveIndex(focusedIndex);
        }
      };

      applyState(0);

      const trigger = ScrollTrigger.create({
        trigger: section,
        scroller: scrollContainerRef?.current ?? undefined,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          applyState(self.progress);
        },
      });

      wheelScrollTriggerRef.current = trigger;
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, [
    autoplay,
    scrollContainerRef,
    images,
    radius,
    boundedTurns,
    boundedBlur,
    boundedDim,
    boundedBrightnessBoost,
    boundedDarknessStrength,
    boundedMinSaturation,
    boundedSaturationStrength,
    boundedFocusSpread,
    boundedScaleEffect,
    boundedScrollSensitivity,
  ]);

  useLayoutEffect(() => {
    const viewport = titleViewportRef.current;
    const track = titleTrackRef.current;
    const startSpacer = titleStartSpacerRef.current;
    const endSpacer = titleEndSpacerRef.current;
    if (!viewport || !track || titleTrackLabels.length === 0) return;

    if (!titleTrackXToRef.current) {
      titleTrackXToRef.current = gsap.quickTo(track, "x", {
        duration: 0.34,
        ease: "power2.out",
        overwrite: true,
      });
    }

    const firstTitle = track.querySelector<HTMLElement>(
      `[data-title-index="0"]`,
    );
    const lastTitle = track.querySelector<HTMLElement>(
      `[data-title-index="${titleTrackLabels.length - 1}"]`,
    );
    if (!firstTitle || !lastTitle) return;

    const viewportWidthPx = viewport.clientWidth;

    const startPad = Math.max(
      0,
      viewportWidthPx / 2 - firstTitle.offsetWidth / 2,
    );
    const endPad = Math.max(0, viewportWidthPx / 2 - lastTitle.offsetWidth / 2);

    if (startSpacer) {
      startSpacer.style.width = `${Math.round(startPad)}px`;
    }

    if (endSpacer) {
      endSpacer.style.width = `${Math.round(endPad)}px`;
    }

    if (autoplay) {
      updateTitlePills(activeIndexRef.current);
      return;
    }

    const activeTitle = track.querySelector<HTMLElement>(
      `[data-title-index="${activeTitleTrackIndex}"]`,
    );
    if (!activeTitle) return;

    const activeCenter = activeTitle.offsetLeft + activeTitle.offsetWidth / 2;
    let targetX = Math.round(viewportWidthPx / 2 - activeCenter);

    if (track.scrollWidth <= viewportWidthPx) {
      targetX = Math.round((viewportWidthPx - track.scrollWidth) / 2);
    } else {
      const minX = viewportWidthPx - track.scrollWidth;
      targetX = Math.round(clamp(targetX, minX, 0));
    }

    titleTrackXToRef.current(targetX);
  }, [
    activeTitleTrackIndex,
    autoplay,
    titleTrackLabels,
    updateTitlePills,
    viewportWidth,
  ]);

  const activeImage = useMemo(() => {
    if (images.length === 0) return null;
    return images[activeIndex] ?? images[0];
  }, [images, activeIndex]);

  if (images.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={cn("relative w-full", className)}
      style={autoplay ? { height: "100svh" } : { height: `${boundedScrollLength}vh` }}
    >
      <div
        ref={viewportRef}
        className={cn(
          "oiw-viewport w-full",
          autoplay
            ? "relative h-full overflow-x-clip overflow-y-visible"
            : "sticky top-0 h-screen overflow-hidden",
        )}
      >
        {header ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[200]"
          >
            {header}
          </div>
        ) : null}

        <div
          ref={wheelRef}
          className="oiw-wheel oiw-stage absolute left-1/2 z-[1] -translate-x-1/2 overflow-visible"
          style={{
            width: boundedWheelSize,
            height: boundedWheelSize,
            bottom: `${wheelBottom}px`,
          }}
        >
          <div
            ref={orbitRef}
            className="relative h-full w-full"
            style={{ perspective: "1200px" }}
          >
            {images.map((img, i) => (
              <figure
                key={i}
                className="oiw-item absolute left-1/2 top-1/2 m-0 overflow-hidden rounded-xl"
                style={{ width: boundedItemWidth, height: boundedItemHeight }}
              >
                <div className="oiw-seat">
                  <div className="oiw-plate">
                    <div
                      className="absolute inset-0 h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img.src})` }}
                      role="img"
                      aria-label={img.alt ?? img.label ?? `Image ${i + 1}`}
                    />
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>

        {showCaption && activeImage && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 z-30 flex justify-center",
              autoplay && "oiw-dock",
            )}
            style={{ bottom: `${boundedCaptionOffset}vh` }}
          >
            <div className="px-6 text-center">
              {autoplay ? (
                <p ref={subtitleRef} className="oiw-subtitle">
                  {images[activeTitleTrackIndex]?.subtitle ??
                    images[activeTitleTrackIndex]?.alt ??
                    ""}
                </p>
              ) : (
                <MotionSubtitle
                  text={activeImage.subtitle ?? activeImage.alt ?? "Visual Story"}
                  direction={boundedSubtitleDirection}
                  speed={boundedSubtitleSpeed}
                  stagger={boundedSubtitleStagger}
                  className="mb-2 text-[clamp(0.8rem,1vw,0.95rem)] tracking-[0.04em] text-foreground/45"
                />
              )}

              <div
                ref={titleViewportRef}
                className="pointer-events-auto mx-auto w-[min(92vw,760px)] overflow-hidden py-1"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
                }}
              >
                <div ref={titleTrackRef} className="flex w-max items-center">
                  <span
                    ref={titleStartSpacerRef}
                    aria-hidden
                    className="block h-px shrink-0"
                  />

                  {titleTrackLabels.map((title, i) => (
                    <button
                      type="button"
                      key={`${title}-${i}`}
                      data-title-index={i}
                      onClick={() => handleTitleClick(i)}
                      className={cn(
                        "oiw-title-item mr-3 inline-flex shrink-0 cursor-pointer appearance-none items-center justify-center whitespace-nowrap rounded-full border border-foreground/35 px-7 py-2 text-center leading-none text-[clamp(1.05rem,2.25vw,2rem)] font-medium tracking-tight transition-[opacity,transform,color,border-color] duration-300",
                        i === activeTitleTrackIndex
                          ? "is-active border-foreground/40 text-foreground"
                          : Math.abs(i - activeTitleTrackIndex) === 1
                            ? "is-near border-foreground/28 text-foreground/45"
                            : Math.abs(i - activeTitleTrackIndex) === 2
                              ? "is-far border-foreground/28 text-foreground/45"
                              : "is-distant border-foreground/28 text-foreground/45",
                      )}
                    >
                      {title}
                    </button>
                  ))}

                  <span
                    ref={titleEndSpacerRef}
                    aria-hidden
                    className="block h-px shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default OrbitalImageWheel;
