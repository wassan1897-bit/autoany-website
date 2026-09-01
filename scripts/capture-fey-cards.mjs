import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const out = "C:/michael-smith-portfolio/public/assets/fey";
fs.mkdirSync(out, { recursive: true });

const sections = [
  { id: "home", file: "01-home-bot.png" },
  { id: "work", file: "02-work.png" },
  { id: "journal", file: "03-systems.png" },
  { id: "resume", file: "04-stack.png" },
  { id: "features", file: "05-team.png" },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

await page.addInitScript(() => {
  localStorage.setItem("autoany-theme", "dark");
});

await page.goto("http://localhost:5173/", {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(6500);
await page.evaluate(() => {
  document.documentElement.setAttribute("data-theme", "dark");
  document.documentElement.style.colorScheme = "dark";
  document.body.style.overflow = "";
});
await page.waitForTimeout(600);

for (const s of sections) {
  await page.evaluate((id) => {
    if (id === "home") {
      window.scrollTo(0, 0);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
  }, s.id);
  await page.waitForTimeout(1100);
  const file = path.join(out, s.file);
  await page.screenshot({ path: file, type: "png" });
  console.log("saved", file);
}

await browser.close();
console.log("done");
