import { chromium } from "playwright";
import fs from "fs";
/* Full-length stills of each demo, for the machine in the single-file
   artifact. A single file has no second page to point an iframe at, so the
   artifact's laptop screen shows these and makes them scrollable instead.
   Serve the site on :8765 first, then: node tools/demo-stills.mjs */
const OUT = new URL("./stills/", import.meta.url).pathname;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [page, out] of [
  ["demos/chess/index.html", "full-chess.jpg"],
  ["demos/barbers/index.html", "full-barbers.jpg"],
  ["demos/saltmarsh/index.html", "full-saltmarsh.jpg"]
]) {
  const ctx = await b.newContext({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:8765/" + page, { waitUntil: "load" });
  /* let every canvas paint and every reveal settle before the capture */
  await p.evaluate(async () => {
    /* The demos reveal on scroll and one of them sets scroll-behavior: smooth,
       so a still has to walk the whole page first or half of it captures at
       opacity 0. */
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 900));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 700));
  });
  await p.waitForTimeout(900);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.screenshot({ path: OUT + out, type: "jpeg", quality: 62, fullPage: true });
  console.log(out.padEnd(20), "1200x" + h, (fs.statSync(OUT + out).size / 1024).toFixed(0) + "KB");
  await ctx.close();
}
await b.close();
