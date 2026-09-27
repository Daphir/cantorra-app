/**
 * ==========================================================================
 * Garden Can Torra (Fundat el 1948) - PWA
 * Service Worker: sw.js
 * 
 * Funcionalidades:
 * - Funcionamiento sin conexión (Modo Offline) para toda la aplicación.
 * - Pre-cacheo del App Shell (HTML, CSS, JS, Manifest, CDNs y Fuentes).
 * - Estrategia Network-First con fallback a caché para Google Sheets (catálogo).
 * - Estrategia Cache-First para recursos estáticos y fuentes.
 * - Limpieza automática de versiones anteriores de caché en la activación.
 * ==========================================================================
 */

const CACHE_NAME = 'cantorra-pwa-v1.0';
const DATA_CACHE_NAME = 'cantorra-data-v1.0';

// Recursos esenciales que forman el App Shell offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap'
];

/**
 * 1. Evento INSTALL: Pre-cachear el App Shell
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-cachejant App Shell estàtic...');
        // addAll con captura individual para evitar que un fallo externo bloquee la instalación
        return Promise.allSettled(
          STATIC_ASSETS.map((asset) => {
            return cache.add(asset).catch((err) => {
              console.warn(`[Service Worker] No s'ha pogut pre-cachejar: ${asset}`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * 2. Evento ACTIVATE: Limpieza de cachés antiguas y toma de control
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[Service Worker] Esborrant memòria cau antiga:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * 3. Evento FETCH: Enrutamiento de peticiones según su tipología
 */
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // A. Peticiones a Google Sheets CSV (Datos dinámicos del Catálogo):
  // Estrategia: Network-First con fallback a caché (si no hay internet, devuelve la última versión guardada)
  if (requestUrl.hostname.includes('docs.google.com') || requestUrl.pathname.endsWith('.csv') || requestUrl.search.includes('output=csv')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Si la respuesta es válida, clonamos y actualizamos la caché de datos
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si estamos sin conexión (offline), servir los datos desde la caché
          console.log('[Service Worker] Sense connexió. Servint dades de Google Sheets des de la memòria cau.');
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Respuesta de contingencia vacía si no hubiera datos cacheados
            return new Response('Nombre,Categoría,Subcategoría,Marca,Precio,Descripción,SKU,Código de Barras,Imagen,Stock\n', {
              headers: { 'Content-Type': 'text/csv; charset=utf-8' }
            });
          });
        })
    );
    return;
  }

  // B. Navegación principal (páginas HTML):
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // C. Recursos estáticos, scripts, estilos, fuentes e imágenes:
  // Estrategia: Cache-First con fallback a red y guardado dinámico
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            // Guardar en caché solo peticiones GET válidas
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              event.request.method !== 'GET'
            ) {
              return networkResponse;
            }

            // Clonar respuesta y guardar en caché para futuras visitas offline
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            // Si falla una imagen offline, servir imagen de reserva si es posible
            if (event.request.destination === 'image') {
              console.warn('[Service Worker] Imatge no disponible en mode offline:', event.request.url);
            }
            throw error;
          });
      })
  );
});
