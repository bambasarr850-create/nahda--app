const CACHE_NAME = 'nahda-business-v1';
const ASSETS = [
  './nahda_business_app.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie : essaye le réseau (données à jour), retombe sur le cache si hors-ligne.
// Les appels vers script.google.com (API) ne sont jamais mis en cache : on veut toujours du frais.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('script.google.com')) return; // laisser passer, pas de cache sur l'API

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
