import puppeteer from "puppeteer-core";
import fs from "node:fs";
const FPS = 30, DURATION = 18.2;
fs.rmSync("frames", { recursive: true, force: true }); fs.mkdirSync("frames");
const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await page.goto("file://" + process.cwd() + "/explainer.html", { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 500));
const total = Math.round(FPS * DURATION);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  await page.screenshot({ path: `frames/f${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 });
}
await browser.close();
console.log("frames", total);
