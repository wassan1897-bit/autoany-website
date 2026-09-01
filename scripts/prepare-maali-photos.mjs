import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR =
  "C:\\Users\\prash\\.cursor\\projects\\c-michael-smith-portfolio\\assets";
const OUT_DIR = path.resolve("public/assets/maali");
const RATIO = 415 / 874;

const slides = [
  {
    id: "01-rooftop",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-1cd9a5a6-95c2-49a1-bf48-39cef9d4efb4-86c4fea1-5a19-4087-9f32-b27345a3b096.png",
    fx: 0.52,
    fy: 0.4,
    grain: false,
  },
  {
    id: "02-lounge",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-712c185c-3cc6-4ec0-a561-3122b8199c4c-3d7e111f-59e9-4fc0-94c5-493b904ca2ee.png",
    fx: 0.5,
    fy: 0.38,
    grain: false,
    avatar: true,
  },
  {
    id: "03-olive-smile",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-a5ea0abc-8201-47e4-a279-bc844033ef3f-5a325805-ff8b-4028-a914-b1f03b7f2a1f.png",
    fx: 0.5,
    fy: 0.3,
    grain: true,
    bottomTrim: 0.06,
  },
  {
    id: "04-sunlight",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-a1944acb-c551-4ee9-8502-d97a4aad1eab-34c1a180-c7bf-4414-9c27-9aee5fee52e4.png",
    fx: 0.5,
    fy: 0.34,
    grain: false,
  },
  {
    id: "05-olive-lean",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-8329599a-339d-4126-a83a-177e7adea5a5-bc6b919e-cae1-4bc3-b07c-20c69ab25e9b.png",
    fx: 0.5,
    fy: 0.32,
    grain: true,
  },
  {
    id: "06-garage",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-1381c325-56b1-4d33-87ac-3164208e0aaa-983110c2-e648-4e99-9062-beaacbb030d7.png",
    fx: 0.5,
    fy: 0.4,
    grain: true,
  },
  {
    id: "07-palm",
    file: "c__Users_prash_AppData_Roaming_Cursor_User_workspaceStorage_7886ec4f54d91744f1c6989099eae464_images_image-83ec5fab-528d-44aa-a368-ab2e51f8dad9-0d807e9b-7846-48c1-9a08-f16c45193fab.png",
    fx: 0.48,
    fy: 0.38,
    grain: true,
  },
];

function coverCrop(width, height, fx, fy, bottomTrim = 0) {
  const usableH = Math.round(height * (1 - bottomTrim));
  let cropW;
  let cropH;
  if (width / usableH > RATIO) {
    cropH = usableH;
    cropW = Math.round(usableH * RATIO);
  } else {
    cropW = width;
    cropH = Math.round(width / RATIO);
    if (cropH > usableH) {
      cropH = usableH;
      cropW = Math.round(usableH * RATIO);
    }
  }
  let left = Math.round(fx * width - cropW / 2);
  let top = Math.round(fy * height - cropH / 2);
  left = Math.max(0, Math.min(width - cropW, left));
  top = Math.max(0, Math.min(usableH - cropH, top));
  return { left, top, width: cropW, height: cropH };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const slide of slides) {
  const input = path.join(SRC_DIR, slide.file);
  if (!fs.existsSync(input)) {
    throw new Error(`Missing source: ${slide.file}`);
  }
  const meta = await sharp(input, { failOn: "none" }).rotate().metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const crop = coverCrop(width, height, slide.fx, slide.fy, slide.bottomTrim ?? 0);
  const outW = Math.min(830, Math.round(crop.width * 1.45));
  const outH = Math.round(outW / RATIO);

  let pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .extract(crop)
    .resize({
      width: outW,
      height: outH,
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    });

  if (slide.grain) {
    pipeline = pipeline.median(1);
  }

  pipeline = pipeline
    .modulate({ brightness: 1.04, saturation: 1.1 })
    .sharpen({ sigma: slide.grain ? 1.15 : 0.9, m1: 0.7, m2: 0.35 })
    .webp({ quality: 86, effort: 5, smartSubsample: true });

  const dest = path.join(OUT_DIR, `${slide.id}.webp`);
  await pipeline.toFile(dest);
  const outMeta = await sharp(dest).metadata();
  console.log(
    `${slide.id}: ${width}x${height} -> crop ${crop.width}x${crop.height} @${crop.left},${crop.top} -> ${outMeta.width}x${outMeta.height}`,
  );

  if (slide.avatar) {
    const face = Math.round(Math.min(width, height) * 0.42);
    const left = Math.max(0, Math.min(width - face, Math.round(width * 0.5 - face / 2)));
    const top = Math.max(0, Math.min(height - face, Math.round(height * 0.22)));
    await sharp(input, { failOn: "none" })
      .rotate()
      .extract({ left, top, width: face, height: face })
      .resize(512, 512, { kernel: sharp.kernel.lanczos3, withoutEnlargement: true })
      .modulate({ brightness: 1.04, saturation: 1.08 })
      .sharpen({ sigma: 0.9, m1: 0.65, m2: 0.3 })
      .webp({ quality: 88, effort: 5 })
      .toFile(path.join(OUT_DIR, "avatar.webp"));
    console.log("avatar: 512 face crop from", slide.id);
  }
}
