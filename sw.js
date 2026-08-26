const CACHE_NAME = 'planka-guide-v68-cache';
const STATIC_ASSETS = [
  './',
  './index.html',
  './venues.json',
  './manifest.json',
  './assets/photos/bushe_1.webp',
  './assets/photos/bushe_2.webp',
  './assets/photos/bushe_3.webp',
  './assets/photos/cafe_pushkin_1.webp',
  './assets/photos/cafe_pushkin_2.webp',
  './assets/photos/cafe_pushkin_3.webp',
  './assets/photos/coffeemania_1.webp',
  './assets/photos/coffeemania_2.webp',
  './assets/photos/coffeemania_3.webp',
  './assets/photos/duo_gastrobar_1.webp',
  './assets/photos/duo_gastrobar_2.webp',
  './assets/photos/duo_gastrobar_3.webp',
  './assets/photos/el_copitas_1.webp',
  './assets/photos/el_copitas_2.webp',
  './assets/photos/el_copitas_3.webp',
  './assets/photos/engels_1.webp',
  './assets/photos/engels_2.webp',
  './assets/photos/engels_3.webp',
  './assets/photos/gastroli_1.webp',
  './assets/photos/gastroli_2.webp',
  './assets/photos/gastroli_3.webp',
  './assets/photos/ku_ramen_1.webp',
  './assets/photos/ku_ramen_2.webp',
  './assets/photos/ku_ramen_3.webp',
  './assets/photos/soyka_1.webp',
  './assets/photos/soyka_2.webp',
  './assets/photos/soyka_3.webp',
  './assets/photos/white_rabbit_1.webp',
  './assets/photos/white_rabbit_2.webp',
  './assets/photos/white_rabbit_3.webp',
  './assets/videos/bushe.mp4',
  './assets/videos/cafe_pushkin.mp4',
  './assets/videos/coffeemania.mp4',
  './assets/videos/duo_gastrobar.mp4',
  './assets/videos/el_copitas.mp4',
  './assets/videos/engels.mp4',
  './assets/videos/gastroli.mp4',
  './assets/videos/ku_ramen.mp4',
  './assets/videos/soyka.mp4',
  './assets/videos/test.mp4',
  './assets/videos/white_rabbit.mp4',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW cache notice:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.hostname.includes('tile') || url.hostname.includes('cartocdn')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
