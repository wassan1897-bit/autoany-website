/**
 * Comprehensive performance audit — desktop + mobile (slow 4G + CPU throttle).
 * Run against preview: AUDIT_URL=http://localhost:4173 node scripts/performance-audit.mjs
 */
import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.AUDIT_URL ?? "http://localhost:4173";
const OUT = path.resolve("test-screenshots/perf-audit");

async function auditProfile(browser, label, contextOptions, cdpThrottle) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  if (cdpThrottle) {
    const session = await context.newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    });
  }

  const navStart = Date.now();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });

  const loaderMs = await page.evaluate(async () => {
    const start = performance.now();
    const loader = document.querySelector('[aria-label="Loading"]');
    if (!loader) return 0;
    return new Promise((resolve) => {
      const check = () => {
        if (!document.querySelector('[aria-label="Loading"]')) {
          resolve(performance.now() - start);
          return;
        }
        if (performance.now() - start > 15000) {
          resolve(-1);
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  });

  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((e) => e.name === "first-contentful-paint");
    const resources = performance.getEntriesByType("resource");
    const transfer = resources.reduce(
      (sum, r) => sum + ((r).transferSize || 0),
      0,
    );
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd) : null,
      fcp: fcp ? Math.round(fcp.startTime) : null,
      transferKb: Math.round(transfer / 1024),
      splineVisible: !!document.querySelector(".nk-spline canvas"),
      effectQuality: document.documentElement.dataset.effectQuality ?? "unknown",
      heroVisible: !!document.querySelector("h1.nk-heading"),
    };
  });

  const scrollProbe = await page.evaluate(async () => {
    const samples = [];
    let raf = 0;
    const t0 = performance.now();
    const sample = (t) => {
      samples.push(t);
      if (t - t0 < 1200) raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    window.scrollBy({ top: 600, behavior: "auto" });
    await new Promise((r) => setTimeout(r, 1300));
    cancelAnimationFrame(raf);
    const deltas = samples.slice(1).map((t, i) => t - samples[i]);
    const avg = deltas.length
      ? deltas.reduce((a, b) => a + b, 0) / deltas.length
      : 0;
    return {
      fps: avg > 0 ? Math.round(1000 / avg) : 0,
      maxFrameMs: deltas.length ? Math.round(Math.max(...deltas)) : 0,
    };
  });

  await page.screenshot({
    path: path.join(OUT, `${label}.png`),
    fullPage: false,
  });

  await context.close();

  return {
    label,
    navMs: Date.now() - navStart,
    loaderMs,
    ...metrics,
    scrollProbe,
    throttled: Boolean(cdpThrottle),
  };
}

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

const results = [
  await auditProfile(browser, "desktop", { viewport: { width: 1440, height: 900 } }, false),
  await auditProfile(
    browser,
    "mobile-slow4g",
    { ...devices["iPhone 13"] },
    true,
  ),
  await auditProfile(browser, "mobile", { ...devices["iPhone 13"] }, false),
];

await browser.close();

const report = {
  testedAt: new Date().toISOString(),
  baseUrl: BASE,
  results,
};

await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
