import { useLayoutEffect, useRef } from "react";
import {
  CheckCircle,
  Crosshair,
  Layers,
  Pencil,
  Search,
} from "lucide-react";
import { bindLiveSection } from "../lib/live-section";
import SectionHeader from "./SectionHeader";
import {
  HoverExpand,
  type HoverExpandItem,
} from "./unlumen-ui/hover-expand";

const HUD = {
  expandedFit: "contain" as const,
  hideExpandedChrome: true,
  expandedHeight: 560,
};

const ITEMS: HoverExpandItem[] = [
  {
    label: "Ai content engine studio",
    sublabel: "Studio",
    description: "Research to draft. Tracked. Stored.",
    image: "/assets/systems/01-ai-content-engine.png",
    imageAlt: "Content Workflow Architecture: Brief Intake, Research Agent, Content Draft, Google Drive Assets, Publish Ready",
    objectPosition: "50% 50%",
    href: "/systems/studio",
    ...HUD,
  },
  {
    label: "AI Sales Follow Up Sequence Engine",
    sublabel: "Sales",
    description: "Schedule, write, send, log, alert.",
    image: "/assets/systems/02-sales-follow-up.png",
    imageAlt: "AI Sales Follow Up: Schedule Trigger, AI Email Writer, Gmail Send, Airtable Update, Slack Alert",
    objectPosition: "50% 50%",
    href: "/systems/sales",
    ...HUD,
  },
  {
    label: "Automated Client Onboarding Intake System",
    sublabel: "Intake",
    description: "Email in. Folder ready. Workspace live.",
    image: "/assets/systems/03-client-onboarding.png",
    imageAlt: "Client Onboarding Architecture: seven steps from Gmail client email to Ready Workspace",
    objectPosition: "50% 50%",
    href: "/systems/intake",
    ...HUD,
  },
  {
    label: "Lead Gen AI Agent Pipeline",
    sublabel: "Leads",
    description: "Capture. Enrich. Qualify. Store. Outreach.",
    image: "/assets/systems/04-lead-outreach.png",
    imageAlt: "Lead to Outreach Architecture: Lead Form, Enrich Data, AI Qualify, Google Sheets CRM, Outreach Ready",
    objectPosition: "50% 50%",
    href: "/systems/leads",
    ...HUD,
  },
  {
    label: "LinkedIn Carousel Content Studio",
    sublabel: "LinkedIn",
    description: "Brief. Write. Image. File. Publish.",
    image: "/assets/systems/05-linkedin-carousel.png",
    imageAlt: "LinkedIn Carousel Content Studio: Content Brief through Carousel Package, with Refine & Iterate and Publish & Share loops",
    objectPosition: "50% 50%",
    href: "/systems/linkedin",
    ...HUD,
  },
  {
    label: "Monthly Client Data Intake Desk",
    sublabel: "Data",
    description: "Repeat. Scale. Stay organized.",
    image: "/assets/systems/06-monthly-intake.png",
    imageAlt: "Automated Client Intake & Reporting Workflow: Form Intake through Monthly Report Ready",
    objectPosition: "50% 50%",
    href: "/systems/data",
    ...HUD,
  },
  {
    label: "Multi Agent Customer Support System",
    sublabel: "Support",
    description: "Intake. Route. Score. Resolve or escalate.",
    image: "/assets/systems/07-multi-agent-support.png",
    imageAlt: "Multi-agent customer support: Webhook Intake, Classify Intent, Specialist Agents stack, Quality Score, Escalate via Slack or Gmail",
    objectPosition: "50% 50%",
    href: "/systems/support",
    ...HUD,
  },
  {
    label: "Smart Gmail Triage Automation",
    sublabel: "Gmail",
    description: "Classify. Route. Draft. Review & send.",
    image: "/assets/systems/09-gmail-triage.png",
    imageAlt: "Gmail triage: Gmail Trigger, AI Classify, Label Route with Calendar and Tasks branch, Draft Reply with review loop",
    objectPosition: "50% 50%",
    href: "/systems/gmail",
    ...HUD,
  },
  {
    label: "Smart Job Application Intake Pipeline",
    sublabel: "Jobs",
    description: "Inbox. Score. Reply by tier.",
    image: "/assets/systems/10-job-intake.png",
    imageAlt:
      "Smart Job Application Intake Pipeline: Gmail Inbox through Tier Router, then Hot, Warm, and Cold reply paths",
    objectPosition: "50% 50%",
    href: "/systems/jobs",
    ...HUD,
  },
  {
    label: "Voice Agent Calendar Booking System",
    sublabel: "Booking",
    description: "Call. Check. Book. Confirm.",
    image: "/assets/systems/11-voice-booking.png",
    imageAlt:
      "Voice Agent Calendar: Voice Call, Retell Agent, Check Availability, Google Calendar Book, Confirm Booking, dashed loop back to Retell",
    objectPosition: "50% 50%",
    href: "/systems/booking",
    ...HUD,
  },
];

const VALUE_PROPS = [
  {
    icon: Crosshair,
    title: "Focused input",
    copy: "Clear briefs drive better outcomes.",
  },
  {
    icon: Search,
    title: "Smart research",
    copy: "Accurate insights from trusted sources.",
  },
  {
    icon: Pencil,
    title: "AI-powered creation",
    copy: "Structured, relevant and on-brand content.",
  },
  {
    icon: Layers,
    title: "Centralized assets",
    copy: "Reuse, manage and stay brand consistent.",
  },
  {
    icon: CheckCircle,
    title: "Publish confidently",
    copy: "High-quality content, ready to go live.",
  },
];

export default function Journal() {
  const valRef = useRef<HTMLUListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    return bindLiveSection(section);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journal"
      className="section-veil surface-dark relative z-10 mt-0 bg-black py-16 md:py-28"
    >
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          motion={false}
          eyebrow="Systems"
          heading={
            <>
              AutoAny <span className="font-display italic">systems</span>
            </>
          }
          subtext="Voice, CRM, and ops workflows we wire so operators can run without the bottleneck."
          cta={{ label: "View all", href: "#work" }}
        />

        <div data-chapter-body>
          <HoverExpand items={ITEMS} className="text-text-primary" />
        </div>

        <div className="mt-8 border-t border-dashed border-stroke pt-8">
          <ul
            ref={valRef}
            className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5"
          >
            {VALUE_PROPS.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="min-w-0">
                <Icon
                  className="mb-3 size-4 text-accent"
                  strokeWidth={1.4}
                  aria-hidden
                />
                <p className="text-[13px] font-medium tracking-tight text-text-primary">
                  {title}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {copy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
