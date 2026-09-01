import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { MAALI_HOME_PORTRAIT } from "../lib/maali-wallpapers";
import "./IphoneHomeQuiz.css";

function halt(e: ReactPointerEvent) {
  e.stopPropagation();
}

function BrandIcon({ src, size = 40 }: { src: string; size?: number }) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      draggable={false}
      decoding="async"
      style={{ width: size, height: size }}
    />
  );
}

function SpotifyMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect width="24" height="24" rx="7" fill="#1DB954" />
      <path
        fill="#fff"
        d="M16.95 16.08c-.22.36-.68.48-1.04.26-2.84-1.74-6.42-2.13-10.64-1.17-.4.1-.8-.16-.9-.56-.1-.4.16-.8.56-.9 4.6-1.05 8.55-.6 11.72 1.34.36.22.48.68.3 1.03Zm1.38-3.07c-.27.44-.85.58-1.28.31-3.25-2-8.2-2.58-12.04-1.41-.5.15-1.02-.13-1.17-.62-.15-.5.13-1.02.62-1.17 4.4-1.34 9.86-.69 13.6 1.62.44.27.58.84.27 1.27Zm.12-3.2C14.5 7.7 8.2 7.5 4.78 8.54c-.6.18-1.22-.16-1.4-.75-.18-.6.16-1.22.75-1.4 3.95-1.2 10.95-.97 15.28 1.6.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.56.4Z"
      />
    </svg>
  );
}

function WhatsAppMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect width="24" height="24" rx="7" fill="#25D366" />
      <path
        fill="#fff"
        d="M12.04 4.72a7.28 7.28 0 0 0-6.3 10.92l-.7 3.84 3.94-.73a7.28 7.28 0 1 0 3.06-14.03Zm4.22 10.34c-.18.5-1.04.96-1.46 1.02-.38.06-.86.1-1.4-.08a12.4 12.4 0 0 1-1.28-.48c-2.24-.97-3.7-3.24-3.8-3.4-.12-.16-.9-1.2-.9-2.3 0-1.08.56-1.6.76-1.82.18-.2.42-.26.56-.26h.4c.12 0 .3-.02.46.36.18.4.6 1.46.64 1.56.06.1.1.24.02.38-.08.16-.12.26-.24.4l-.36.42c-.1.14-.22.3-.08.5.14.2.66 1.1 1.42 1.78.96.86 1.78 1.12 2.04 1.24.26.12.4.1.56-.06.14-.16.62-.72.78-.96.16-.24.32-.2.54-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.58-.14 1.08Z"
      />
    </svg>
  );
}

function PhoneMark({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect width="24" height="24" rx="7" fill="#30D158" />
      <path
        fill="#fff"
        d="M16.86 14.72c-.32-.16-1.86-.92-2.14-1.02-.28-.1-.48-.16-.68.16-.2.32-.78 1.02-.96 1.22-.18.2-.36.22-.68.06-.32-.16-1.34-.5-2.56-1.58-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.5.14-.66.14-.14.32-.36.48-.54.16-.18.2-.32.32-.54.1-.22.06-.4-.02-.56-.08-.16-.68-1.64-.94-2.24-.24-.58-.5-.5-.68-.5h-.58c-.2 0-.54.08-.82.4-.28.32-1.08 1.06-1.08 2.58s1.1 3 1.26 3.2c.16.22 2.16 3.3 5.24 4.62.74.32 1.3.5 1.76.64.74.24 1.4.2 1.94.12.58-.1 1.86-.76 2.12-1.5.26-.74.26-1.38.18-1.5-.08-.14-.28-.22-.6-.38Z"
      />
    </svg>
  );
}

const APPS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: <BrandIcon src="/assets/app-icons/linkedin.png" /> },
  { label: "Facebook", href: "https://www.facebook.com/", icon: <BrandIcon src="/assets/app-icons/facebook.png" /> },
  { label: "Instagram", href: "https://www.instagram.com/", icon: <BrandIcon src="/assets/app-icons/instagram.png" /> },
  { label: "Spotify", href: "https://open.spotify.com/", icon: <SpotifyMark /> },
  { label: "Upwork", href: "https://www.upwork.com/", icon: <BrandIcon src="/assets/app-icons/upwork.png" /> },
  { label: "WhatsApp", href: "https://wa.me/", icon: <WhatsAppMark /> },
  { label: "Mail", href: "mailto:hello@autoany.io", icon: <BrandIcon src="/assets/app-icons/gmail.png" /> },
];

const DOCK: { label: string; href: string; icon: ReactNode }[] = [
  { label: "Upwork", href: "https://www.upwork.com/", icon: <BrandIcon src="/assets/app-icons/upwork.png" size={52} /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: <BrandIcon src="/assets/app-icons/linkedin.png" size={52} /> },
  { label: "WhatsApp", href: "https://wa.me/", icon: <WhatsAppMark size={52} /> },
  { label: "Contact", href: "mailto:hello@autoany.io", icon: <PhoneMark size={52} /> },
];

export default function IphoneHomeQuiz({
  revealed,
  reducedMotion,
  onLock,
}: {
  revealed: boolean;
  reducedMotion: boolean;
  onLock: () => void;
}) {
  const fade = (delay: string) =>
    reducedMotion ? undefined : ({ animationDelay: delay } as const);

  return (
    <div className={`iphone-home${revealed ? " is-in" : ""}`} aria-hidden={!revealed}>
      <div className="iphone-home-wash" />
      <div className="iphone-home-body">
        <div className="iphone-home-person quiz-fade-up" style={fade("0.08s")}>
          <img
            className="iphone-home-avatar"
            src={MAALI_HOME_PORTRAIT}
            alt="Maali Wassan"
            draggable={false}
            decoding="async"
          />
          <div className="iphone-home-id">
            <p className="iphone-home-name">Maali Wassan</p>
            <p className="iphone-home-age">Age 24</p>
            <p className="iphone-home-meta">Automation specialist · n8n · GHL · Voice</p>
          </div>
        </div>

        <div className="iphone-home-apps">
          {APPS.map((app, i) => (
            <a
              key={app.label}
              className="iphone-app quiz-fade-up"
              href={app.href}
              target={app.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={app.href.startsWith("mailto:") ? undefined : "noreferrer"}
              style={fade(`${0.18 + i * 0.05}s`)}
              onPointerDown={halt}
            >
              <span className="iphone-app-tile">
                <span className="iphone-app-logo">{app.icon}</span>
              </span>
              <span className="iphone-app-label">{app.label}</span>
            </a>
          ))}
          <button
            type="button"
            className="iphone-app quiz-fade-up"
            style={fade("0.53s")}
            onPointerDown={halt}
            onClick={onLock}
          >
            <span className="iphone-app-tile iphone-app-tile--bare">
              <span className="iphone-app-logo">
                <BrandIcon src="/assets/app-icons/lock.png" size={62} />
              </span>
            </span>
            <span className="iphone-app-label">Lock</span>
          </button>
        </div>

        <nav className="iphone-home-dock quiz-fade-up" style={fade("0.48s")} aria-label="Quick contacts">
          {DOCK.map((app) => (
            <a
              key={app.label}
              className="iphone-dock-app"
              href={app.href}
              target={app.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={app.href.startsWith("mailto:") ? undefined : "noreferrer"}
              aria-label={app.label}
              onPointerDown={halt}
            >
              {app.icon}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
