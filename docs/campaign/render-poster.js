// Render the Delhi Cantt posters to public/campaign at exact pixel sizes.
// Usage: node docs/campaign/render-poster.js
// Requires: playwright (chromium) + qrcode. Injects the real light wordmark and
// a QR to the UTM share URL into docs/campaign/delhi-cantt-poster.template.html.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const QR = require("qrcode");

const ROOT = path.resolve(__dirname, "../..");
const TPL = path.join(__dirname, "delhi-cantt-poster.template.html");
const OUT = path.join(ROOT, "public/campaign");
const SHARE_URL = "https://musicphonetics.com/delhi-cantt?utm_source=whatsapp&utm_medium=society_group&utm_campaign=delhi_cantt_launch&utm_content=poster";

(async () => {
  const logo = "data:image/webp;base64," + fs.readFileSync(path.join(ROOT, "public/logo-wordmark-light.webp")).toString("base64");
  const qr = await QR.toDataURL(SHARE_URL, { margin: 1, scale: 14, color: { dark: "#161B26FF", light: "#FFFFFFFF" }, errorCorrectionLevel: "M" });
  let html = fs.readFileSync(TPL, "utf8").split("__LOGO_LIGHT__").join(logo).split("__QR__").join(qr);
  const tmp = path.join(require("os").tmpdir(), "mp-cantt-poster.html");
  fs.writeFileSync(tmp, html);

  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] })
    .catch(async () => await chromium.launch({ args: ["--no-sandbox"] }));
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.goto("file://" + tmp, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  fs.mkdirSync(OUT, { recursive: true });
  const map = { portrait: "delhi-cantt-poster-1080x1350.png", square: "delhi-cantt-poster-1080x1080.png", og: "delhi-cantt-og-1200x630.png" };
  for (const [id, name] of Object.entries(map)) {
    await (await page.$("#" + id)).screenshot({ path: path.join(OUT, name) });
  }
  await browser.close();
  fs.copyFileSync(path.join(OUT, "delhi-cantt-og-1200x630.png"), path.join(ROOT, "public/og-delhi-cantt.png"));
  console.log("Rendered posters + OG to public/.");
})();
