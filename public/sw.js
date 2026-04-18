const CACHE_NAME = 'myfittracker-vX';

// Файлы для предварительного кэширования
const PRECACHE_URLS = [
  './',
  './manifest.json',
  './all-exercises.json',
  './icon-192.png',
  './icon-512.png',
];

// Установка: предкэшируем ключевые ресурсы, сразу активируемся
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши, забираем клиентов
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

// Fetch стратегия:
// - Навигация (HTML): Network First — всегда свежая страница
// - Статика (JS/CSS/шрифты/картинки): Cache First — у них хеши в именах
// - Остальное: Cache First с фолбэком
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Навигация — Network First: сначала сеть, потом кеш
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Кэшируем свежий ответ
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Нет сети — отдаём из кеша
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./');
          });
        })
    );
    return;
  }

  // Статика с хешированными именами (_next/static/) — Cache First
  // Эти файлы никогда не меняются (хеш в имени), кеш надёжен
  if (url.pathname.startsWith('/') && (
    url.pathname.includes('/_next/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  )) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Всё остальное (JSON данные и пр.) — Stale While Revalidate:
  // отдаём из кеша сразу, но параллельно обновляем из сети
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
