import {
  useCallback,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import "./IphoneControlCenter.css";

export type IphoneControlCenterProps = {
  open: boolean;
  progress: number;
  reducedMotion?: boolean;
  dragging?: boolean;
  time: string;
  batteryPercent: number | null;
  batteryCharging: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onUnlock: () => void;
  onLock: () => void;
  phoneUnlocked: boolean;
  brightness: number;
  onBrightness: (v: number) => void;
  volume: number;
  onVolume: (v: number) => void;
  flashlightOn: boolean;
  onToggleFlashlight: () => void;
  silentOn: boolean;
  onToggleSilent: () => void;
  orientationLocked: boolean;
  onToggleOrientation: () => void;
  airplaneOn: boolean;
  onToggleAirplane: () => void;
  wifiOn: boolean;
  onToggleWifi: () => void;
  cellularOn: boolean;
  onToggleCellular: () => void;
  bluetoothOn: boolean;
  onToggleBluetooth: () => void;
  focusOn: boolean;
  onToggleFocus: () => void;
  trackTitle: string;
  trackArtist: string;
  albumArt: string;
  playing: boolean;
  trackProgress?: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPointerDownSlider?: (e: ReactPointerEvent) => void;
};

function halt(e: ReactPointerEvent) {
  e.stopPropagation();
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function AirplaneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M3.1 13.15 12.2 9.7 21 13.2v-1.85L13.35 7.7V3.85A1.6 1.6 0 0 0 11.7 2.3 1.6 1.6 0 0 0 10.1 3.85V7.7L2.4 11.35v1.8Zm7.2 6.55-2.05 1.55v1.45l3.45-1 3.45 1v-1.45L13.1 19.7v-4.55l7.9 1.55v-1.7l-7.9-3.15v7.85Z"
        transform="rotate(-48 12 12)"
      />
    </svg>
  );
}

function CellularIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.1" y="14.4" width="3.4" height="6.1" rx="1.05" fill="currentColor" />
      <rect x="7.9" y="10.6" width="3.4" height="9.9" rx="1.05" fill="currentColor" />
      <rect x="12.7" y="6.8" width="3.4" height="13.7" rx="1.05" fill="currentColor" />
      <rect x="17.5" y="3.5" width="3.4" height="17" rx="1.05" fill="currentColor" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="21" height="16" viewBox="0 0 24 18" fill="none" aria-hidden>
      <path
        d="M2.35 5.85a14.2 14.2 0 0 1 19.3 0"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        d="M5.55 9.15a9.4 9.4 0 0 1 12.9 0"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        d="M8.85 12.4a4.6 4.6 0 0 1 6.3 0"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.85" r="1.55" fill="currentColor" />
    </svg>
  );
}

function BluetoothIcon() {
  return (
    <svg width="14" height="22" viewBox="0 0 14 24" fill="none" aria-hidden>
      <path
        d="M6.55 12 1.7 7.45l1.55-1.5 4.15 3.9V2.2l6.35 5.05-4.55 3.55 4.55 3.55-6.35 5.05v-7.65l-4.15 3.9-1.55-1.5L6.55 12Zm1.85-4.55 1.95-1.52-1.95-1.55v3.07Zm0 12.15 1.95-1.55-1.95-1.52v3.07Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden>
      <path
        d="M12.55 2.15c.72-.48 1.7.04 1.7.9v11.9c0 .86-.98 1.38-1.7.9L3.7 9.9a1.08 1.08 0 0 1 0-1.8l8.85-5.95Z"
        fill="currentColor"
      />
      <rect x="2.05" y="2.35" width="2.15" height="13.3" rx="1.05" fill="currentColor" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden>
      <path
        d="M7.45 2.15c-.72-.48-1.7.04-1.7.9v11.9c0 .86.98 1.38 1.7.9L16.3 9.9a1.08 1.08 0 0 0 0-1.8L7.45 2.15Z"
        fill="currentColor"
      />
      <rect x="15.8" y="2.35" width="2.15" height="13.3" rx="1.05" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 16 18" fill="none" aria-hidden>
      <path
        d="M3.05 1.55c0-.74.8-1.2 1.45-.83L14.7 8.17c.64.37.64 1.29 0 1.66L4.5 17.28c-.65.37-1.45-.09-1.45-.83V1.55Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden>
      <rect x="1.4" y="1.5" width="4.4" height="15" rx="1.35" fill="currentColor" />
      <rect x="10.2" y="1.5" width="4.4" height="15" rx="1.35" fill="currentColor" />
    </svg>
  );
}

function AirPlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.2 5.1A2.4 2.4 0 0 1 7.6 2.7h8.8A2.4 2.4 0 0 1 18.8 5.1v7.4a2.4 2.4 0 0 1-2.4 2.4h-1.05"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M5.2 12.5v.2A2.4 2.4 0 0 0 7.6 15.1h1.1"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path d="M12 14.05 6.35 21.2h11.3L12 14.05Z" fill="currentColor" />
    </svg>
  );
}

function OrientationLockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.15 10.35V8.05a3.85 3.85 0 0 1 7.55-.35"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <rect x="6.2" y="10.15" width="11.6" height="8.85" rx="2.2" fill="currentColor" />
      <path
        d="M18.05 5.15a6.4 6.4 0 0 1 2.7 5.05"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M19.55 3.55v2.7h-2.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SilentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3.2A5.7 5.7 0 0 0 6.35 8.85v2.2L4.7 14.5h6.05L18.2 7.05A5.68 5.68 0 0 0 12 3.2ZM9.45 17.55a2.55 2.55 0 0 0 4.55 1.55L12.3 17.4H9.45ZM4.1 4.15a.9.9 0 0 1 1.27 0L19.9 18.68a.9.9 0 1 1-1.27 1.27L4.1 5.42a.9.9 0 0 1 0-1.27Z"
      />
    </svg>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.05 2.85A9.15 9.15 0 1 0 21.2 14.4 7.55 7.55 0 0 1 15.05 2.85Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.35" fill="currentColor" />
      <path
        d="M12 2.45v2.15M12 19.4v2.15M2.45 12h2.15M19.4 12h2.15M5.2 5.2l1.52 1.52M17.28 17.28l1.52 1.52M18.8 5.2l-1.52 1.52M6.72 17.28 5.2 18.8"
        stroke="currentColor"
        strokeWidth="2.05"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.9 8.85h3.05L11.7 4.7c.55-.5 1.4-.12 1.4.62v13.36c0 .74-.85 1.12-1.4.62l-4.75-4.15H3.9A1.4 1.4 0 0 1 2.5 14V9.95c0-.6.5-1.1 1.4-1.1Z"
        fill="currentColor"
      />
      <path
        d="M16.05 9.05a3.55 3.55 0 0 1 0 5.9"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M18.7 6.45a6.55 6.55 0 0 1 0 11.1"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlashlightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M8.05 2.6h7.9c.7 0 1.2.7.95 1.35L15.7 7.2H8.3L7.1 3.95A1 1 0 0 1 8.05 2.6Zm-.4 5.9h8.7v2.15l-1.15 1.15v7.35A2.35 2.35 0 0 1 12.85 21.5h-1.7A2.35 2.35 0 0 1 8.8 19.15v-7.35L7.65 10.65V8.5Z"
      />
      <circle className="iphone-cc-flash-dot" cx="12" cy="12.2" r="1.2" />
    </svg>
  );
}

function MirrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="2.7"
        y="4.4"
        width="13.6"
        height="10.4"
        rx="2.15"
        stroke="currentColor"
        strokeWidth="1.85"
      />
      <rect x="7.7" y="9.2" width="13.6" height="10.4" rx="2.15" fill="currentColor" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        d="M9.05 4.85 10.05 3.4h3.9l1 1.45h1.55A2.85 2.85 0 0 1 19.35 7.7v8.55a2.85 2.85 0 0 1-2.85 2.85H7.5A2.85 2.85 0 0 1 4.65 16.25V7.7A2.85 2.85 0 0 1 7.5 4.85h1.55ZM12 16.35a3.55 3.55 0 1 0 0-7.1 3.55 3.55 0 0 0 0 7.1Zm0-1.85a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.05 10.45V7.95a3.95 3.95 0 0 1 7.75-.55"
        stroke="currentColor"
        strokeWidth="1.95"
        strokeLinecap="round"
      />
      <rect x="5.35" y="10.15" width="13.3" height="9.55" rx="2.4" fill="currentColor" />
    </svg>
  );
}

function LockClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.05 10.45V7.95a3.95 3.95 0 1 1 7.9 0v2.5"
        stroke="currentColor"
        strokeWidth="1.95"
        strokeLinecap="round"
      />
      <rect x="5.35" y="10.15" width="13.3" height="9.55" rx="2.4" fill="currentColor" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="9" height="13" viewBox="0 0 9 13" fill="none" aria-hidden>
      <path d="M5.4 0 0 7.2h3.4L2.8 13 9 5.2H5.5L5.4 0Z" fill="currentColor" />
    </svg>
  );
}

function VerticalSlider({
  label,
  min,
  max,
  value,
  onChange,
  onPointerDownSlider,
  icon,
  iconClass,
  tone,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  onPointerDownSlider?: (e: ReactPointerEvent) => void;
  icon: ReactNode;
  iconClass: string;
  tone?: "volume";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const span = max - min;
  const pct = span <= 0 ? 0 : ((value - min) / span) * 100;
  const dim = pct < 48;

  const apply = useCallback(
    (clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const t = 1 - (clientY - rect.top) / Math.max(1, rect.height);
      onChange(clamp(min + t * span, min, max));
    },
    [min, max, span, onChange],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    halt(e);
    onPointerDownSlider?.(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(e.clientY);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    apply(e.clientY);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = span * 0.06;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(clamp(value + step, min, max));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(clamp(value - step, min, max));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      ref={ref}
      className={`iphone-cc-slider${tone === "volume" ? " iphone-cc-slider--volume" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={Math.round(min * 100)}
      aria-valuemax={Math.round(max * 100)}
      aria-valuenow={Math.round(value * 100)}
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
    >
      <span className="iphone-cc-slider-fill" style={{ height: `${pct}%` }} />
      <span className={`iphone-cc-slider-icon ${iconClass}${dim ? " is-dim" : ""}`}>{icon}</span>
    </div>
  );
}

function IphoneControlCenter({
  open,
  progress,
  reducedMotion = false,
  dragging = false,
  time,
  batteryPercent,
  batteryCharging,
  theme,
  onToggleTheme,
  onUnlock,
  onLock,
  phoneUnlocked,
  brightness,
  onBrightness,
  volume,
  onVolume,
  flashlightOn,
  onToggleFlashlight,
  silentOn,
  onToggleSilent,
  orientationLocked,
  onToggleOrientation,
  airplaneOn,
  onToggleAirplane,
  wifiOn,
  onToggleWifi,
  cellularOn,
  onToggleCellular,
  bluetoothOn,
  onToggleBluetooth,
  focusOn,
  onToggleFocus,
  trackTitle,
  trackArtist,
  albumArt,
  playing,
  trackProgress = 0,
  onTogglePlay,
  onPrev,
  onNext,
  onPointerDownSlider,
}: IphoneControlCenterProps) {
  const p = reducedMotion ? (open ? 1 : 0) : clamp(progress, 0, 1);
  const active = open || p > 0.02;
  const hasTrack = Boolean(albumArt || trackTitle);
  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const batteryWidth = batteryPercent == null ? 0 : clamp(batteryPercent, 0, 100);

  return (
    <div
      className={`iphone-cc${reducedMotion ? " is-reduced" : ""}${dragging ? " is-dragging" : ""}`}
      role="dialog"
      aria-modal={open}
      aria-hidden={!active}
      aria-label={`Control Center, ${time}`}
      style={{
        opacity: p,
        visibility: p <= 0.001 ? "hidden" : "visible",
        pointerEvents: active ? "auto" : "none",
        transform: reducedMotion
          ? "none"
          : `translate3d(0, ${(1 - p) * -46}%, 0) scale(${0.94 + p * 0.06})`,
      }}
    >
      <div className="iphone-cc-scrim" style={{ opacity: p }} />
      <div className="iphone-cc-sheet">
        <header className="iphone-cc-header">
          <time className="iphone-cc-time" dateTime={time}>
            {time}
          </time>
          <div className="iphone-cc-meta">
            {batteryPercent != null && <span>{batteryPercent}%</span>}
            <span className="iphone-cc-battery" aria-hidden>
              <span className="iphone-cc-battery-body">
                <span
                  className="iphone-cc-battery-fill"
                  style={{
                    width: `${batteryWidth}%`,
                    background: batteryCharging || batteryWidth > 20 ? "#30d158" : "#ff453a",
                  }}
                />
              </span>
              <span className="iphone-cc-battery-nub" />
              {batteryCharging && <BoltIcon />}
            </span>
          </div>
        </header>

        <div className="iphone-cc-board">
          <div className="iphone-cc-module iphone-cc-connectivity">
            <button
              type="button"
              className={`iphone-cc-toggle${airplaneOn ? " is-on is-on--orange" : ""}`}
              aria-label="Airplane Mode"
              aria-pressed={airplaneOn}
              onPointerDown={halt}
              onClick={onToggleAirplane}
            >
              <AirplaneIcon />
            </button>
            <button
              type="button"
              className={`iphone-cc-toggle${cellularOn ? " is-on is-on--green" : ""}`}
              aria-label="Cellular"
              aria-pressed={cellularOn}
              onPointerDown={halt}
              onClick={onToggleCellular}
            >
              <CellularIcon />
            </button>
            <button
              type="button"
              className={`iphone-cc-toggle${wifiOn ? " is-on is-on--blue" : ""}`}
              aria-label="Wi-Fi"
              aria-pressed={wifiOn}
              onPointerDown={halt}
              onClick={onToggleWifi}
            >
              <WifiIcon />
            </button>
            <button
              type="button"
              className={`iphone-cc-toggle${bluetoothOn ? " is-on is-on--blue" : ""}`}
              aria-label="Bluetooth"
              aria-pressed={bluetoothOn}
              onPointerDown={halt}
              onClick={onToggleBluetooth}
            >
              <BluetoothIcon />
            </button>
          </div>

          <div className="iphone-cc-module iphone-cc-music">
            <div className="iphone-cc-music-top">
              {hasTrack ? (
                <div className="iphone-cc-music-now">
                  <div className="iphone-cc-music-art">
                    {albumArt ? <img src={albumArt} alt="" draggable={false} /> : null}
                  </div>
                  <div className="iphone-cc-music-copy">
                    <p className="iphone-cc-music-title">{trackTitle || "Now Playing"}</p>
                    {trackArtist ? <p className="iphone-cc-music-artist">{trackArtist}</p> : null}
                  </div>
                </div>
              ) : (
                <p className="iphone-cc-music-idle">Not Playing</p>
              )}
              <span className="iphone-cc-airplay" aria-hidden>
                <AirPlayIcon />
              </span>
            </div>
            <div className="iphone-cc-music-controls">
              <button
                type="button"
                className="iphone-cc-transport"
                aria-label="Previous track"
                onPointerDown={halt}
                onClick={onPrev}
              >
                <SkipBackIcon />
              </button>
              <button
                type="button"
                className="iphone-cc-transport iphone-cc-transport--play"
                aria-label={playing ? "Pause" : "Play"}
                onPointerDown={halt}
                onClick={onTogglePlay}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className="iphone-cc-transport"
                aria-label="Next track"
                onPointerDown={halt}
                onClick={onNext}
              >
                <SkipForwardIcon />
              </button>
            </div>
            {hasTrack ? (
              <div className="iphone-cc-music-progress" aria-hidden>
                <span
                  className="iphone-cc-music-progress-fill"
                  style={{ width: `${clamp(trackProgress, 0, 1) * 100}%` }}
                />
              </div>
            ) : null}
          </div>

          <div className="iphone-cc-utils">
            <button
              type="button"
              className={`iphone-cc-circle${orientationLocked ? " is-on--red" : ""}`}
              aria-label="Orientation lock"
              aria-pressed={orientationLocked}
              onPointerDown={halt}
              onClick={onToggleOrientation}
            >
              <OrientationLockIcon />
            </button>
            <button
              type="button"
              className={`iphone-cc-circle${silentOn ? " is-on--orange" : ""}`}
              aria-label="Silent mode"
              aria-pressed={silentOn}
              onPointerDown={halt}
              onClick={onToggleSilent}
            >
              <SilentIcon />
            </button>
            <button
              type="button"
              className={`iphone-cc-focus${focusOn ? " is-on" : ""}`}
              aria-label="Focus"
              aria-pressed={focusOn}
              onPointerDown={halt}
              onClick={onToggleFocus}
            >
              <MoonIcon />
              <span className="iphone-cc-focus-label">Focus</span>
            </button>
          </div>

          <div className="iphone-cc-sliders">
            <VerticalSlider
              label="Brightness"
              min={0.35}
              max={1}
              value={brightness}
              onChange={onBrightness}
              onPointerDownSlider={onPointerDownSlider}
              icon={<SunIcon />}
              iconClass="is-sun"
            />
            <VerticalSlider
              label="Volume"
              min={0}
              max={1}
              value={volume}
              onChange={onVolume}
              onPointerDownSlider={onPointerDownSlider}
              icon={<SpeakerIcon />}
              iconClass="is-volume"
              tone="volume"
            />
          </div>

          <div className="iphone-cc-dock">
            <button
              type="button"
              className={`iphone-cc-circle iphone-cc-dock-btn${flashlightOn ? " is-on--white" : ""}`}
              aria-label="Flashlight"
              aria-pressed={flashlightOn}
              onPointerDown={halt}
              onClick={onToggleFlashlight}
            >
              <FlashlightIcon />
            </button>
            <button
              type="button"
              className="iphone-cc-circle iphone-cc-dock-btn"
              aria-label="Screen Mirroring"
              onPointerDown={halt}
            >
              <MirrorIcon />
            </button>
            <button
              type="button"
              className="iphone-cc-circle iphone-cc-dock-btn"
              aria-label="Camera"
              onPointerDown={halt}
            >
              <CameraIcon />
            </button>
            <button
              type="button"
              className="iphone-cc-circle iphone-cc-dock-btn"
              aria-label={themeLabel}
              onPointerDown={halt}
              onClick={onToggleTheme}
            >
              {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            <button
              type="button"
              className="iphone-cc-circle iphone-cc-dock-btn"
              aria-label={phoneUnlocked ? "Lock iPhone" : "Unlock iPhone"}
              onPointerDown={halt}
              onClick={phoneUnlocked ? onLock : onUnlock}
            >
              {phoneUnlocked ? <LockClosedIcon /> : <UnlockIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { IphoneControlCenter };
export default IphoneControlCenter;
