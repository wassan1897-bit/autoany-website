export type SystemStep = {
  n: string;
  title: string;
  body: string;
  foot: string;
};

export type SystemPlatform = {
  name: string;
  role: string;
};

export type SystemStackId =
  | "n8n"
  | "agents"
  | "airtable"
  | "drive"
  | "http"
  | "gmail"
  | "sheets"
  | "slack"
  | "calendar"
  | "voice"
  | "supabase";

export type SystemRecord = {
  slug: string;
  index: string;
  label: string;
  sublabel: string;
  description: string;
  lede: string;
  image: string;
  imageAlt: string;
  /** hud = infographic shown in full. photo = cinematic crop. */
  poster?: "hud" | "photo";
  accent: string;
  metric: string;
  metricCaption: string;
  platforms: SystemPlatform[];
  stack: SystemStackId[];
  delivers: string[];
  steps: SystemStep[];
};

export const SYSTEMS: SystemRecord[] = [
  {
    slug: "studio",
    index: "01",
    label: "Ai content engine studio",
    sublabel: "Studio",
    description: "Brief. Research. Draft. Assets. Publish.",
    lede: "Content Workflow Architecture - an AI-powered creation pipeline. Brief intake feeds a research agent, a structured draft, Google Drive assets, and a publish-ready check, with a dashed loop back to intake.",
    image: "/assets/systems/01-ai-content-engine.png",
    imageAlt:
      "Content Workflow Architecture: Brief Intake, Research Agent, Content Draft, Google Drive Assets, Publish Ready",
    poster: "hud",
    accent: "#c41e3a",
    metric: "5",
    metricCaption: "Five-stage pipeline",
    delivers: [
      "Focused input - clear briefs drive better outcomes",
      "Smart research - insights, stats, quotes, and source links",
      "AI-powered creation - headings, copy, and SEO in one draft",
      "Centralized Drive assets - brand files stay with the run",
      "Publish confidently after final review and quality check",
    ],
    platforms: [
      { name: "n8n Cloud", role: "Pipeline orchestration" },
      { name: "Research agent", role: "Validate and compile sources" },
      { name: "Draft agent", role: "Structured copy and SEO" },
      { name: "Google Drive", role: "Brand assets, images, docs" },
      { name: "Publish check", role: "Review, format, quality" },
    ],
    stack: ["n8n", "agents", "drive", "http"],
    steps: [
      {
        n: "01",
        title: "BRIEF INTAKE",
        body: "Capture goals, audience, key messages, tone, references, and publish objectives.",
        foot: "Focused input.",
      },
      {
        n: "02",
        title: "RESEARCH AGENT",
        body: "Researches, validates, and compiles insights, stats, quotes, and source links.",
        foot: "Smart research.",
      },
      {
        n: "03",
        title: "CONTENT DRAFT",
        body: "Turns insights into a structured draft with headings, copy, and SEO elements.",
        foot: "AI-powered creation.",
      },
      {
        n: "04",
        title: "GOOGLE DRIVE ASSETS",
        body: "Attach brand assets, images, docs, and references from Google Drive.",
        foot: "Centralized assets.",
      },
      {
        n: "05",
        title: "PUBLISH READY",
        body: "Final review, formatting, and quality check. Dashed loop returns to intake.",
        foot: "Publish confidently.",
      },
    ],
  },
  {
    slug: "sales",
    index: "02",
    label: "AI Sales Follow Up Sequence Engine",
    sublabel: "Sales",
    description: "Schedule, write, send, log, alert.",
    lede: "AI Sales Follow Up - five boxes on one run: schedule trigger, AI email writer, Gmail send, Airtable update, Slack alert.",
    image: "/assets/systems/02-sales-follow-up.png",
    imageAlt:
      "AI Sales Follow Up: Schedule Trigger, AI Email Writer, Gmail Send, Airtable Update, Slack Alert",
    poster: "hud",
    accent: "#d4a574",
    metric: "5",
    metricCaption: "Five-stage pipeline",
    delivers: [
      "Schedule trigger fires the follow-up without relying on memory",
      "AI email writer drafts from deal context",
      "Gmail sends from the working inbox",
      "Airtable logs the run; Slack alerts the floor",
    ],
    platforms: [
      { name: "Schedule trigger", role: "Calendar + clock" },
      { name: "AI email writer", role: "Circuit-brain draft" },
      { name: "Gmail", role: "Send the follow-up" },
      { name: "Airtable", role: "Update the record" },
      { name: "Slack", role: "Alert the floor" },
    ],
    stack: ["n8n", "calendar", "agents", "gmail", "airtable", "slack"],
    steps: [
      {
        n: "01",
        title: "SCHEDULE TRIGGER",
        body: "Calendar + clock. Time or event starts the follow-up sequence.",
        foot: "Trigger.",
      },
      {
        n: "02",
        title: "AI EMAIL WRITER",
        body: "Circuit-brain writer drafts the next note from deal context.",
        foot: "Write.",
      },
      {
        n: "03",
        title: "GMAIL SEND",
        body: "Send from Gmail so the thread stays in the working inbox.",
        foot: "Send.",
      },
      {
        n: "04",
        title: "AIRTABLE UPDATE",
        body: "Log status, timestamp, and next action on the Airtable record.",
        foot: "Update.",
      },
      {
        n: "05",
        title: "SLACK ALERT",
        body: "Hash-channel ping when a human needs to see the run.",
        foot: "Alert.",
      },
    ],
  },
  {
    slug: "intake",
    index: "03",
    label: "Automated Client Onboarding Intake System",
    sublabel: "Intake",
    description: "Email in. Folder ready. Workspace live.",
    lede: "Client Onboarding Architecture - seven steps from a Gmail client email through Claude extraction, a duplicate check, Drive folder, attachments, generated docs, and a ready workspace.",
    image: "/assets/systems/03-client-onboarding.png",
    imageAlt:
      "Client Onboarding Architecture: seven steps from Gmail client email to Ready Workspace",
    poster: "hud",
    accent: "#7eb8b2",
    metric: "7",
    metricCaption: "Seven-step onboarding",
    delivers: [
      "Gmail client email starts intake on arrival",
      "Claude AI extracts client info before a folder is created",
      "Duplicate check blocks a second record",
      "Drive leads folder, attachments, and generated docs land together",
      "Ready workspace with client.md, Clarity Call Guide, Thesis Readiness Diagnostic",
    ],
    platforms: [
      { name: "Gmail", role: "Client email in" },
      { name: "Claude AI", role: "Extract client info" },
      { name: "Duplicate check", role: "One client record" },
      { name: "Google Drive", role: "Leads folder + attachments" },
      { name: "Generated docs", role: "client.md and call guides" },
    ],
    stack: ["n8n", "gmail", "agents", "drive"],
    steps: [
      {
        n: "01",
        title: "GMAIL CLIENT EMAIL",
        body: "Client email lands in Gmail and starts onboarding. Red-border Gmail node.",
        foot: "Email in.",
      },
      {
        n: "02",
        title: "EXTRACT CLIENT INFO WITH CLAUDE AI",
        body: "Claude reads the thread and pulls structured client facts from the message.",
        foot: "Extract.",
      },
      {
        n: "03",
        title: "DUPLICATE CHECK",
        body: "Magnifying-glass / person match against existing clients before a second folder.",
        foot: "One record.",
      },
      {
        n: "04",
        title: "GOOGLE DRIVE LEADS FOLDER CREATE CLIENT FOLDER",
        body: "Create the client folder inside the Google Drive leads directory.",
        foot: "Folder.",
      },
      {
        n: "05",
        title: "SAVE ATTACHMENTS",
        body: "Save inbound files into the new client folder.",
        foot: "Files.",
      },
      {
        n: "06",
        title: "GENERATE DOCUMENTS",
        body: "Write client.md, Clarity Call Guide, and Thesis Readiness Diagnostic.",
        foot: "Docs.",
      },
      {
        n: "07",
        title: "READY WORKSPACE",
        body: "Green-check handoff. Named folder, files, and docs are ready for the call.",
        foot: "Ready.",
      },
    ],
  },
  {
    slug: "leads",
    index: "04",
    label: "Lead Gen AI Agent Pipeline",
    sublabel: "Leads",
    description: "Capture. Enrich. Qualify. Store. Outreach.",
    lede: "Lead to Outreach Architecture - capture, enrich, qualify, store, outreach. Connected and automated through Forms & Web, enrichment providers, an AI model, Google Sheets API, and outreach tools.",
    image: "/assets/systems/04-lead-outreach.png",
    imageAlt:
      "Lead to Outreach Architecture: Lead Form, Enrich Data, AI Qualify, Google Sheets CRM, Outreach Ready",
    poster: "hud",
    accent: "#3b82f6",
    metric: "5",
    metricCaption: "Five-stage pipeline",
    delivers: [
      "Lead form capture from web, landing pages, and campaigns",
      "Enrichment providers add firmographics, contact data, and intent",
      "AI qualify against ICP, intent, and engagement",
      "Google Sheets CRM via Sheets API",
      "Outreach ready - Secure. Compliant. Scalable.",
    ],
    platforms: [
      { name: "Forms & Web", role: "Lead form capture" },
      { name: "Enrichment providers", role: "Firmographics and intent" },
      { name: "AI model", role: "Qualify against ICP" },
      { name: "Google Sheets API", role: "Sheets CRM" },
      { name: "Outreach tools", role: "Email and sequences" },
    ],
    stack: ["n8n", "http", "agents", "sheets"],
    steps: [
      {
        n: "01",
        title: "LEAD FORM",
        body: "Capture leads from web forms, landing pages, and campaigns.",
        foot: "Forms & web.",
      },
      {
        n: "02",
        title: "ENRICH DATA",
        body: "Enrich with firmographics, contact data, intent signals, and more.",
        foot: "Enrichment.",
      },
      {
        n: "03",
        title: "AI QUALIFY",
        body: "AI scores and qualifies leads based on ICP fit, intent, and engagement.",
        foot: "AI model.",
      },
      {
        n: "04",
        title: "GOOGLE SHEETS CRM",
        body: "Store and manage qualified leads in Google Sheets as your CRM.",
        foot: "Sheets API.",
      },
      {
        n: "05",
        title: "OUTREACH READY",
        body: "Push qualified leads to outreach workflows and start conversations.",
        foot: "Sequences.",
      },
    ],
  },
  {
    slug: "linkedin",
    index: "05",
    label: "LinkedIn Carousel Content Studio",
    sublabel: "LinkedIn",
    description: "Brief. Write. Image. File. Publish.",
    lede: "LinkedIn Carousel Content Studio - brief, AI slide writer, image generate, Google Drive folder, carousel package. Top loop Refine & Iterate. Bottom loop Publish & Share.",
    image: "/assets/systems/05-linkedin-carousel.png",
    imageAlt:
      "LinkedIn Carousel Content Studio: Content Brief through Carousel Package, with Refine & Iterate and Publish & Share loops",
    poster: "hud",
    accent: "#ff2d7a",
    metric: "5",
    metricCaption: "Five-stage pipeline",
    delivers: [
      "Content brief locks topic, audience, messages, tone, and references",
      "AI slide writer produces outline, headlines, and slide copy",
      "Image generate supplies on-brand art for each slide",
      "Google Drive folder holds slides, images, and docs",
      "Carousel package ready - refine & iterate, or publish & share",
    ],
    platforms: [
      { name: "n8n Cloud", role: "Carousel pipeline" },
      { name: "AI slide writer", role: "Outline and headlines" },
      { name: "Image generate", role: "On-brand slide art" },
      { name: "Google Drive", role: "Carousel folder" },
      { name: "Carousel package", role: "Export to publish" },
    ],
    stack: ["n8n", "agents", "drive"],
    steps: [
      {
        n: "01",
        title: "CONTENT BRIEF",
        body: "Define topic, audience, key messages, tone, and references.",
        foot: "Refine & iterate.",
      },
      {
        n: "02",
        title: "AI SLIDE WRITER",
        body: "AI generates slide outline, headlines, and content based on the brief.",
        foot: "Write the deck.",
      },
      {
        n: "03",
        title: "IMAGE GENERATE",
        body: "AI creates relevant, on-brand images to enhance each slide.",
        foot: "Picture the line.",
      },
      {
        n: "04",
        title: "GOOGLE DRIVE FOLDER",
        body: "All assets (slides, images, docs) are saved in an organized Drive folder.",
        foot: "File the run.",
      },
      {
        n: "05",
        title: "CAROUSEL PACKAGE",
        body: "Exported carousel package ready to publish and share.",
        foot: "Publish & share.",
      },
    ],
  },
  {
    slug: "data",
    index: "06",
    label: "Monthly Client Data Intake Desk",
    sublabel: "Data",
    description: "Repeat. Scale. Stay organized.",
    lede: "Automated Client Intake & Reporting Workflow - form intake, AI parse fields, Airtable save, summary email, monthly report ready. Bottom loop: Repeat. Scale. Stay organized.",
    image: "/assets/systems/06-monthly-intake.png",
    imageAlt:
      "Automated Client Intake & Reporting Workflow: Form Intake through Monthly Report Ready, with Repeat Scale Stay Organized loop",
    poster: "hud",
    accent: "#a3e635",
    metric: "5",
    metricCaption: "Five-stage pipeline",
    delivers: [
      "Form intake from the client web portal",
      "AI parse fields into structured records",
      "Airtable save for tracking across the month",
      "Summary email to the team before the report",
      "Monthly report ready - Repeat. Scale. Stay organized.",
    ],
    platforms: [
      { name: "Form intake", role: "Web portal submit" },
      { name: "AI parse", role: "Structure the fields" },
      { name: "Airtable", role: "Save the month" },
      { name: "Summary email", role: "Brief the team" },
      { name: "Monthly report", role: "Organized output" },
    ],
    stack: ["n8n", "agents", "airtable", "gmail"],
    steps: [
      {
        n: "01",
        title: "FORM INTAKE",
        body: "Client submits the intake form via web portal.",
        foot: "Repeat.",
      },
      {
        n: "02",
        title: "AI PARSE FIELDS",
        body: "AI extracts and structures key information from the submission.",
        foot: "Parse.",
      },
      {
        n: "03",
        title: "AIRTABLE SAVE",
        body: "Parsed data is automatically saved to Airtable for tracking.",
        foot: "Store.",
      },
      {
        n: "04",
        title: "SUMMARY EMAIL",
        body: "A summary email is sent to the team with key details.",
        foot: "Brief the floor.",
      },
      {
        n: "05",
        title: "MONTHLY REPORT READY",
        body: "All intake data is organized and ready for monthly reporting.",
        foot: "Stay organized.",
      },
    ],
  },
  {
    slug: "support",
    index: "07",
    label: "Multi Agent Customer Support System",
    sublabel: "Support",
    description: "Intake. Route. Score. Resolve or escalate.",
    lede: "Multi-agent customer support - webhook intake, classify intent, a specialist-agent stack (billing, account, orders, general, more), quality score with high-quality auto-resolve, then escalate via Slack or Gmail.",
    image: "/assets/systems/07-multi-agent-support.png",
    imageAlt:
      "Multi-agent customer support: Webhook Intake, Classify Intent, Specialist Agents stack, Quality Score, Escalate via Slack or Gmail",
    poster: "hud",
    accent: "#89aacc",
    metric: "5",
    metricCaption: "Specialist agent stack",
    delivers: [
      "Webhook intake receives the request",
      "Classify intent before a specialist is assigned",
      "Specialist stack: Billing, Account, Orders, General, More Agents",
      "Quality score can auto-resolve high-quality replies",
      "Escalate via Slack or Gmail when a human is needed",
    ],
    platforms: [
      { name: "n8n Cloud", role: "Webhook + routing" },
      { name: "Classifier", role: "Intent and route" },
      { name: "Specialist agents", role: "Billing, account, orders, general" },
      { name: "Quality score", role: "Auto-resolve or escalate" },
      { name: "Slack or Gmail", role: "Human escalation" },
    ],
    stack: ["n8n", "agents", "slack", "gmail"],
    steps: [
      {
        n: "01",
        title: "WEBHOOK INTAKE",
        body: "Receive the request via webhook. Primary flow starts here.",
        foot: "Primary flow.",
      },
      {
        n: "02",
        title: "CLASSIFY INTENT",
        body: "Determine intent and route to the specialist who owns it.",
        foot: "Classify.",
      },
      {
        n: "03",
        title: "SPECIALIST AGENTS",
        body: "Dashed group: Billing Agent, Account Agent, Orders Agent, General Agent, More Agents.",
        foot: "System component.",
      },
      {
        n: "04",
        title: "QUALITY SCORE",
        body: "Evaluate response quality and confidence. Dashed conditional: High Quality / Auto Resolve.",
        foot: "Conditional flow.",
      },
      {
        n: "05",
        title: "ESCALATE VIA SLACK OR GMAIL",
        body: "If a human is needed, Slack to a channel or user, or Gmail escalation - OR, not both required.",
        foot: "Escalate.",
      },
    ],
  },
  {
    slug: "gmail",
    index: "08",
    label: "Smart Gmail Triage Automation",
    sublabel: "Gmail",
    description: "Classify. Route. Draft. Review & send.",
    lede: "Gmail triage - new email received, AI classify, label route with a Calendar / Tasks branch, then calendar or tasks, then a context-aware draft. Bottom loop: Draft ready for review & send, back toward the trigger.",
    image: "/assets/systems/09-gmail-triage.png",
    imageAlt:
      "Gmail triage: Gmail Trigger, AI Classify, Label Route with Calendar and Tasks branch, Calendar or Tasks, Draft Reply, and draft-ready review loop",
    poster: "hud",
    accent: "#ea4335",
    metric: "5",
    metricCaption: "Classify, route, draft for review",
    delivers: [
      "Gmail trigger on new email received",
      "AI classify understands intent and context",
      "Label route branches to Calendar or Tasks",
      "Calendar or tasks creates the event or follow-up",
      "Draft reply waits for review & send - loop back to trigger",
    ],
    platforms: [
      { name: "Gmail", role: "New email trigger" },
      { name: "AI classify", role: "Intent and context" },
      { name: "Label route", role: "Calendar or tasks branch" },
      { name: "Google Calendar", role: "Schedule meeting or event" },
      { name: "Draft reply", role: "Review before send" },
    ],
    stack: ["n8n", "gmail", "agents", "calendar"],
    steps: [
      {
        n: "01",
        title: "GMAIL TRIGGER",
        body: "New email received. The run starts from the inbox.",
        foot: "New email received.",
      },
      {
        n: "02",
        title: "AI CLASSIFY",
        body: "Understand intent and context before a label is applied.",
        foot: "Understand intent and context.",
      },
      {
        n: "03",
        title: "LABEL ROUTE",
        body: "Categorize and determine action. Branch under this step: Calendar - schedule meeting or event. Tasks - create task or follow-up.",
        foot: "Categorize and determine action.",
      },
      {
        n: "04",
        title: "CALENDAR OR TASKS",
        body: "Create event or task as needed from the label branch.",
        foot: "Create event or task as needed.",
      },
      {
        n: "05",
        title: "DRAFT REPLY",
        body: "Generate a context-aware email draft. Return loop: Draft ready for review & send, back toward the Gmail trigger.",
        foot: "Draft ready for review & send.",
      },
    ],
  },
  {
    slug: "jobs",
    index: "09",
    label: "Smart Job Application Intake Pipeline",
    sublabel: "Jobs",
    description: "Inbox. Score. Reply by tier.",
    lede: "Smart Job Application Intake Pipeline - Gmail inbox, relevance filter, OpenAI opportunity parser, Supabase applications CRM, scoring engine, tier router. Hot 80+ research and personalized reply. Warm 50–79 concise reply. Cold below 50 record only.",
    image: "/assets/systems/10-job-intake.png",
    imageAlt:
      "Smart Job Application Intake Pipeline: Gmail Inbox through Tier Router, then Hot, Warm, and Cold reply paths",
    poster: "hud",
    accent: "#c9a227",
    metric: "3",
    metricCaption: "Three reply tiers",
    delivers: [
      "Gmail inbox captured, then a relevance filter",
      "OpenAI GPT-4o opportunity parser into Supabase Applications CRM",
      "Scoring engine feeds the tier router",
      "Hot 80+: company research, personalized reply, Gmail send",
      "Warm 50–79: concise reply, Gmail send. Cold below 50: record only",
    ],
    platforms: [
      { name: "n8n Cloud", role: "Intake orchestration" },
      { name: "Gmail", role: "Inbox in / send out" },
      { name: "OpenAI GPT-4o", role: "Opportunity parser" },
      { name: "Supabase", role: "Applications CRM" },
      { name: "DuckDuckGo Research", role: "Hot-path company research" },
    ],
    stack: ["n8n", "gmail", "agents", "supabase", "http"],
    steps: [
      {
        n: "01",
        title: "GMAIL INBOX",
        body: "New applications land in Gmail so nothing sits unseen.",
        foot: "Inbox.",
      },
      {
        n: "02",
        title: "RELEVANCE FILTER",
        body: "Filter for fit before a record is parsed or scored.",
        foot: "Filter.",
      },
      {
        n: "03",
        title: "OPENAI OPPORTUNITY PARSER",
        body: "GPT-4o parses the opportunity into structured fields.",
        foot: "Parse.",
      },
      {
        n: "04",
        title: "SUPABASE APPLICATIONS CRM",
        body: "Store the application record in Supabase Applications CRM.",
        foot: "CRM.",
      },
      {
        n: "05",
        title: "SCORING ENGINE",
        body: "Score the opportunity. No invented bands - 80+, 50–79, below 50.",
        foot: "Score.",
      },
      {
        n: "06",
        title: "TIER ROUTER",
        body: "Hot 80+: company research, personalized reply, Gmail send. Warm 50–79: concise reply, Gmail send. Cold below 50: record only.",
        foot: "Hot / Warm / Cold.",
      },
    ],
  },
  {
    slug: "booking",
    index: "10",
    label: "Voice Agent Calendar Booking System",
    sublabel: "Booking",
    description: "Call. Check. Book. Confirm.",
    lede: "Voice Agent Calendar - voice call to Retell Agent, check availability, book on Google Calendar, confirm booking. Dashed loop from confirm back to Retell. The agent speaks availability and confirmation back to the caller.",
    image: "/assets/systems/11-voice-booking.png",
    imageAlt:
      "Voice Agent Calendar: Voice Call, Retell Agent, Check Availability, Google Calendar Book, Confirm Booking, dashed loop back to Retell",
    poster: "hud",
    accent: "#c4a574",
    metric: "5",
    metricCaption: "Five-stage pipeline",
    delivers: [
      "Voice call hands the conversation to Retell Agent",
      "Availability is checked before a time is promised",
      "Google Calendar books the slot",
      "Confirm booking, then loop back to Retell",
      "Agent communicates availability and confirmation to the caller",
    ],
    platforms: [
      { name: "Voice call", role: "Caller in" },
      { name: "Retell Agent", role: "Voice conversation" },
      { name: "Availability", role: "Open-slot check" },
      { name: "Google Calendar", role: "Book" },
      { name: "Confirm booking", role: "Spoken confirmation" },
    ],
    stack: ["n8n", "voice", "agents", "calendar"],
    steps: [
      {
        n: "01",
        title: "VOICE CALL",
        body: "Incoming caller. The phone starts the flow.",
        foot: "Call.",
      },
      {
        n: "02",
        title: "RETELL AGENT",
        body: "Retell handles the conversation and speaks back to the caller.",
        foot: "Agent.",
      },
      {
        n: "03",
        title: "CHECK AVAILABILITY",
        body: "Look up open slots before a time is promised.",
        foot: "Availability.",
      },
      {
        n: "04",
        title: "GOOGLE CALENDAR",
        body: "Book the selected slot. Sublabel: Book.",
        foot: "Book.",
      },
      {
        n: "05",
        title: "CONFIRM BOOKING",
        body: "Booking confirmed. Dashed loop returns to Retell Agent so the caller hears availability and confirmation.",
        foot: "Confirm + loop.",
      },
    ],
  },
];

export function getSystem(slug: string | undefined) {
  return SYSTEMS.find((item) => item.slug === slug);
}
