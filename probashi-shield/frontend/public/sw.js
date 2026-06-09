// Minimal service worker so the app is installable and loads its shell offline.
const CACHE = "probashi-shield-v1";
const SHELL = ["/", "/safety", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => undefined));
  self.skipWaiting();
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
  const { request } = event;
  // Only handle same-origin GET navigations/assets; never cache API calls.
  if (request.method !== "GET" || request.url.includes("/api/")) return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});
