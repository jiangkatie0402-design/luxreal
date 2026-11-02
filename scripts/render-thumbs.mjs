// Captures pre-rendered thumbnails from the dev-only /dev/thumbs page.
// Usage: npm run dev (port 3000), then: node scripts/render-thumbs.mjs [baseUrl]
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const base = process.argv[2] ?? 'http://localhost:3000';
const out = path.resolve(new URL('../public/thumbs', import.meta.url).pathname);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
await page.goto(`${base}/zh/dev/thumbs`, { waitUntil: 'load', timeout: 120000 });
await page.addStyleTag({
  content: 'header,nextjs-portal{display:none!important} html,body{background:transparent!important}',
});
await page.waitForSelector('[data-thumb] canvas');
await page.waitForTimeout(6000);
const keys = await page.$$eval('[data-thumb]', (els) =>
  els.map((e) => e.getAttribute('data-thumb')),
);
for (const key of keys) {
  const el = page.locator(`[data-thumb="${key}"]`);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await el.screenshot({ path: path.join(out, `${key}.png`), omitBackground: true });
  console.log('rendered', key);
}
await browser.close();
