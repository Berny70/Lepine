<<<<<<< HEAD
const CACHE_NAME = "lepine-v1.0.5";

self.addEventListener("install", event => {
  self.skipWaiting(); // ⚡ active immédiatement la nouvelle version
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        "/Lepine/",
        "/Lepine/index.html",
        "/Lepine/app.js",
        "/Lepine/style.css",
        "/Lepine/manifest.json"
      ])
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // 👈 prend le contrôle sans attendre
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
=======
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
>>>>>>> 3be43c2f175881422c2b7841d405a2952a9c5e9b
});
