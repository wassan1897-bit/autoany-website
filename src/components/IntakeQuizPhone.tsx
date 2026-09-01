import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import IphoneControlCenter from "./IphoneControlCenter";
import IphoneHomeQuiz from "./IphoneHomeQuiz";
import IphoneNowPlaying from "./IphoneNowPlaying";
import IphoneWallpaper from "./IphoneWallpaper";
import { useTheme } from "../lib/theme";
import { useBattery } from "../lib/useBattery";
import { useSpotifyEmbed } from "../lib/useSpotifyEmbed";
import "./IphoneLock.css";

const FRAME_W = 415;
const FRAME_H = 874;
const UNLOCK_RATIO = 0.32;
const FLICK_VY = 0.72;
const CC_RATIO = 0.32;
const CC_TRAVEL_RATIO = 0.46;

function rubberProgress(n: number) {
  if (n > 1) return 1 + (n - 1) * 0.16;
  if (n < 0) return n * 0.16;
  return n;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useFrameScale(hostRef: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const apply = () => {
      const next = host.clientWidth / FRAME_W;
      setScale(Number.isFinite(next) && next > 0 ? Math.min(1, next) : 1);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(host);
    return () => observer.disconnect();
  }, [hostRef]);

  return scale;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeParts = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).formatToParts(now);
  const hour = timeParts.find((part) => part.type === "hour")?.value ?? "";
  const minute = timeParts.find((part) => part.type === "minute")?.value ?? "";
  const time = `${hour}:${minute}`;

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(now);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(now);
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(now);
  const date = `${weekday} ${month} ${day}`;

  const hour24 = now.getHours();
  const period: "day" | "evening" | "night" =
    hour24 >= 6 && hour24 < 17 ? "day" : hour24 >= 17 && hour24 < 20 ? "evening" : "night";

  return { hour, minute, time, date, period };
}

function TimePeriodIcon({ period }: { period: "day" | "evening" | "night" }) {
  if (period === "night") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#dfe7ff"
          d="M20.5 14.9a8.2 8.2 0 0 1-10.9-9.8 0.9 0.9 0 0 0-1.2-1.1A9.6 9.6 0 1 0 21.6 16a0.9 0.9 0 0 0-1.1-1.1Z"
        />
      </svg>
    );
  }
  if (period === "evening") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <g fill="none" stroke="#ffcf8f" strokeWidth="1.7" strokeLinecap="round">
          <path d="M4 18h16" />
          <path d="M7.5 18a4.5 4.5 0 0 1 9 0" fill="#ffb65c" stroke="none" />
          <path d="M12 4.5v2.4M5.6 7.1l1.7 1.7M18.4 7.1l-1.7 1.7M2.8 13.4h1.8M19.4 13.4h1.8" />
        </g>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4.4" fill="#ffd66b" />
      <g stroke="#ffd66b" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.3 5.3l1.85 1.85M16.85 16.85l1.85 1.85M18.7 5.3l-1.85 1.85M7.15 16.85 5.3 18.7" />
      </g>
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden>
      <rect x="0" y="8" width="3" height="4" rx="0.6" fill="white" />
      <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.6" fill="white" />
      <rect x="9" y="3" width="3" height="9" rx="0.6" fill="white" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.6" fill="white" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
      <path
        d="M1.2 4.4C4.6 1.4 11.4 1.4 14.8 4.4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.4 6.6C5.7 4.6 10.3 4.6 12.6 6.6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.8 8.7C7 7.7 9 7.7 10.2 8.7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.6" r="1.05" fill="white" />
    </svg>
  );
}

function BatteryIcon({
  percent,
  charging,
}: {
  percent: number | null;
  charging: boolean;
}) {
  const level = percent ?? 0;
  const known = percent != null;
  const low = known && level <= 20 && !charging;
  const fill = charging || low ? undefined : "#fff";
  const color = !known ? "transparent" : low ? "#ff453a" : charging ? "#30d158" : "#fff";
  const textColor = !known ? "#fff" : charging || low ? "#fff" : "#111";

  return (
    <span
      className="iphone-battery"
      aria-label={
        known
          ? `Battery ${level} percent${charging ? ", charging" : ""}`
          : "Battery level unavailable"
      }
    >
      <span className="iphone-battery-body">
        <span
          className="iphone-battery-fill"
          style={{ width: known ? `${Math.max(6, level)}%` : "0%", background: color || fill }}
        />
        {known ? (
          <span className="iphone-battery-pct" style={{ color: textColor }}>
            {level}
          </span>
        ) : null}
      </span>
      <span className="iphone-battery-nub" />
    </span>
  );
}

function FlashlightIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8.2 3.2h7.6l1.3 3.6H6.9l1.3-3.6Z" fill="white" />
      <path
        d="M7.1 7.2h9.8v8.2c0 1.85-1.45 3.3-3.3 3.3h-3.2c-1.85 0-3.3-1.45-3.3-3.3V7.2Z"
        fill="white"
      />
      <circle cx="12" cy="11.1" r="1.3" fill="#1c1c1e" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.15 5h1.05l.75-1.15h2.1L13.8 5h1.05A2.7 2.7 0 0 1 17.55 7.7v8.45A2.7 2.7 0 0 1 14.85 18.85H9.15A2.7 2.7 0 0 1 6.45 16.15V7.7A2.7 2.7 0 0 1 9.15 5Z"
        fill="white"
      />
      <circle cx="12" cy="12.15" r="3.05" fill="#1c1c1e" />
      <circle cx="12" cy="12.15" r="1.85" fill="white" />
    </svg>
  );
}

type DragKind = "unlock" | "cc";

export default function IntakeQuizPhone({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const scale = useFrameScale(hostRef);
  const reducedMotion = usePrefersReducedMotion();
  const { hour, minute, time, date, period } = useClock();
  const { theme, toggleTheme } = useTheme();
  const { percent: batteryPercent, charging } = useBattery();
  const [volume, setVolume] = useState(0.72);
  const player = useSpotifyEmbed(volume);

  const [unlocked, setUnlocked] = useState(false);
  const [ccOpen, setCcOpen] = useState(false);
  const [ccProgress, setCcProgress] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [silentOn, setSilentOn] = useState(false);
  const [orientationLocked, setOrientationLocked] = useState(false);
  const [airplaneOn, setAirplaneOn] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [cellularOn, setCellularOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [focusOn, setFocusOn] = useState(false);
  const [inView, setInView] = useState(true);

  const draggingRef = useRef(false);
  const dragKindRef = useRef<DragKind>("unlock");
  const dragRef = useRef({ startY: 0, origin: 0 });
  const velRef = useRef({ t: 0, y: 0, vy: 0 });

  const screenHeight = () => screenRef.current?.clientHeight ?? 848;
  const screenWidth = () => screenRef.current?.clientWidth ?? 389;
  const ccTravel = () => screenHeight() * CC_TRAVEL_RATIO;

  const visualScale = () => {
    const screen = screenRef.current;
    if (!screen || screen.clientHeight === 0) return 1;
    return screen.getBoundingClientRect().height / screen.clientHeight;
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0, rootMargin: "80px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (silentOn && player.playing) player.pause();
  }, [silentOn, player.playing, player.pause]);

  const finishUnlock = useCallback(() => {
    setCcOpen(false);
    setCcProgress(0);
    setDragY(screenHeight());
    setUnlocked(true);
  }, []);

  const lockPhone = useCallback(() => {
    setCcOpen(false);
    setCcProgress(0);
    setDragY(0);
    setUnlocked(false);
  }, []);

  const openCc = useCallback(() => {
    setCcProgress(1);
    setCcOpen(true);
  }, []);

  const closeCc = useCallback(() => {
    setCcProgress(0);
    setCcOpen(false);
  }, []);

  const startSwipe = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button, [data-page-scroll]")) return;
    const screen = screenRef.current;
    if (!screen) return;
    const rect = screen.getBoundingClientRect();
    const vs = visualScale() || 1;
    const localY = (e.clientY - rect.top) / vs;
    const localX = (e.clientX - rect.left) / vs;
    const h = screenHeight();
    const w = screenWidth();
    const island =
      localY < 52 && localX > w * 0.28 && localX < w * 0.72 && !ccOpen;

    if (island) return;

    let kind: DragKind | null = null;
    if (ccOpen || ccProgress > 0.04) kind = "cc";
    else if (localY < 78 && localX > w * 0.58) kind = "cc";
    else if (!unlocked && localY > h * 0.78) kind = "unlock";
    if (!kind) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragKindRef.current = kind;
    dragRef.current = {
      startY: e.clientY,
      origin: kind === "cc" ? (ccOpen ? 1 : ccProgress) : dragY,
    };
    velRef.current = { t: performance.now(), y: e.clientY, vy: 0 };
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - velRef.current.t);
    velRef.current = {
      t: now,
      y: e.clientY,
      vy: (e.clientY - velRef.current.y) / dt,
    };
    const vs = visualScale() || 1;
    if (dragKindRef.current === "cc") {
      const delta = (e.clientY - dragRef.current.startY) / vs / ccTravel();
      setCcProgress(rubberProgress(dragRef.current.origin + delta));
      return;
    }
    if (unlocked) return;
    const dy = (dragRef.current.startY - e.clientY) / vs;
    setDragY(Math.min(screenHeight(), Math.max(0, dragRef.current.origin + dy)));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const vs = visualScale() || 1;

    if (dragKindRef.current === "cc") {
      const delta = (e.clientY - dragRef.current.startY) / vs / ccTravel();
      const next = Math.min(1, Math.max(0, dragRef.current.origin + delta));
      const flickedOpen = velRef.current.vy > FLICK_VY;
      const flickedClose = velRef.current.vy < -FLICK_VY;
      if (flickedClose) closeCc();
      else if (flickedOpen || next >= CC_RATIO) openCc();
      else closeCc();
      return;
    }

    if (unlocked) return;
    const dy = (dragRef.current.startY - e.clientY) / vs;
    const next = Math.min(screenHeight(), Math.max(0, dragRef.current.origin + dy));
    const flicked = -velRef.current.vy > FLICK_VY && next > 20;
    if (next / screenHeight() >= UNLOCK_RATIO || flicked) finishUnlock();
    else setDragY(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeCc();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openCc();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (ccOpen) closeCc();
      else if (!unlocked) finishUnlock();
      return;
    }
    if (unlocked || ccOpen) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      finishUnlock();
    }
  };

  const lockAway = unlocked ? screenHeight() : dragY;
  const lockProgress = Math.min(1, lockAway / (screenHeight() * 0.55));
  const lockEase = "cubic-bezier(0.22, 1, 0.36, 1)";
  const lockTransition =
    dragging || reducedMotion
      ? "none"
      : unlocked
        ? `transform 640ms ${lockEase}, opacity 480ms ${lockEase}`
        : `transform 520ms ${lockEase}, opacity 360ms ${lockEase}`;
  const ccShown = ccOpen ? 1 : ccProgress;

  const jumpPastPhone = () => {
    window.dispatchEvent(new CustomEvent("site-scroll-to", { detail: "resume" }));
  };

  return (
    <div className={`w-full overflow-x-clip ${className}`.trim()}>
      <div
        ref={hostRef}
        className="relative mx-auto w-full max-w-[415px]"
        style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
      >
        <div
          className="absolute top-1/2 left-1/2 origin-center overflow-clip"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            borderRadius: 66,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <div className="iphone-device">
            <span className="iphone-antenna iphone-antenna--l-top" aria-hidden />
            <span className="iphone-antenna iphone-antenna--r-top" aria-hidden />
            <span className="iphone-antenna iphone-antenna--l-bot" aria-hidden />
            <span className="iphone-antenna iphone-antenna--r-bot" aria-hidden />
            <span className="iphone-btn iphone-btn--silent" aria-hidden />
            <span className="iphone-btn iphone-btn--vol-up" aria-hidden />
            <span className="iphone-btn iphone-btn--vol-down" aria-hidden />
            <button
              type="button"
              className="iphone-btn iphone-btn--power"
              aria-label={unlocked ? "Lock iPhone" : "Side button"}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                if (unlocked) lockPhone();
                else screenRef.current?.focus();
              }}
            />
            <div className="iphone-bezel">
              <div
                ref={screenRef}
                role="application"
                tabIndex={0}
                aria-label={
                  ccOpen
                    ? "iPhone Control Center, swipe up to close"
                    : unlocked
                      ? "iPhone unlocked, swipe down from the top right for Control Center"
                      : "iPhone lock screen, swipe up to unlock, swipe down from the top right for Control Center"
                }
                onPointerDown={startSwipe}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={onKeyDown}
                className={[
                  "iphone-screen",
                  ccShown > 0.12 ? "is-cc-open" : "",
                  dragging ? "is-gesturing" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <IphoneWallpaper
                  unlocked={unlocked}
                  reducedMotion={reducedMotion}
                  paused={!inView}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.18) 100%)",
                    opacity: 1 - lockProgress,
                    transition: dragging || reducedMotion ? "none" : `opacity 360ms ${lockEase}`,
                  }}
                />
                {flashlightOn ? <div className="iphone-flashlight" aria-hidden /> : null}
                {brightness < 0.99 ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-50 bg-black"
                    style={{ opacity: 1 - brightness }}
                    aria-hidden
                  />
                ) : null}

                <div
                  className="iphone-home-stage"
                  style={{
                    opacity: lockProgress,
                    transform: `scale(${0.94 + lockProgress * 0.06})`,
                    transition:
                      dragging || reducedMotion
                        ? "none"
                        : `opacity 480ms ${lockEase}, transform 640ms ${lockEase}`,
                    pointerEvents: unlocked && ccShown < 0.12 ? "auto" : "none",
                  }}
                >
                  <IphoneHomeQuiz revealed={unlocked} reducedMotion={reducedMotion} onLock={lockPhone} />
                </div>

                <div className="iphone-island" aria-hidden>
                  <span className="iphone-island-lens" />
                </div>

                <span
                  className="iphone-live-pill"
                  aria-label={`Time ${time}`}
                  style={{
                    pointerEvents: "none",
                  }}
                >
                  <span className="iphone-live-weather" aria-hidden>
                    <TimePeriodIcon period={period} />
                  </span>
                  <span className="iphone-live-hour">{hour}</span>
                  <span className="iphone-live-colon" aria-hidden>
                    <i />
                    <i />
                  </span>
                  <span className="iphone-live-minute">{minute}</span>
                </span>
                <div className="iphone-status-trail">
                  <button
                    type="button"
                    data-page-scroll
                    className="iphone-status-scroll"
                    aria-label="Scroll down"
                    hidden={ccShown > 0.12}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={jumpPastPhone}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                      <path
                        d="M2.2 4.2 6 8l3.8-3.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <SignalIcon />
                  <WifiIcon />
                  <BatteryIcon percent={batteryPercent} charging={charging} />
                </div>

                <div
                  className="iphone-lock-layer"
                  style={{
                    zIndex: 3,
                    pointerEvents: unlocked ? "none" : "auto",
                    transform: `translate3d(0, ${-lockAway}px, 0) scale(${1 - lockProgress * 0.04})`,
                    opacity: 1 - lockProgress * 0.92,
                    transformOrigin: "50% 100%",
                    transition: lockTransition,
                  }}
                >
                  <div className="iphone-lock-timeblock">
                    <p className="iphone-date">{date}</p>
                    <p className="iphone-clock">
                      <span className="iphone-clock-inner">
                        <span className="iphone-clock-num">{hour}</span>
                        <span className="iphone-clock-colon" aria-hidden>
                          <i />
                          <i />
                        </span>
                        <span className="iphone-clock-num">{minute}</span>
                      </span>
                    </p>
                  </div>

                  <div className="iphone-lock-now">
                    <IphoneNowPlaying
                      title={player.track.title}
                      artist={player.track.artist}
                      albumArt={player.track.art}
                      playing={player.playing}
                      progress={player.progress}
                      durationLabel={player.durationLabel}
                      onTogglePlay={player.togglePlay}
                      onPrev={player.prev}
                      onNext={player.next}
                    />
                  </div>

                  <div className="iphone-lock-actions">
                    <button
                      type="button"
                      className={`iphone-glass-btn${flashlightOn ? " is-on" : ""}`}
                      aria-label="Flashlight"
                      aria-pressed={flashlightOn}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setFlashlightOn((on) => !on)}
                    >
                      <FlashlightIcon />
                    </button>
                    <button
                      type="button"
                      className="iphone-glass-btn"
                      aria-label="Camera"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <CameraIcon />
                    </button>
                  </div>
                  <p className="iphone-unlock-hint">Swipe up to unlock</p>
                </div>

                <IphoneControlCenter
                  open={ccOpen}
                  progress={ccShown}
                  dragging={dragging && dragKindRef.current === "cc"}
                  reducedMotion={reducedMotion}
                  time={time}
                  batteryPercent={batteryPercent}
                  batteryCharging={charging}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  onUnlock={finishUnlock}
                  onLock={lockPhone}
                  phoneUnlocked={unlocked}
                  brightness={brightness}
                  onBrightness={setBrightness}
                  volume={volume}
                  onVolume={setVolume}
                  flashlightOn={flashlightOn}
                  onToggleFlashlight={() => setFlashlightOn((on) => !on)}
                  silentOn={silentOn}
                  onToggleSilent={() => setSilentOn((on) => !on)}
                  orientationLocked={orientationLocked}
                  onToggleOrientation={() => setOrientationLocked((on) => !on)}
                  airplaneOn={airplaneOn}
                  onToggleAirplane={() => {
                    setAirplaneOn((on) => {
                      const next = !on;
                      if (next) {
                        setWifiOn(false);
                        setCellularOn(false);
                      } else {
                        setWifiOn(true);
                        setCellularOn(true);
                      }
                      return next;
                    });
                  }}
                  wifiOn={wifiOn}
                  onToggleWifi={() => setWifiOn((on) => !on)}
                  cellularOn={cellularOn}
                  onToggleCellular={() => setCellularOn((on) => !on)}
                  bluetoothOn={bluetoothOn}
                  onToggleBluetooth={() => setBluetoothOn((on) => !on)}
                  focusOn={focusOn}
                  onToggleFocus={() => setFocusOn((on) => !on)}
                  trackTitle={player.track.title}
                  trackArtist={player.track.artist}
                  albumArt={player.track.art}
                  playing={player.playing}
                  trackProgress={player.progress}
                  onTogglePlay={player.togglePlay}
                  onPrev={player.prev}
                  onNext={player.next}
                />

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-[8px] z-30 flex justify-center"
                >
                  <span className="iphone-home-bar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
