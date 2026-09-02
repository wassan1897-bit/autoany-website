/**
 * Before/after performance comparison: production vs local preview.
 */
import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("test-screenshots/perf-audit");

async function measure(url, label, contextOptions, throttle = false) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  if (throttle) {
    const session = await context.newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    });
  }

  const t0 = Date.now();
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });

  const loaderMs = await page.evaluate(async () => {
    const loader = document.querySelector('[aria-label="Loading"]');
    if (!loader) return 0;
    const start = performance.now();
    return new Promise((resolve) => {
      const tick = () => {
        if (!document.querySelector('[aria-label="Loading"]')) {
          resolve(Math.round(performance.now() - start));
          return;
        }
        if (performance.now() - start > 12000) {
          resolve(-1);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });

  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance
      .getEntriesByType("paint")
      .find((e) => e.name === "first-contentful-paint");
    const resources = performance.getEntriesByType("resource");
    const transfer = resources.reduce(
      (sum, r) => sum + (r.transferSize || 0),
      0,
    );
    return {
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
      fcpMs: fcp ? Math.round(fcp.startTime) : null,
      transferKb: Math.round(transfer / 1024),
      spline: !!document.querySelector(".nk-spline canvas"),
      quality: document.documentElement.dataset.effectQuality ?? "n/a",
    };
  });

  await page.screenshot({ path: path.join(OUT, `${label}.png`) });
  await browser.close();

  return {
    label,
    url,
    totalNavMs: Date.now() - t0,
    loaderMs,
    ...metrics,
    throttled: throttle,
  };
}

await mkdir(OUT, { recursive: true });

const cases = [
  ["prod-desktop", "https://www.autoany.io", { viewport: { width: 1440, height: 900 } }, false],
  ["after-desktop", "http://localhost:4173", { viewport: { width: 1440, height: 900 } }, false],
  ["prod-mobile-slow", "https://www.autoany.io", { ...devices["iPhone 13"] }, true],
  ["after-mobile-slow", "http://localhost:4173", { ...devices["iPhone 13"] }, true],
];

const results = [];
for (const [label, url, opts, throttle] of cases) {
  results.push(await measure(url, label, opts, throttle));
}

const report = { testedAt: new Date().toISOString(), results };
await writeFile(path.join(OUT, "before-after.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
