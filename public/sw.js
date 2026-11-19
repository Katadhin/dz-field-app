// Minimal service worker: makes the app installable and loads its shell offline.
// Captures are held in the page's own outbox (localStorage), not here.
const CACHE = "dz-field-shell-v2";
const SHELL = ["/", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never cache the save API.
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    // Only the capture home is kept for offline. Admin and other pages stay
    // live-only so a stale copy never overwrites the home shell.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (url.pathname === "/") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("/", copy));
          }
          return res;
        })
        .catch(() => (url.pathname === "/" ? caches.match("/") : Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
    )
  );
});
