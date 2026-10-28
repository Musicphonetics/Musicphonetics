// Minimal static file server for the exported `out/` directory, resolving clean
// URLs the way Cloudflare Pages does (try `<path>.html`, then `<path>/index.html`,
// then serve `404.html` with a 404). Used only by the Playwright harness so tests
// run against the real production build. No dependencies.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const ROOT = join(process.cwd(), "out");
const PORT = Number(process.env.E2E_PORT || 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

async function tryFile(p) {
  try { const s = await stat(p); if (s.isFile()) return p; } catch { /* no */ }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let rel = decodeURIComponent(url.pathname);
  if (rel.includes("..")) { res.writeHead(400).end("Bad request"); return; }
  rel = normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");

  const base = join(ROOT, rel);
  const candidates = rel.endsWith("/")
    ? [join(base, "index.html")]
    : [base, base + ".html", join(base, "index.html")];

  let file = null;
  for (const c of candidates) { file = await tryFile(c); if (file) break; }

  if (!file) {
    const nf = await tryFile(join(ROOT, "404.html"));
    if (nf) { const body = await readFile(nf); res.writeHead(404, { "content-type": "text/html; charset=utf-8" }); res.end(body); }
    else res.writeHead(404).end("Not found");
    return;
  }

  const body = await readFile(file);
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(body);
});

server.listen(PORT, () => console.log(`static-server: serving ./out on http://127.0.0.1:${PORT}`));
