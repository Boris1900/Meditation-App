const CACHE_NAME = 'meditation-v1.40';

const CACHE_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './background.jpg',
  './background_lächeln_v0.3.jpg',
  './gong.png',
  './icon-1024.png',
  './Sounds/Klangschale Morgenstern.mp3',
  './Sounds/Klangschale Mittagspause.mp3',
  './Sounds/Klangschale Abendrot.mp3',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Update-Check-Button: Netzwerk zuerst, dann Cache aktualisieren
  if (event.request.cache === 'reload') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Alle anderen Anfragen: Cache zuerst, Netzwerk als Fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
