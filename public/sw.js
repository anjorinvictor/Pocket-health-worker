/**
 * Pocket Health Worker — Service Worker (offline-first PWA shell)
 *
 * Strategy:
 *  - App shell + known static assets are precached on install (cache-first).
 *  - Next.js hashed chunks / CSS / images are cached lazily via stale-while-revalidate,
 *    so after ONE online load the whole UI keeps working with NO network: the body map,
 *    the offline deterministic triage engine, the 12-state PHC directory, and the
 *    emergency bridge are all client-side, so nothing else needs to be fetched.
 *  - Page navigations fall back to the cached app shell ("/"), so an offline refresh
 *    still boots the app.
 *  - The Gemini triage API is NEVER cached — it is network-only so we never serve a
 *    stale AI answer. When offline the client falls back to the deterministic engine
 *    BEFORE it ever calls the network, so this route simply fails fast and clean.
 */

const CACHE_NAME = 'phw-cache-v3';

// Assets we know exist at build time. Next.js content-hashed chunks under
// /_next/static are cached lazily on first load (see stale-while-revalidate below).
const APP_SHELL = ['/', '/manifest.json', '/icon.svg', '/favicon.ico'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // allSettled so one unavailable asset can't abort the whole precache
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: serve from cache immediately, refresh in the background.
function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => {
        // Only cache successful, same-origin ("basic") responses.
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET responses are cacheable. Let POST (the triage call) pass straight
  // through to the network untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Gemini triage API — network-only, never cached (no stale AI answers).
  if (url.pathname === '/api/triage') {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );
    return;
  }

  // 2. Page navigations — serve the app shell so an offline refresh still boots.
  if (request.mode === 'navigate') {
    event.respondWith(
      staleWhileRevalidate(request)
        .then((response) => response || caches.match('/'))
        .catch(() => caches.match('/'))
    );
    return;
  }

  // 3. Everything else same-origin (JS chunks, CSS, fonts, images) — SWR.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
