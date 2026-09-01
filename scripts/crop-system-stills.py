"""Crop Google Drive preview chrome from system HUD stills."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

BASE = Path(r"C:\michael-smith-portfolio\public\assets\systems")
PREVIEW = Path(r"C:\michael-smith-portfolio\previews\_crop-inspect")


def row_thirds(im: Image.Image, y: int) -> tuple[float, float, float]:
    w, _ = im.size
    px = im.load()
    thirds: list[float] = []
    for t in range(3):
        x0 = t * w // 3
        x1 = (t + 1) * w // 3
        total = 0.0
        n = 0
        for x in range(x0, x1):
            r, g, b = px[x, y]
            total += (r + g + b) / 3
            n += 1
        thirds.append(total / n)
    return thirds[0], thirds[1], thirds[2]


def find_drive_header(im: Image.Image) -> int:
    _, h = im.size
    header_end = 0
    band = 0
    for y in range(min(140, h)):
        left, center, right = row_thirds(im, y)
        mean = (left + center + right) / 3
        spread = max(left, center, right) - min(left, center, right)
        looks_bar = 32 < mean < 95 and spread < 28
        if looks_bar:
            band += 1
            header_end = y
        elif band and y < header_end + 8:
            continue
        elif band >= 18:
            break
        else:
            band = 0
            header_end = 0
    if band >= 18:
        return header_end + 8
    return 0


def find_white_canvas(im: Image.Image) -> tuple[int, int, int, int] | None:
    w, h = im.size
    px = im.load()

    def row_mean(y: int) -> float:
        total = 0.0
        for x in range(w):
            r, g, b = px[x, y]
            total += (r + g + b) / 3
        return total / w

    def col_mean(x: int) -> float:
        total = 0.0
        for y in range(h):
            r, g, b = px[x, y]
            total += (r + g + b) / 3
        return total / h

    ys = [y for y in range(h) if row_mean(y) > 160]
    xs = [x for x in range(w) if col_mean(x) > 110]
    if not ys or not xs:
        return None
    return xs[0], ys[0], xs[-1] + 1, ys[-1] + 1


def navy_color(im: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int]:
    x0, y0, x1, y1 = box
    px = im.load()
    samples: list[tuple[int, int, int]] = []
    for y in range(y0, y1, 4):
        for x in range(x0, x1, 4):
            r, g, b = px[x, y]
            if (r + g + b) / 3 < 40:
                samples.append((r, g, b))
    if not samples:
        return (12, 16, 28)
    samples.sort(key=lambda c: sum(c))
    return samples[len(samples) // 2]


def cover_edge_chevrons(im: Image.Image) -> Image.Image:
    w, h = im.size
    rgb = im.convert("RGB")
    rpx = rgb.load()
    out = im.copy()
    draw = ImageDraw.Draw(out)
    fill_l = navy_color(rgb, (8, h // 3, min(40, w), 2 * h // 3))
    fill_r = navy_color(rgb, (max(0, w - 40), h // 3, w - 8, 2 * h // 3))

    def circle_score(cx: int, cy: int, rad: int = 14) -> float:
        bright = 0
        n = 0
        for a in range(0, 360, 12):
            x = int(cx + rad * math.cos(math.radians(a)))
            y = int(cy + rad * math.sin(math.radians(a)))
            if 0 <= x < w and 0 <= y < h:
                r, g, b = rpx[x, y]
                if (r + g + b) / 3 > 70:
                    bright += 1
                n += 1
        return bright / n if n else 0.0

    for side, fill in (("L", fill_l), ("R", fill_r)):
        x0, x1 = (6, 48) if side == "L" else (w - 48, w - 6)
        best: tuple[float, int, int] | None = None
        for cy in range(h // 4, 3 * h // 4, 4):
            for cx in range(x0, x1, 3):
                score = circle_score(cx, cy, 14)
                if score > 0.45:
                    if best is None or score > best[0]:
                        best = (score, cx, cy)
        if best:
            _, cx, cy = best
            draw.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), fill=fill)
            print(f"    covered chevron {side} at ({cx},{cy}) score={best[0]:.2f}")
    return out


def main() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    for path in sorted(BASE.glob("*.png")):
        if "v1" in path.name:
            continue
        im = Image.open(path).convert("RGB")
        w, h = im.size
        top = find_drive_header(im)
        left, right, bottom = 0, w, h
        notes: list[str] = []

        if path.name.startswith("10-"):
            box = find_white_canvas(im)
            if box:
                left, top, right, bottom = box
                left = max(0, left + 2)
                top = max(0, top + 2)
                right = min(w, right - 2)
                bottom = min(h, bottom - 2)
                notes.append(f"white canvas {left},{top},{right},{bottom}")
            cropped = im.crop((left, top, right, bottom))
        else:
            if top:
                notes.append(f"drive header top={top}")
            cropped = im.crop((left, top, right, bottom))
            cropped = cover_edge_chevrons(cropped)

        dest = PREVIEW / f"cropped-{path.name}"
        cropped.save(dest, optimize=True)
        print(f"{path.name}: {w}x{h} -> {cropped.size}  {'; '.join(notes) or 'minimal'}")


if __name__ == "__main__":
    main()
