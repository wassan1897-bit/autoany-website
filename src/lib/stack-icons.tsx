import type { ReactElement, SVGProps } from "react";
import type { SystemStackId } from "./systems";

type MarkProps = SVGProps<SVGSVGElement>;

function Mark({ children, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** n8n - letter-n node path, not a generic workflow glyph. */
export function N8nMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <circle cx="6.2" cy="6.4" r="2.05" />
      <circle cx="6.2" cy="17.6" r="2.05" />
      <circle cx="17.8" cy="17.6" r="2.05" />
      <path d="M6.2 8.45v7.1" />
      <path d="M6.2 15.55c.35-5.05 11.6-5.05 11.6 0" />
    </Mark>
  );
}

/** AI agents - hub with specialist satellites, not a robot head. */
export function AgentsMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <circle cx="12" cy="12" r="3.05" />
      <circle cx="12" cy="4.35" r="1.65" />
      <circle cx="18.55" cy="15.55" r="1.65" />
      <circle cx="5.45" cy="15.55" r="1.65" />
      <path d="M12 8.95V6M14.75 13.55l2.25 1.3M9.25 13.55 7 14.85" />
    </Mark>
  );
}

/** Airtable - rounded cell grid. */
export function AirtableMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="3.5" y="4" width="7.25" height="7.25" rx="1.4" />
      <rect x="13.25" y="4" width="7.25" height="7.25" rx="1.4" />
      <rect x="3.5" y="12.75" width="7.25" height="7.25" rx="1.4" />
      <rect x="13.25" y="12.75" width="7.25" height="7.25" rx="1.4" />
      <path d="M3.5 8.25h7.25M13.25 16.4h7.25" />
    </Mark>
  );
}

/** Google Drive - three-plane triangle. */
export function DriveMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M12 3.4 20.6 18.2H3.4L12 3.4Z" />
      <path d="M7.15 18.2 12 9.7l4.85 8.5" />
      <path d="M4.85 15.4h14.3" />
    </Mark>
  );
}

/** HTTP / enrichment - request in, payload, response out. */
export function HttpMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M3.4 12h4.4" />
      <path d="M5.6 9.7 3.4 12l2.2 2.3" />
      <rect x="8.1" y="6.6" width="7.8" height="10.8" rx="1.5" />
      <path d="M10 10.2h4M10 13.8h2.6" />
      <path d="M16.2 12h4.4" />
      <path d="M18.4 9.7 20.6 12l-2.2 2.3" />
    </Mark>
  );
}

/** Gmail - envelope with the M fold. */
export function GmailMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="3.4" y="5.75" width="17.2" height="12.5" rx="1.6" />
      <path d="M3.4 8.1 12 14.1 20.6 8.1" />
      <path d="M8.2 12.4 3.4 16.4" />
      <path d="M15.8 12.4 20.6 16.4" />
    </Mark>
  );
}

/** Slack - four-lozenge hash. */
export function SlackMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="14.15" y="3.4" width="3.15" height="8.1" rx="1.55" />
      <rect x="12.75" y="14.15" width="8.1" height="3.15" rx="1.55" />
      <rect x="6.7" y="12.5" width="3.15" height="8.1" rx="1.55" />
      <rect x="3.15" y="6.7" width="8.1" height="3.15" rx="1.55" />
    </Mark>
  );
}

/** Google Sheets - ruled grid with header. */
export function SheetsMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="4.2" y="3.6" width="15.6" height="16.8" rx="1.6" />
      <path d="M4.2 8.1h15.6" />
      <path d="M4.2 12h15.6" />
      <path d="M4.2 15.9h15.6" />
      <path d="M9.4 8.1v12.3" />
      <path d="M14.6 8.1v12.3" />
    </Mark>
  );
}

/** Google Calendar - month grid. */
export function CalendarMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="3.6" y="5.2" width="16.8" height="15.2" rx="1.6" />
      <path d="M3.6 9.4h16.8" />
      <path d="M8.1 3.6v3.2M15.9 3.6v3.2" />
      <path d="M8 13.1h.01M12 13.1h.01M16 13.1h.01M8 16.6h.01M12 16.6h.01" />
    </Mark>
  );
}

/** Retell / voice agent - capsule mic plus waveform. */
export function VoiceMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="6.4" y="3.6" width="6.4" height="10.2" rx="3.2" />
      <path d="M5.2 11.2a4.6 4.6 0 0 0 9.2 0" />
      <path d="M9.6 15.8v4.2" />
      <path d="M16.4 8.2v6.4M18.6 9.6v3.6M20.7 10.7v1.4" />
    </Mark>
  );
}

/** Supabase - lightning bolt mark. */
export function SupabaseMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M13.6 2.8 5.4 13.4h6.3L9.2 21.2l9.4-11.4h-6.2L13.6 2.8Z" />
    </Mark>
  );
}

/** OpenAI - six-petal blossom as line art. */
export function OpenAIMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M12 3.6c1.05 2.15 1.05 4.2 0 5.9-1.7-1.35-3.85-1.85-5.7-1.25C7.7 6.2 9.6 4.55 12 3.6Z" />
      <path d="M19.2 7.75c-.85 2.2-2.25 3.7-3.95 4.25.85-2.05.2-4.2-1.45-5.7 2.05-.2 4.1.15 5.4 1.45Z" />
      <path d="M17.55 16.7c-2.1 1.15-4.2 1.15-5.9 0 1.35-1.7 1.85-3.85 1.25-5.7 2.05 1.4 3.7 3.3 4.65 5.7Z" />
      <path d="M12 20.4c-1.05-2.15-1.05-4.2 0-5.9 1.7 1.35 3.85 1.85 5.7 1.25C16.3 17.8 14.4 19.45 12 20.4Z" />
      <path d="M4.8 16.25c.85-2.2 2.25-3.7 3.95-4.25-.85 2.05-.2 4.2 1.45 5.7-2.05.2-4.1-.15-5.4-1.45Z" />
      <path d="M6.45 7.3c2.1-1.15 4.2-1.15 5.9 0-1.35 1.7-1.85 3.85-1.25 5.7C9.05 11.6 7.4 9.7 6.45 7.3Z" />
    </Mark>
  );
}

export type StackIcon = (props: MarkProps) => ReactElement;

export type MarqueeToolId = SystemStackId | "openai";

export const TOOL_MARKS: Record<
  MarqueeToolId,
  { label: string; Icon: StackIcon }
> = {
  n8n: { label: "n8n Cloud", Icon: N8nMark },
  agents: { label: "AI agents", Icon: AgentsMark },
  airtable: { label: "Airtable", Icon: AirtableMark },
  drive: { label: "Google Drive", Icon: DriveMark },
  http: { label: "HTTP enrichment", Icon: HttpMark },
  gmail: { label: "Gmail", Icon: GmailMark },
  sheets: { label: "Google Sheets", Icon: SheetsMark },
  slack: { label: "Slack", Icon: SlackMark },
  calendar: { label: "Google Calendar", Icon: CalendarMark },
  voice: { label: "Retell voice", Icon: VoiceMark },
  supabase: { label: "Supabase", Icon: SupabaseMark },
  openai: { label: "OpenAI", Icon: OpenAIMark },
};

/** Top row travels left. Bottom row travels right. */
export const HOMEPAGE_MARQUEE = {
  top: ["n8n", "gmail", "airtable", "slack", "drive", "openai"] as const,
  bottom: ["agents", "sheets", "calendar", "voice", "http", "supabase"] as const,
};
