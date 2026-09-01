import { useCallback, useEffect, useRef, useState } from "react";

export type SpotifyTrack = {
  src: string;
  title: string;
  artist: string;
  art: string;
};

export const SPOTIFY_QUEUE: SpotifyTrack[] = [
  {
    src: "/assets/audio/lock-1.mp3",
    title: "STATS",
    artist: "Baby Keem - DIE FOR MY BITCH",
    art: "https://i.scdn.co/image/ab67616d0000b273683757f1fd40a7f7ef64bec1",
  },
  {
    src: "/assets/audio/lock-2.mp3",
    title: "ORANGE SODA",
    artist: "Baby Keem - DIE FOR MY BITCH",
    art: "https://i.scdn.co/image/ab67616d0000b273683757f1fd40a7f7ef64bec1",
  },
  {
    src: "/assets/audio/lock-3.mp3",
    title: "HONEST",
    artist: "Baby Keem - DIE FOR MY BITCH",
    art: "https://i.scdn.co/image/ab67616d0000b273683757f1fd40a7f7ef64bec1",
  },
];

function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useSpotifyEmbed(volume = 0.72) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const onTime = () => setPosition(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      const next = (indexRef.current + 1) % SPOTIFY_QUEUE.length;
      indexRef.current = next;
      setIndex(next);
      audio.src = SPOTIFY_QUEUE[next].src;
      audio.play().catch(() => setPlaying(false));
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  const load = useCallback((nextIndex: number, autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    const i = (nextIndex + SPOTIFY_QUEUE.length) % SPOTIFY_QUEUE.length;
    indexRef.current = i;
    setIndex(i);
    setPosition(0);
    audio.src = SPOTIFY_QUEUE[i].src;
    audio.load();
    if (autoplay) {
      audio.play().catch(() => setPlaying(false));
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src) audio.src = SPOTIFY_QUEUE[indexRef.current].src;
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false));
      return;
    }
    audio.pause();
  }, []);

  const next = useCallback(() => {
    load(indexRef.current + 1, true);
  }, [load]);

  const prev = useCallback(() => {
    load(indexRef.current - 1, true);
  }, [load]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const track = SPOTIFY_QUEUE[index];
  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  return {
    track,
    playing,
    progress,
    durationLabel: formatClock(duration),
    togglePlay,
    next,
    prev,
    pause,
  };
}
