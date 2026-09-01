"""Clone the 01 HUD template (photo + Inter type) for systems 02-11. 01 stays the v1 still."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(r"C:\michael-smith-portfolio")
ASSETS = ROOT / "public" / "assets"
SYSTEMS = ASSETS / "systems"
WORK = ASSETS / "work"
FONTS = ROOT / "scripts" / "fonts"
W, H = 1536, 1024
RED = (196, 30, 58, 255)
WHITE = (255, 255, 255, 242)
MUTED = (255, 255, 255, 168)
HAIR = (255, 255, 255, 48)
PAD = 56


def fnt(weight: str, size: int) -> ImageFont.FreeTypeFont:
    name = "Inter-SemiBold.ttf" if weight == "sb" else "Inter-Regular.ttf"
    return ImageFont.truetype(str(FONTS / name), size)


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = text.replace("—", "-").split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if draw.textlength(trial, font=font) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def plate(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGB")
    scale = max(W / im.width, H / im.height)
    im = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.LANCZOS)
    left = (im.width - W) // 2
    top = max(0, (im.height - H) // 2 - 20)
    im = im.crop((left, top, left + W, top + H))
    im = ImageEnhance.Brightness(im).enhance(0.52)
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(0.78)
    veil = Image.new("RGB", (W, H), (0, 0, 0))
    return Image.blend(im, veil, 0.28)


def paint(
    photo: Path,
    out: Path,
    title: str,
    subtitle: str,
    steps: list[dict[str, str]],
) -> None:
    canvas = plate(photo).convert("RGBA")
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    title_f = fnt("sb", 28)
    sub_f = fnt("reg", 14)
    num_f = fnt("sb", 22)
    head_f = fnt("sb", 15 if len(steps) > 5 else 17)
    body_f = fnt("reg", 14 if len(steps) > 5 else 16)
    foot_f = fnt("reg", 14)

    draw.line((PAD, 44, PAD + 220, 44), fill=HAIR, width=1)
    draw.text((PAD, 58), title.upper(), font=title_f, fill=WHITE)
    draw.text((PAD, 98), subtitle.upper(), font=sub_f, fill=MUTED)

    n = len(steps)
    gap = 0
    usable = W - PAD * 2
    col_w = usable / n
    col_top = 168
    rule_y = 928
    foot_y = 952
    inner = col_w - 28

    draw.line((PAD, rule_y, W - PAD, rule_y), fill=HAIR, width=1)

    for i, step in enumerate(steps):
        x0 = PAD + i * col_w
        if i > 0:
            draw.line((x0, col_top, x0, rule_y), fill=HAIR, width=1)

        tx = x0 + 18
        y = col_top
        draw.text((tx, y), step["n"], font=num_f, fill=WHITE)
        y += 40
        heads = wrap(draw, step["title"], head_f, inner)
        for line in heads[:2]:
            draw.text((tx, y), line, font=head_f, fill=WHITE)
            y += 22
        draw.line((tx, y + 8, tx + 36, y + 8), fill=RED, width=2)
        y += 24
        for line in wrap(draw, step["body"], body_f, inner)[:5]:
            draw.text((tx, y), line, font=body_f, fill=MUTED)
            y += 22

        draw.text((tx, foot_y), step["foot"], font=foot_f, fill=WHITE)

    composed = Image.alpha_composite(canvas, layer).convert("RGB")
    composed.save(out, "PNG", optimize=True)
    print(f"wrote {out.name} ({out.stat().st_size})")


HUDS = [
    (
        WORK / "02-sales.jpg",
        SYSTEMS / "02-sales-follow-up.png",
        "AI Sales Follow Up Sequence",
        "Schedule. Write. Send. Log. Alert.",
        [
            {"n": "01", "title": "SCHEDULE TRIGGER", "body": "Time or event fires the sequence so no follow-up depends on memory.", "foot": "Trigger."},
            {"n": "02", "title": "AI EMAIL WRITER", "body": "Draft the next note from deal context, last touch, and deal state.", "foot": "Write."},
            {"n": "03", "title": "GMAIL SEND", "body": "Send from the working inbox so the thread stays in one place.", "foot": "Send."},
            {"n": "04", "title": "AIRTABLE UPDATE", "body": "Log status, timestamp, and next action on the Airtable record.", "foot": "Update."},
            {"n": "05", "title": "SLACK ALERT", "body": "Ping the floor when a reply, bounce, or handoff needs a human.", "foot": "Alert."},
        ],
    ),
    (
        WORK / "03-intake.jpg",
        SYSTEMS / "03-client-onboarding.png",
        "Client Onboarding Architecture",
        "Email in. Folder ready. Workspace live.",
        [
            {"n": "01", "title": "GMAIL CLIENT EMAIL", "body": "Client email lands in Gmail and starts onboarding.", "foot": "Email in."},
            {"n": "02", "title": "EXTRACT WITH CLAUDE", "body": "Claude reads the thread and pulls structured client facts.", "foot": "Extract."},
            {"n": "03", "title": "DUPLICATE CHECK", "body": "Match existing clients before a second folder is created.", "foot": "One record."},
            {"n": "04", "title": "DRIVE CLIENT FOLDER", "body": "Create the client folder inside the Google Drive leads directory.", "foot": "Folder."},
            {"n": "05", "title": "SAVE ATTACHMENTS", "body": "Save inbound files into the new client folder.", "foot": "Files."},
            {"n": "06", "title": "GENERATE DOCUMENTS", "body": "Write client.md, Clarity Call Guide, Thesis Readiness Diagnostic.", "foot": "Docs."},
            {"n": "07", "title": "READY WORKSPACE", "body": "Named folder, files, and docs are ready for the call.", "foot": "Ready."},
        ],
    ),
    (
        WORK / "04-leads.jpg",
        SYSTEMS / "04-lead-outreach.png",
        "Lead to Outreach Architecture",
        "Capture. Enrich. Qualify. Store. Outreach.",
        [
            {"n": "01", "title": "LEAD FORM", "body": "Capture leads from web forms, landing pages, and campaigns.", "foot": "Forms & web."},
            {"n": "02", "title": "ENRICH DATA", "body": "Enrich with firmographics, contact data, intent signals, and more.", "foot": "Enrichment."},
            {"n": "03", "title": "AI QUALIFY", "body": "AI scores and qualifies leads based on ICP fit, intent, and engagement.", "foot": "AI model."},
            {"n": "04", "title": "GOOGLE SHEETS CRM", "body": "Store and manage qualified leads in Google Sheets as your CRM.", "foot": "Sheets API."},
            {"n": "05", "title": "OUTREACH READY", "body": "Push qualified leads to outreach workflows and start conversations.", "foot": "Sequences."},
        ],
    ),
    (
        WORK / "05-linkedin.jpg",
        SYSTEMS / "05-linkedin-carousel.png",
        "LinkedIn Carousel Content Studio",
        "Brief. Write. Image. File. Publish.",
        [
            {"n": "01", "title": "CONTENT BRIEF", "body": "Define topic, audience, key messages, tone, and references.", "foot": "Refine & iterate."},
            {"n": "02", "title": "AI SLIDE WRITER", "body": "AI generates slide outline, headlines, and content based on the brief.", "foot": "Write the deck."},
            {"n": "03", "title": "IMAGE GENERATE", "body": "AI creates relevant, on-brand images to enhance each slide.", "foot": "Picture the line."},
            {"n": "04", "title": "GOOGLE DRIVE FOLDER", "body": "Slides, images, and docs saved in an organized Drive folder.", "foot": "File the run."},
            {"n": "05", "title": "CAROUSEL PACKAGE", "body": "Exported carousel package ready to publish and share.", "foot": "Publish & share."},
        ],
    ),
    (
        WORK / "06-data.jpg",
        SYSTEMS / "06-monthly-intake.png",
        "Automated Client Intake & Reporting",
        "Repeat. Scale. Stay organized.",
        [
            {"n": "01", "title": "FORM INTAKE", "body": "Client submits the intake form via web portal.", "foot": "Repeat."},
            {"n": "02", "title": "AI PARSE FIELDS", "body": "AI extracts and structures key information from the submission.", "foot": "Parse."},
            {"n": "03", "title": "AIRTABLE SAVE", "body": "Parsed data is automatically saved to Airtable for tracking.", "foot": "Store."},
            {"n": "04", "title": "SUMMARY EMAIL", "body": "A summary email is sent to the team with key details.", "foot": "Brief the floor."},
            {"n": "05", "title": "MONTHLY REPORT READY", "body": "All intake data is organized and ready for monthly reporting.", "foot": "Stay organized."},
        ],
    ),
    (
        WORK / "07-support.jpg",
        SYSTEMS / "07-multi-agent-support.png",
        "Multi Agent Customer Support",
        "Intake. Route. Score. Resolve or escalate.",
        [
            {"n": "01", "title": "WEBHOOK INTAKE", "body": "Receive the request via webhook so nothing waits on a shared inbox.", "foot": "Primary flow."},
            {"n": "02", "title": "CLASSIFY INTENT", "body": "Determine intent and route to the specialist who owns it.", "foot": "Classify."},
            {"n": "03", "title": "SPECIALIST AGENTS", "body": "Billing, Account, Orders, General, plus room to add more agents.", "foot": "Right agent."},
            {"n": "04", "title": "QUALITY SCORE", "body": "Score the reply. High quality can auto-resolve without a human.", "foot": "Conditional."},
            {"n": "05", "title": "ESCALATE", "body": "If a human is needed, send to Slack or Gmail.", "foot": "Slack or Gmail."},
        ],
    ),
    (
        ASSETS / "panamera.png",
        SYSTEMS / "08-rona-fulfillment.png",
        "RONA Order Fulfillment Operations",
        "Flow in progress.",
        [
            {"n": "01", "title": "ORDER IN", "body": "A fulfillment request lands and waits for the wired floor.", "foot": "Hold."},
            {"n": "02", "title": "ALLOCATE", "body": "Stock and route are assigned once the RONA sequence is locked.", "foot": "Hold."},
            {"n": "03", "title": "PICK", "body": "Pick path runs when the operations still is delivered.", "foot": "Hold."},
            {"n": "04", "title": "DISPATCH", "body": "Outbound handoff stays parked until the flow is confirmed.", "foot": "Hold."},
            {"n": "05", "title": "CONFIRM", "body": "Close the loop when the live RONA diagram replaces this placeholder.", "foot": "Hold."},
        ],
    ),
    (
        WORK / "09-gmail.jpg",
        SYSTEMS / "09-gmail-triage.png",
        "Smart Gmail Triage Automation",
        "Classify. Route. Draft. Review & send.",
        [
            {"n": "01", "title": "GMAIL TRIGGER", "body": "New email received. The run starts from the inbox.", "foot": "Mail in."},
            {"n": "02", "title": "AI CLASSIFY", "body": "Understand intent and context before a label is applied.", "foot": "Know the ask."},
            {"n": "03", "title": "LABEL ROUTE", "body": "Categorize and determine action: calendar, task, or reply.", "foot": "Pick the path."},
            {"n": "04", "title": "CALENDAR OR TASKS", "body": "Create an event or a follow-up task as the label requires.", "foot": "Act on it."},
            {"n": "05", "title": "DRAFT REPLY", "body": "Generate a context-aware draft, ready for review and send.", "foot": "Review & send."},
        ],
    ),
    (
        WORK / "10-jobs.jpg",
        SYSTEMS / "10-job-intake.png",
        "Smart Job Application Intake Pipeline",
        "Inbox. Score. Reply by tier.",
        [
            {"n": "01", "title": "GMAIL INBOX", "body": "New applications land in Gmail so nothing sits unseen.", "foot": "Inbox."},
            {"n": "02", "title": "RELEVANCE FILTER", "body": "Filter for fit before a record is parsed or scored.", "foot": "Filter."},
            {"n": "03", "title": "OPENAI PARSER", "body": "GPT-4o parses the opportunity into structured fields.", "foot": "Parse."},
            {"n": "04", "title": "SCORING ENGINE", "body": "Rank by value, fit, and urgency into a clear score.", "foot": "Score."},
            {"n": "05", "title": "RESPOND BY TIER", "body": "Hot 80+: research and personalize. Warm 50-79: short reply. Cold: record only.", "foot": "Right reply."},
        ],
    ),
    (
        WORK / "11-booking.jpg",
        SYSTEMS / "11-voice-booking.png",
        "Voice Agent Calendar Booking",
        "Call. Check. Book. Confirm.",
        [
            {"n": "01", "title": "VOICE CALL", "body": "Incoming caller. The phone starts the flow.", "foot": "Call in."},
            {"n": "02", "title": "RETELL AGENT", "body": "Voice AI handles the conversation and comes back with the answer.", "foot": "Speaks back."},
            {"n": "03", "title": "CHECK AVAILABILITY", "body": "Look up open slots before a time is ever promised.", "foot": "Open slots."},
            {"n": "04", "title": "GOOGLE CALENDAR", "body": "Book the selected slot on the working calendar.", "foot": "Book."},
            {"n": "05", "title": "CONFIRM BOOKING", "body": "Confirmed. The agent tells the caller, not a silent dashboard.", "foot": "Confirmed."},
        ],
    ),
]


def main() -> None:
    v1 = SYSTEMS / "01-ai-content-engine-v1.png"
    dst01 = SYSTEMS / "01-ai-content-engine.png"
    if v1.exists():
        dst01.write_bytes(v1.read_bytes())
        print("kept 01 from v1")

    for photo, out, title, subtitle, steps in HUDS:
        if not photo.exists():
            raise SystemExit(f"missing {photo}")
        paint(photo, out, title, subtitle, steps)


if __name__ == "__main__":
    main()
