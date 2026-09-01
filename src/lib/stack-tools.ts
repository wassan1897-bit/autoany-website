export type StackTool = {
  id: string;
  name: string;
  src: string;
};

/** Exact public labels - do not rename. Cream plate assets in /assets/stack-logos/cards. */
export const STACK_TOOLS: readonly StackTool[] = [
  { id: "n8n", name: "n8n", src: "/assets/stack-logos/cards/01-n8n.png" },
  {
    id: "gohighlevel",
    name: "Go High Level",
    src: "/assets/stack-logos/cards/02-gohighlevel.png",
  },
  { id: "make", name: "Make.com", src: "/assets/stack-logos/cards/03-make.png" },
  {
    id: "hubspot",
    name: "Hubspot",
    src: "/assets/stack-logos/cards/04-hubspot.png",
  },
  {
    id: "retell",
    name: "Retell AI",
    src: "/assets/stack-logos/cards/05-retell.png",
  },
  { id: "vapi", name: "VAPI", src: "/assets/stack-logos/cards/06-vapi.png" },
  {
    id: "airtable",
    name: "Airtable",
    src: "/assets/stack-logos/cards/07-airtable.png",
  },
  { id: "cal", name: "cal.com", src: "/assets/stack-logos/cards/08-cal.png" },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    src: "/assets/stack-logos/cards/09-elevenlabs.png",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    src: "/assets/stack-logos/cards/10-salesforce.png",
  },
  {
    id: "calendly",
    name: "Calendly",
    src: "/assets/stack-logos/cards/11-calendly.png",
  },
  {
    id: "twilio",
    name: "Twilio",
    src: "/assets/stack-logos/cards/12-twilio.png",
  },
  {
    id: "zoho",
    name: "zoho crm",
    src: "/assets/stack-logos/cards/13-zoho.png",
  },
  { id: "aws", name: "AWS", src: "/assets/stack-logos/cards/14-aws.png" },
  { id: "azure", name: "Azure", src: "/assets/stack-logos/cards/15-azure.png" },
  {
    id: "fastapi",
    name: "FastAPI",
    src: "/assets/stack-logos/cards/16-fastapi.png",
  },
  {
    id: "python",
    name: "Python",
    src: "/assets/stack-logos/cards/17-python.png",
  },
  {
    id: "claude",
    name: "Claude Code",
    src: "/assets/stack-logos/cards/18-claude.png",
  },
  {
    id: "lovable",
    name: "Lovable",
    src: "/assets/stack-logos/cards/19-lovable.png",
  },
  { id: "cursor", name: "Cursor", src: "/assets/stack-logos/cards/20-cursor.png" },
] as const;

export const STACK_WHEEL_IMAGES = STACK_TOOLS.map((tool) => ({
  src: tool.src,
  alt: tool.name,
  label: tool.name,
  subtitle: tool.name,
}));
