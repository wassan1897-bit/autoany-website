import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto("http://localhost:5173", { waitUntil: "commit" });
const loader = page.locator('[aria-label="Loading"]');
await loader.waitFor({ state: "visible" });

const t0 = Date.now();
const timings = await page.evaluate(() => {
  return new Promise((resolve) => {
    const start = performance.now();
    const check = () => {
      const loader = document.querySelector('[aria-label="Loading"]');
      if (!loader) {
        resolve({ hiddenAfterMs: performance.now() - start });
        return;
      }
      if (performance.now() - start > 15000) {
        resolve({ hiddenAfterMs: -1, stillVisible: true });
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
});

console.log("Wall clock:", Date.now() - t0, "ms");
console.log("In-page:", timings);

await browser.close();
