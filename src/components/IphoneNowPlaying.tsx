import type { PointerEvent as ReactPointerEvent } from "react";
import "./IphoneControlCenter.css";

export type IphoneNowPlayingProps = {
  title: string;
  artist: string;
  albumArt: string;
  playing: boolean;
  progress: number;
  durationLabel: string;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPointerDown?: (e: ReactPointerEvent) => void;
  expanded?: boolean;
};

function halt(e: ReactPointerEvent) {
  e.stopPropagation();
}

function SkipBackIcon({ large = false }: { large?: boolean }) {
  const w = large ? 22 : 16;
  const h = large ? 18 : 14;
  return (
    <svg width={w} height={h} viewBox="0 0 18 16" fill="none" aria-hidden>
      <path d="M10.8 2.1 4.2 8l6.6 5.9V2.1Z" fill="currentColor" />
      <path d="M3.2 2.2h1.7v11.6H3.2V2.2Z" fill="currentColor" />
    </svg>
  );
}

function SkipForwardIcon({ large = false }: { large?: boolean }) {
  const w = large ? 22 : 16;
  const h = large ? 18 : 14;
  return (
    <svg width={w} height={h} viewBox="0 0 18 16" fill="none" aria-hidden>
      <path d="M7.2 2.1 13.8 8l-6.6 5.9V2.1Z" fill="currentColor" />
      <path d="M13.1 2.2h1.7v11.6h-1.7V2.2Z" fill="currentColor" />
    </svg>
  );
}

function PlayIcon({ large = false }: { large?: boolean }) {
  const w = large ? 18 : 14;
  const h = large ? 20 : 16;
  return (
    <svg width={w} height={h} viewBox="0 0 16 18" fill="none" aria-hidden>
      <path d="M2.2 1.4v15.2L14.4 9 2.2 1.4Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon({ large = false }: { large?: boolean }) {
  const w = large ? 16 : 13;
  const h = large ? 18 : 15;
  return (
    <svg width={w} height={h} viewBox="0 0 14 16" fill="none" aria-hidden>
      <rect x="1.2" y="1.4" width="4" height="13.2" rx="0.8" fill="currentColor" />
      <rect x="8.8" y="1.4" width="4" height="13.2" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function IphoneNowPlaying({
  title,
  artist,
  albumArt,
  playing,
  progress,
  durationLabel,
  onTogglePlay,
  onPrev,
  onNext,
  onPointerDown,
  expanded = false,
}: IphoneNowPlayingProps) {
  const pct = Math.min(100, Math.max(0, progress * 100));

  const onRootPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    halt(e);
    onPointerDown?.(e);
  };

  const controls = (
    <div className="iphone-np-controls">
      <button
        type="button"
        className="iphone-np-btn"
        aria-label="Previous track"
        onPointerDown={halt}
        onClick={onPrev}
      >
        <SkipBackIcon large={expanded} />
      </button>
      <button
        type="button"
        className="iphone-np-btn"
        aria-label={playing ? "Pause" : "Play"}
        onPointerDown={halt}
        onClick={onTogglePlay}
      >
        {playing ? <PauseIcon large={expanded} /> : <PlayIcon large={expanded} />}
      </button>
      <button
        type="button"
        className="iphone-np-btn"
        aria-label="Next track"
        onPointerDown={halt}
        onClick={onNext}
      >
        <SkipForwardIcon large={expanded} />
      </button>
    </div>
  );

  const copy = (
    <div className="iphone-np-copy">
      <p className="iphone-np-title">{title}</p>
      <p className="iphone-np-artist">{artist}</p>
    </div>
  );

  const art = albumArt ? (
    <div className="iphone-np-art">
      <img src={albumArt} alt="" draggable={false} />
    </div>
  ) : (
    <div className="iphone-np-art" aria-hidden />
  );

  const progressBar = (
    <div className="iphone-np-progress">
      <div
        className="iphone-np-track"
        role="slider"
        tabIndex={0}
        aria-label="Playback progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={durationLabel}
        aria-orientation="horizontal"
        aria-readonly="true"
        onPointerDown={halt}
      >
        <span className="iphone-np-track-fill" style={{ width: `${pct}%` }} />
        <span className="iphone-np-thumb" style={{ left: `${pct}%` }} />
      </div>
      <span className="iphone-np-time">{durationLabel}</span>
    </div>
  );

  return (
    <article
      className={`iphone-np${expanded ? " iphone-np--expanded" : ""}`}
      aria-label={`Now Playing, ${title} by ${artist}`}
      onPointerDown={onRootPointerDown}
    >
      {expanded ? (
        <>
          {art}
          {copy}
          {progressBar}
          {controls}
        </>
      ) : (
        <>
          <div className="iphone-np-row">
            {art}
            {copy}
            {controls}
          </div>
          {progressBar}
        </>
      )}
    </article>
  );
}

export { IphoneNowPlaying };
export default IphoneNowPlaying;
