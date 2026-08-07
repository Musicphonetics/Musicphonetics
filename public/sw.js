// Musicphonetics — offline shell service worker.
// NETWORK-FIRST for everything on our origin (navigations AND assets), with the
// cache only as an offline fallback. This is deliberate: content-hashed JS/CSS
// chunks change on every deploy, and a cache-first strategy could serve a stale
// HTML/chunk that no longer exists after a new build, which crashes the app with
// "a client-side exception". Network-first means every visit gets the fresh build;
// the cache is used only when the network is unavailable. Supabase/API traffic is
// never touched, so records stay live and private.
const SHELL = "mp-shell-v4";
const SHELL_URLS = ["/", "/parent/login", "/teacher/login", "/offline.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_URLS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Only handle our OWN origin. Cross-origin (Razorpay, YouTube, Supabase, fonts)
  // goes straight to the network.
  if (url.origin !== self.location.origin) return;

  // Never touch Supabase / API traffic — always live.
  if (url.hostname.endsWith("supabase.co") || url.pathname.startsWith("/api/")) return;

  // Navigations: network-first, fall back to cache, then the offline shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/offline.html")))
    );
    return;
  }

  // Static assets: network-first too, so a fresh deploy's chunks are always used;
  // fall back to cache only when offline.
  if (["style", "script", "image", "font"].includes(req.destination)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
