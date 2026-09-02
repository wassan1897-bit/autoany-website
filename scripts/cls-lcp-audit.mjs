/**
 * LCP + CLS audit with 6x CPU throttling (matches DevTools Performance preset).
 * Usage: node scripts/cls-lcp-audit.mjs [url]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] ?? process.env.AUDIT_URL ?? "https://www.autoany.io";
const OUT = path.resolve("test-screenshots/cls-lcp-audit");
const CPU_RATE = Number(process.env.CPU_THROTTLE ?? 6);
const OBSERVE_MS = Number(process.env.OBSERVE_MS ?? 15000);

const INIT_SCRIPT = ({ observeMs }) => {
  window.__aaMetrics = {
    cls: 0,
    shifts: [],
    lcpMs: null,
    lcpElement: null,
    longTasksMs: 0,
  };

  const poShift = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__aaMetrics.cls += entry.value;
      window.__aaMetrics.shifts.push({
        value: entry.value,
        time: entry.startTime,
        sources: (entry.sources ?? []).map((s) => ({
          node:
            (s.node?.tagName ?? "unknown") +
            (s.node?.id ? `#${s.node.id}` : "") +
            (s.node?.className
              ? `.${String(s.node.className).split(" ").slice(0, 2).join(".")}`
              : ""),
          prev: s.previousRect
            ? {
                w: Math.round(s.previousRect.width),
                h: Math.round(s.previousRect.height),
              }
            : null,
          curr: s.currentRect
            ? {
                w: Math.round(s.currentRect.width),
                h: Math.round(s.currentRect.height),
              }
            : null,
        })),
      });
    }
  });
  poShift.observe({ type: "layout-shift", buffered: true });

  const poLcp = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const last = entries.at(-1);
    if (!last) return;
    window.__aaMetrics.lcpMs = Math.round(last.startTime);
    const el = last.element;
    window.__aaMetrics.lcpElement = el
      ? {
          tag: el.tagName,
          id: el.id || null,
          className: String(el.className || "").slice(0, 80),
        }
      : null;
  });
  poLcp.observe({ type: "largest-contentful-paint", buffered: true });

  const poLong = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__aaMetrics.longTasksMs += entry.duration;
    }
  });
  try {
    poLong.observe({ type: "longtask", buffered: true });
  } catch {
    /* unsupported */
  }

  window.__aaMetricsDone = new Promise((resolve) => {
    setTimeout(resolve, observeMs);
  });
};

async function collect(page) {
  return page.evaluate(async () => {
    await window.__aaMetricsDone;
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((e) => e.name === "first-contentful-paint");
    const loaderMs = (() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return nav ? Math.round(nav.domContentLoadedEventEnd) : null;
    })();

    return {
      cls: Number(window.__aaMetrics.cls.toFixed(4)),
      lcpMs: window.__aaMetrics.lcpMs,
      fcpMs: fcp ? Math.round(fcp.startTime) : null,
      domContentLoadedMs: loaderMs,
      longTasksMs: Math.round(window.__aaMetrics.longTasksMs),
      lcpElement: window.__aaMetrics.lcpElement,
      topShifts: [...window.__aaMetrics.shifts]
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      splineCanvas: !!document.querySelector(".nk-spline canvas"),
      splineStopped: (() => {
        const canvas = document.querySelector(".nk-spline canvas");
        return canvas ? getComputedStyle(canvas).visibility === "hidden" : null;
      })(),
      effectQuality: document.documentElement.dataset.effectQuality ?? null,
    };
  });
}

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await context.addInitScript(INIT_SCRIPT, { observeMs: OBSERVE_MS });
const page = await context.newPage();
const session = await context.newCDPSession(page);
await session.send("Emulation.setCPUThrottlingRate", { rate: CPU_RATE });

const navStart = Date.now();
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
const metrics = await collect(page);

const report = {
  testedAt: new Date().toISOString(),
  url: BASE,
  cpuThrottle: CPU_RATE,
  observeMs: OBSERVE_MS,
  navMs: Date.now() - navStart,
  ...metrics,
};

const slug = BASE.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
await writeFile(
  path.join(OUT, `${slug || "site"}.json`),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
await browser.close();
