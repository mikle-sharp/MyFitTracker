const CACHE_NAME = 'myfittracker-v1';

// Файлы для предварительного кэширования
const PRECACHE_URLS = [
  './',
  './manifest.json',
  './all-exercises.json',
  './icon-192.png',
  './icon-512.png',
];

// Установка: предкэшируем ключевые ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши
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

// Fetch: сначала кэш, потом сеть (Cache First для статики)
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;

  // Пропускаем chrome-extension и другие не-http(s) запросы
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Кэшируем только успешные ответы
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Если нет сети и нет кэша — возвращаем офлайн-страницу для навигации
        if (event.request.mode === 'navigate') {
          return caches.match('./');
        }
        return undefined;
      });
    })
  );
});
