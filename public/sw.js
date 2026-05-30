const CACHE_NAME = 'corner-table-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // HTML 頁面完全不快取，永遠從網路取得
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 只快取靜態資源（字體、圖片）
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          const cache = caches.open(CACHE_NAME);
          cache.then(c => c.put(event.request, fetchResponse.clone()));
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // 其他所有資源直接從網路取得，不快取
  event.respondWith(fetch(event.request));
});
