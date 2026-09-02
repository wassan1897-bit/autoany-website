/**
 * Batch-convert PNG/JPEG assets to WebP (keeps originals for fallback).
 * Run: node scripts/convert-png-to-webp.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(root, "public", "assets");

const DIRS = [
  "systems",
  "stack-logos/cards",
  "fey",
  "work",
  "app-icons",
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

async function convert(file) {
  const webp = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const srcStat = await fs.stat(file);
  try {
    const dstStat = await fs.stat(webp);
    if (dstStat.mtimeMs >= srcStat.mtimeMs) return { file, skipped: true };
  } catch {
    /* create */
  }

  const input = sharp(file);
  const meta = await input.metadata();
  const pipeline = input.webp({
    quality: meta.hasAlpha ? 92 : 86,
    effort: 4,
    smartSubsample: true,
  });
  await pipeline.toFile(webp);
  const outStat = await fs.stat(webp);
  return {
    file: path.relative(root, file),
    webp: path.relative(root, webp),
    before: srcStat.size,
    after: outStat.size,
    saved: srcStat.size - outStat.size,
  };
}

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;

for (const rel of DIRS) {
  const dir = path.join(assetRoot, rel);
  try {
    await fs.access(dir);
  } catch {
    continue;
  }
  const files = await walk(dir);
  for (const file of files) {
    const result = await convert(file);
    if (result.skipped) continue;
    converted += 1;
    totalBefore += result.before;
    totalAfter += result.after;
    const pct = ((1 - result.after / result.before) * 100).toFixed(1);
    console.log(
      `${result.file} ΓåÆ ${result.webp} (${(result.before / 1024).toFixed(0)}KB ΓåÆ ${(result.after / 1024).toFixed(0)}KB, ΓêÆ${pct}%)`,
    );
  }
}

console.log(
  `\nDone: ${converted} files, ${(totalBefore / 1024 / 1024).toFixed(2)}MB ΓåÆ ${(totalAfter / 1024 / 1024).toFixed(2)}MB (ΓêÆ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`,
);
