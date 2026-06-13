const CACHE_NAME = "gym-management-pwa-v1";
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// =========================
// Install Service Worker
// =========================
// Jab service worker first time install hota hai,
// hum important static files cache me save kar dete hain.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// =========================
// Activate Service Worker
// =========================
// Purana cache delete karta hai agar naya version aaye.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

// =========================
// Fetch Handler
// =========================
// Browser jab bhi koi GET request karega,
// service worker decide karega network se lena hai ya cache se.
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // POST/PUT/DELETE requests cache nahi karni
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API calls ko cache nahi karna
  // Gym dashboard data fresh backend se hi aana chahiye.
  if (url.pathname.startsWith("/api")) return;

  // Page navigation ke liye offline fallback
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Static files ke liye cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request);
    })
  );
});