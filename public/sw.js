// Service Worker для PWA Nur-Kitep
const CACHE_NAME = 'nur-kitep-v1';
const OFFLINE_URL = '/offline';

// Ресурсы для кеширования при установке
const STATIC_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logonur.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Установка Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Кеширование статических ресурсов');
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch обработчик - Network First для HTML, Cache First для остального
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем запросы к API, chrome-extension, и другим доменам
  if (
    url.origin !== location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Только GET запросы
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Если есть в кеше и это не HTML, возвращаем из кеша
      if (cachedResponse && !request.headers.get('accept')?.includes('text/html')) {
        return cachedResponse;
      }

      // Пытаемся получить из сети
      return fetch(request)
        .then((response) => {
          // Проверяем валидность ответа
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Клонируем ответ для кеша
          const responseToCache = response.clone();

          // Кешируем ответ
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Если сеть недоступна, возвращаем из кеша или offline страницу
          if (cachedResponse) {
            return cachedResponse;
          }

          // Для HTML страниц возвращаем offline страницу
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// Обработчик сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
