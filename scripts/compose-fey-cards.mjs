import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Demo cards are 675×2200 with baked perspective (left edge near, right foreshortened).
 * We rebuild actives at that canvas size and apply a matching SVG perspective so
 * screenshots sit like the Aceternity mockups—not flat rectangles.
 */

const W = 675;
const H = 2200;
const outDir = "C:/michael-smith-portfolio/public/assets/fey";

const cards = [
  { src: "01-home-bot.png", out: "card-01-home.png" },
  { src: "02-work.png", out: "card-02-work.png" },
  { src: "03-systems.png", out: "card-03-systems.png" },
  { src: "04-stack.png", out: "card-04-stack.png" },
  { src: "06-reviews.png", out: "card-05-reviews.png" },
];

async function buildCard(srcName, outName) {
  const srcPath = path.join(outDir, srcName);
  const outPath = path.join(outDir, outName);

  // Content face size before perspective (taller phone UI)
  const faceW = 620;
  const faceH = 2000;

  const face = await sharp(srcPath)
    .resize(faceW, faceH, { fit: "cover", position: "attention" })
    .jpeg({ quality: 92 })
    .toBuffer();

  const faceB64 = face.toString("base64");

  /**
   * Perspective quad matching Aceternity idle/active silhouette:
   * left edge full height, right edge shorter & shifted (rotateY feel).
   * Coordinates in the 675×2200 canvas.
   */
  // Destination corners: TL, TR, BR, BL
  const TL = [18, 80];
  const TR = [640, 220];
  const BR = [620, 2050];
  const BL = [12, 2120];

  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="plate" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3a3a40"/>
      <stop offset="8%" stop-color="#1a1a1e"/>
      <stop offset="100%" stop-color="#070709"/>
    </linearGradient>
    <clipPath id="face">
      <polygon points="${TL.join(",")} ${TR.join(",")} ${BR.join(",")} ${BL.join(",")}"/>
    </clipPath>
  </defs>
  <!-- plate / bezel -->
  <polygon points="${TL[0] - 6},${TL[1] - 8} ${TR[0] + 8},${TR[1] - 10} ${BR[0] + 10},${BR[1] + 10} ${BL[0] - 6},${BL[1] + 8}" fill="url(#plate)" rx="20"/>
  <line x1="${TL[0] - 4}" y1="${TL[1]}" x2="${BL[0] - 4}" y2="${BL[1]}" stroke="#7a7a82" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <!-- screenshot mapped into perspective quad via nested transform approximation -->
  <g clip-path="url(#face)">
    <image
      xlink:href="data:image/jpeg;base64,${faceB64}"
      width="${faceW}"
      height="${faceH}"
      transform="matrix(0.98 0.06 -0.12 0.96 28 90)"
      preserveAspectRatio="xMidYMin slice"
    />
  </g>
</svg>`);

  await sharp(svg).png().toFile(outPath);
  console.log("wrote", outPath);
}

for (const c of cards) {
  await buildCard(c.src, c.out);
}

fs.copyFileSync(path.join(outDir, "ref/idle.webp"), path.join(outDir, "idle.webp"));
fs.copyFileSync(path.join(outDir, "ref/main.webp"), path.join(outDir, "main.webp"));
console.log("done");
