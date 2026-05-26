const CACHE_NAME = 'corner-table-v1';
const urlsToCache = [
  '/',
  '/japan',
  '/travel',
  '/posts',
  '/ledger',
  '/polaroid',
  '/quotes'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
