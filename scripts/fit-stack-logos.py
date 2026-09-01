"""Fit stack logos onto cream portrait plates for the orbital wheel."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "assets" / "stack-logos"
OUT = SRC / "cards"
CREAM = (244, 242, 238, 255)
CARD_W, CARD_H = 720, 960
PAD = 0.08


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def crop_alpha(im: Image.Image, threshold: int = 18) -> Image.Image:
    arr = np.array(im)
    mask = arr[:, :, 3] > threshold
    if not mask.any():
        return im
    ys, xs = np.where(mask)
    pad = 4
    l = max(int(xs.min()) - pad, 0)
    t = max(int(ys.min()) - pad, 0)
    r = min(int(xs.max()) + pad + 1, im.width)
    b = min(int(ys.max()) + pad + 1, im.height)
    return im.crop((l, t, r, b))


def punch_near_black(im: Image.Image, limit: int = 26) -> Image.Image:
    arr = np.array(im).astype(np.int16)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    dark = (r <= limit) & (g <= limit) & (b <= limit)
    arr[:, :, 3] = np.where(dark, 0, a)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def punch_light(im: Image.Image, limit: int = 224) -> Image.Image:
    """Drop light neutral pixels — flattened alpha checkerboards and white/cream plates."""
    arr = np.array(im).astype(np.int16)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    mn = np.minimum(np.minimum(r, g), b)
    mx = np.maximum(np.maximum(r, g), b)
    light_neutral = (mn >= limit) & ((mx - mn) <= 14)
    arr[:, :, 3] = np.where(light_neutral, 0, a)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def keep_saturated_or_dark(im: Image.Image, sat: int = 28, dark: int = 70) -> Image.Image:
    arr = np.array(im).astype(np.int16)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    colorful = (mx - mn) >= sat
    ink = (r + g + b) <= dark * 3
    keep = colorful | ink
    arr[:, :, 3] = np.where(keep, a, 0)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def keep_blue(im: Image.Image) -> Image.Image:
    arr = np.array(im).astype(np.int16)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    blue = (b >= 90) & (b > r + 18) & (b > g - 10)
    arr[:, :, 3] = np.where(blue, a, 0)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def extract_salesforce(im: Image.Image) -> Image.Image:
    arr = np.array(im).astype(np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    cloud = (b >= 140) & (g >= 90) & (r <= 140) & (b > r + 20)
    white = (r >= 235) & (g >= 235) & (b >= 235)
    mask = cloud.copy()
    # Keep white only if surrounded by cloud (interior of logo).
    cloud_img = Image.fromarray((cloud * 255).astype(np.uint8), "L")
    dilated = np.array(cloud_img.filter(ImageFilter.MaxFilter(15))) > 0
    keep = cloud | (white & dilated)
    out = arr.copy()
    out[:, :, 3] = np.where(keep, 255, 0)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def elevenlabs_mark() -> Image.Image:
    w, h = 420, 420
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bar_w, gap = 92, 72
    x1 = (w - (bar_w * 2 + gap)) // 2
    y1, y2 = 28, h - 28
    color = (17, 17, 17, 255)
    d.rounded_rectangle((x1, y1, x1 + bar_w, y2), radius=18, fill=color)
    d.rounded_rectangle((x1 + bar_w + gap, y1, x1 + bar_w * 2 + gap, y2), radius=18, fill=color)
    return im


def fit_on_card(logo: Image.Image) -> Image.Image:
    logo = crop_alpha(logo)
    card = Image.new("RGBA", (CARD_W, CARD_H), CREAM)
    inner_w = int(CARD_W * (1 - PAD * 2))
    inner_h = int(CARD_H * (1 - PAD * 2))
    lw, lh = logo.size
    scale = min(inner_w / lw, inner_h / lh)
    nw, nh = max(1, int(lw * scale)), max(1, int(lh * scale))
    fitted = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (CARD_W - nw) // 2
    y = (CARD_H - nh) // 2
    card.alpha_composite(fitted, (x, y))
    return card.convert("RGB")


FLAT_LIGHT_BG = {"14-aws.png", "16-fastapi.png", "20-cursor.png"}
ALREADY_CUT_OUT = {"17-python.png", "18-claude.png", "19-lovable.png"}


def process(name: str) -> Image.Image:
    path = SRC / name
    if name == "09-elevenlabs.png":
        return elevenlabs_mark()

    im = load_rgba(path)

    if name in FLAT_LIGHT_BG:
        return punch_light(im)

    if name in ALREADY_CUT_OUT:
        return im

    if name == "15-azure.png":
        # Source is a wide lockup; the triangle mark alone reads at node/plate size.
        return punch_near_black(im.crop((0, 0, 275, im.height)), limit=40)

    if name == "03-make.png":
        return keep_saturated_or_dark(im, sat=22, dark=55)

    if name == "11-calendly.png":
        return keep_blue(im)

    if name == "10-salesforce.png":
        return extract_salesforce(im)

    arr = np.array(im)
    opaque = arr[:, :, 3] > 20
    trans = 1.0 - (opaque.mean() if opaque.size else 1.0)
    if trans > 0.5:
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        ink = opaque & (r < 40) & (g < 40) & (b < 40)
        # Black wordmarks on alpha (VAPI) are the logo — do not punch them out.
        if opaque.any() and ink.sum() / opaque.sum() > 0.55:
            return im
        return punch_near_black(im, limit=18)

    return punch_near_black(im, limit=26)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = [
        "01-n8n.png",
        "02-gohighlevel.png",
        "03-make.png",
        "04-hubspot.png",
        "05-retell.png",
        "06-vapi.png",
        "07-airtable.png",
        "08-cal.png",
        "09-elevenlabs.png",
        "10-salesforce.png",
        "11-calendly.png",
        "12-twilio.png",
        "13-zoho.png",
        "14-aws.png",
        "15-azure.png",
        "16-fastapi.png",
        "17-python.png",
        "18-claude.png",
        "19-lovable.png",
        "20-cursor.png",
    ]
    for name in files:
        logo = process(name)
        card = fit_on_card(logo)
        dest = OUT / name
        card.save(dest, "PNG", optimize=True)
        print(f"wrote {dest.name} from {logo.size} -> {card.size}")


if __name__ == "__main__":
    main()
