const CACHE_NAME = 'phw-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache basic assets so app opens offline
      // We don't precache Next.js _next/static JS here automatically 
      // as they have hashes, we let them be cached lazily below.
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Triage API MUST never be stale
  if (url.pathname === '/api/triage') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return explicit 503 so client knows we failed gracefully due to network
        return new Response(JSON.stringify({ error: "Offline" }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Static Assets (Next.js internals, images, CSS) -> Stale-While-Revalidate
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update cache in the background
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If network fails, just ignore and let it use cache (if we returned cachedResponse)
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
