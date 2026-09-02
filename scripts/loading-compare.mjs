/**
 * Compare loading behavior: production (before) vs local (after).
 */
import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("test-screenshots/loading-audit");

async function measure(url, label, contextOptions) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const start = Date.now();
  await page.goto(url, { waitUntil: "commit" });

  const loader = page.locator('[aria-label="Loading"]');
  let loaderSeen = false;
  try {
    await loader.waitFor({ state: "visible", timeout: 8000 });
    loaderSeen = true;
    await page.screenshot({
      path: path.join(OUT, `${label}-loader.png`),
    });
  } catch {
    /* no loader */
  }

  if (loaderSeen) {
    await loader.waitFor({ state: "hidden", timeout: 12000 });
  }

  const loaderDurationMs = Date.now() - start;
  await page.waitForTimeout(1500);

  const splineVisible = await page
    .locator(".nk-spline canvas")
    .isVisible({ timeout: 8000 })
    .catch(() => false);

  await page.screenshot({
    path: path.join(OUT, `${label}-hero.png`),
  });

  const scrollMetrics = await page.evaluate(async () => {
    const samples = [];
    let raf = 0;
    const t0 = performance.now();
    const sample = (t) => {
      samples.push(t);
      if (t - t0 < 1000) raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    window.scrollBy({ top: 500, behavior: "auto" });
    await new Promise((r) => setTimeout(r, 1100));
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

  await browser.close();

  return { label, url, loaderSeen, loaderDurationMs, splineVisible, scrollMetrics };
}

await mkdir(OUT, { recursive: true });

const results = await Promise.all([
  measure("https://www.autoany.io", "prod-desktop", {
    viewport: { width: 1440, height: 900 },
  }),
  measure("http://localhost:5173", "local-desktop", {
    viewport: { width: 1440, height: 900 },
  }),
  measure("https://www.autoany.io", "prod-mobile", {
    ...devices["iPhone 13"],
  }),
  measure("http://localhost:5173", "local-mobile", {
    ...devices["iPhone 13"],
  }),
]);

const comparison = { testedAt: new Date().toISOString(), results };
await writeFile(path.join(OUT, "comparison.json"), JSON.stringify(comparison, null, 2));
console.log(JSON.stringify(comparison, null, 2));
