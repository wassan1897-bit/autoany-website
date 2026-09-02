/**
 * Audits dynamic loading screen behavior — duration, asset readiness, post-load smoothness.
 * Run: node scripts/loading-audit.mjs
 * Requires dev server at http://localhost:5173
 */
import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.AUDIT_URL ?? "http://localhost:5173";
const OUT = path.resolve("test-screenshots/loading-audit");

async function auditViewport(browser, label, contextOptions) {
  const context = await browser.newContext({
    ...contextOptions,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const timeline = [];
  const log = (event, extra = {}) => {
    timeline.push({ t: Date.now(), event, ...extra });
  };

  log("navigate_start");
  await page.goto(BASE, { waitUntil: "commit" });

  // Loader visible
  const loader = page.locator('[aria-label="Loading"]');
  await loader.waitFor({ state: "visible", timeout: 10000 });
  log("loader_visible");
  await page.screenshot({
    path: path.join(OUT, `${label}-01-loader.png`),
    fullPage: false,
  });

  const loaderStart = Date.now();
  let lastCount = "000";

  // Poll counter while loader runs
  while (await loader.isVisible().catch(() => false)) {
    const count = await page
      .locator(".tabular-nums")
      .last()
      .textContent()
      .catch(() => lastCount);
    if (count && count !== lastCount) {
      lastCount = count;
      log("loader_count", { count });
    }
    await page.waitForTimeout(120);
    if (Date.now() - loaderStart > 8000) break;
  }

  const loaderDurationMs = Date.now() - loaderStart;
  log("loader_hidden", { loaderDurationMs });

  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, `${label}-02-after-loader.png`),
    fullPage: false,
  });

  // Check Spline canvas exists and is visible
  const splineCanvas = page.locator(".nk-spline canvas");
  const splineVisible = await splineCanvas
    .isVisible({ timeout: 5000 })
    .catch(() => false);
  log("spline_visible", { splineVisible });

  // Check hero heading visible without ghost text
  const heading = page.locator("h1.nk-heading");
  await heading.waitFor({ state: "visible", timeout: 5000 });
  log("hero_heading_visible");

  // Quick scroll jank probe — measure frame time over 1s scroll
  const scrollMetrics = await page.evaluate(async () => {
    const samples = [];
    let raf = 0;
    const start = performance.now();
    const sample = (now) => {
      samples.push(now);
      if (now - start < 1000) raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    window.scrollBy({ top: 400, behavior: "auto" });
    await new Promise((r) => setTimeout(r, 1100));
    cancelAnimationFrame(raf);
    const deltas = samples.slice(1).map((t, i) => t - samples[i]);
    const avg = deltas.length
      ? deltas.reduce((a, b) => a + b, 0) / deltas.length
      : 0;
    const max = deltas.length ? Math.max(...deltas) : 0;
    const fps = avg > 0 ? Math.round(1000 / avg) : 0;
    return { fps, maxFrameMs: Math.round(max), frames: deltas.length };
  });
  log("scroll_probe", scrollMetrics);

  await page.screenshot({
    path: path.join(OUT, `${label}-03-after-scroll.png`),
    fullPage: false,
  });

  await context.close();

  return {
    label,
    loaderDurationMs,
    splineVisible,
    scrollMetrics,
    timeline,
  };
}

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

const desktop = await auditViewport(browser, "desktop", {
  viewport: { width: 1440, height: 900 },
});

const mobile = await auditViewport(browser, "mobile", {
  ...devices["iPhone 13"],
});

await browser.close();

const report = {
  testedAt: new Date().toISOString(),
  baseUrl: BASE,
  desktop,
  mobile,
  notes: {
    minLoaderMs: 1800,
    maxLoaderMs: 5000,
    strategy: "Wait for critical assets (Spline onLoad, images, fonts, chunks) with min/max caps",
  },
};

await writeFile(
  path.join(OUT, "report.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
