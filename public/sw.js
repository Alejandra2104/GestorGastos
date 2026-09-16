/* Gestor de Gastos — Service Worker PWA (offline-first, multi-plataforma) */
const CACHE_VERSION = 'gestor-gastos-v1.3.0';
const STATIC_CACHE = CACHE_VERSION + '-static';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './app.js',
  './nube-config.js',
  './nube.js',
  './offline.html',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando ' + CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activado ' + CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('gestor-gastos-') && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Estrategia:
// - Navegación (HTML): network-first con fallback a cache y luego offline.html
// - CSS/JS/imágenes: stale-while-revalidate
// - API (/api/*): network-only (no cachear datos), con fallback silencioso
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo gestionar peticiones GET del mismo origen
  if (req.method !== 'GET') return;

  // No cachear API del backend (datos en vivo / localStorage como respaldo)
  if (url.pathname.startsWith('/api/')) return;

  // Navegación de páginas
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req) || await caches.match('./index.html');
          return cached || await caches.match('./offline.html');
        })
    );
    return;
  }

  // Estáticos: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        // Solo cachear respuestas válidas del mismo origen
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Permitir que la página fuerce la activación inmediata tras una actualización
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
