const CACHE = "computrax-deploy-v20260708-95";
const CORE = ["./", "./index.html", "./config.js", "./site-enhancements.js", "./site-hardened.js", "./site-9.js", "./site-deploy-fix.js", "./computrax-logo.png", "./favicon-32.png", "./offline.html", "./site.webmanifest"];
const SPLIT_ASSETS = [
  "./assets/css/admin-1.css", "./assets/css/admin-2.css", "./assets/css/admin-3.css", "./assets/css/index-1.css",
  "./assets/js/admin-1-1.js", "./assets/js/admin-2-1.js", "./assets/js/index-1-1.js", "./assets/js/index-2-1.js", "./assets/js/performance-polish.js"
];
const PRECACHE = Array.from(new Set([...CORE, ...SPLIT_ASSETS]));
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url)))).catch(() => undefined));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  event.respondWith(fetch(req).then((res) => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
    }
    return res;
  }).catch(() => caches.match(req).then((cached) => cached || caches.match("./offline.html"))));
});
