const CACHE_NAME = 'kaung-thant-pos-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// 1. Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Fetch Event: Cache-First Strategy for Assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    // Network-first for API calls
    event.respondWith(
      fetch(request).catch(() => {
        // If network fails, we'll handle specific API actions (like checkout) in the frontend via IndexedDB
        return caches.match(request);
      })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
  }
});

// 3. Sync Event: Sync pending transactions when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncSales());
  }
});

async function syncSales() {
  // Logic to read from IndexedDB and POST to /api/sales/checkout
  console.log('[SW] Syncing pending sales...');
}
