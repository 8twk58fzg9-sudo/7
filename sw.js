const CACHE = "computrax-v20260709-slovak-compact3";
const CORE = ["/", "/index.html", "/config.js", "/site-enhancements.js", "/site-hardened.js", "/site-9.js", "/site-overrides.js", "/site-deploy-fix.js", "/computrax-logo.png", "/favicon-32.png", "/offline.html", "/site.webmanifest"];
const SPLIT_ASSETS = ["/assets/css/admin-1.css", "/assets/css/admin-2.css", "/assets/css/admin-3.css", "/assets/css/doprava-a-vratenie-1.css", "/assets/css/garancia-1.css", "/assets/css/herne-pc-1.css", "/assets/css/index-1.css", "/assets/css/informacie-html-1.css", "/assets/css/kancelarske-pc-1.css", "/assets/css/kontakt-1.css", "/assets/css/lacne-pc-1.css", "/assets/css/offline-html-1.css", "/assets/css/pocitace-pre-firmy-a-skoly-1.css", "/assets/css/poradna-ako-spoznat-dobry-repas-1.css", "/assets/css/poradna-ako-vybrat-repasovane-pc-1.css", "/assets/css/poradna-bezpecny-nakup-repasovaneho-pc-1.css", "/assets/css/poradna-herny-pc-do-500-eur-1.css", "/assets/css/poradna-pc-pre-firmy-a-skoly-1.css", "/assets/css/poradna-repasovane-pc-vs-nove-pc-1.css", "/assets/css/pravne-html-1.css", "/assets/css/preco-computrax-1.css", "/assets/css/produkt-alienware-aurora-r14-1.css", "/assets/css/produkt-dell-optiplex-7090-1.css", "/assets/css/produkt-hp-omen-40l-1.css", "/assets/css/recenzie-1.css", "/assets/css/repasovane-herne-pc-1.css", "/assets/css/repasovane-pc-1.css", "/assets/css/repasovane-pc-pre-podnikatelov-1.css", "/assets/css/repasovane-pc-pre-studentov-1.css", "/assets/css/repasovane-pocitace-so-zarukou-1.css", "/assets/css/testovanie-1.css", "/assets/js/admin-1-1.js", "/assets/js/admin-2-1.js", "/assets/js/index-1-1.js", "/assets/js/index-2-1.js", "/assets/js/performance-polish.js", "/assets/js/pravne-html-1.js"];
const PRECACHE = Array.from(new Set([...CORE, ...SPLIT_ASSETS]));
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => undefined));
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
    const copy = res.clone();
    caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
    return res;
  }).catch(() => caches.match(req).then((cached) => cached || caches.match("/offline.html"))));
});
