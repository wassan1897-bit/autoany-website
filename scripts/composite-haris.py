"""Chroma-key Haris at native resolution onto the studio backdrop."""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(r"C:\michael-smith-portfolio\public\assets")
GREEN = ROOT / "haris-green.png"
BACKDROP = ROOT / "studio-backdrop.png"
CUTOUT = ROOT / "haris-cutout.png"
OUT = ROOT / "haris-studio.png"

KEY = np.array([9.0, 196.0, 17.0])
CANVAS = (1920, 1080)


def chroma_key(path: Path) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    arr = np.array(src).astype(np.float32)
    rgb = arr[:, :, :3]
    dist = np.linalg.norm(rgb - KEY, axis=2)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    green_dom = g - np.maximum(r, b)

    alpha = np.ones(dist.shape, dtype=np.float32)
    alpha[dist < 80] = 0.0
    alpha[green_dom > 45] = 0.0
    fringe = (dist >= 80) & (dist < 125) & (green_dom <= 45)
    alpha[fringe] = np.clip((dist[fringe] - 80.0) / 45.0, 0.0, 1.0)

    # Despill only — do not blur or resample the photo.
    rgb[:, :, 1] = np.minimum(g, (r + b) * 0.5 + 8)

    arr[:, :, :3] = rgb
    arr[:, :, 3] = alpha * 255.0
    keyed = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    bbox = keyed.getbbox()
    if bbox:
        keyed = keyed.crop(bbox)
    return keyed


def main() -> None:
    subject = chroma_key(GREEN)
    subject.save(CUTOUT, "PNG")

    bg = Image.open(BACKDROP).convert("RGB")
    canvas = Image.new("RGB", CANVAS)
    scale = max(CANVAS[0] / bg.width, CANVAS[1] / bg.height)
    fitted = bg.resize(
        (max(1, round(bg.width * scale)), max(1, round(bg.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = (fitted.width - CANVAS[0]) // 2
    top = (fitted.height - CANVAS[1]) // 2
    canvas.paste(fitted.crop((left, top, left + CANVAS[0], top + CANVAS[1])), (0, 0))

    # Native pixels only — never upscale the portrait.
    x = int(CANVAS[0] * 0.62 - subject.width / 2)
    y = CANVAS[1] - subject.height
    canvas.paste(subject, (x, y), subject)
    canvas.save(OUT, "PNG")
    print(f"cutout {subject.size} canvas {canvas.size} pos=({x},{y})")


if __name__ == "__main__":
    main()
