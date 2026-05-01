const CACHE = "nexus-blog-v1";
const STATIC_CACHE = "nexus-static-v1";

// Assets to pre-cache on install — Next.js chunk URLs
const PRECACHE = [
  "/",
  "/home",
  "/posts",
  "/about",
];

// Install: pre-cache key pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip authenticated pages
  if (url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/settings") ||
      url.pathname.startsWith("/my-posts") ||
      url.pathname.startsWith("/my-bookmarks") ||
      url.pathname.startsWith("/posts/new") ||
      url.pathname.startsWith("/auth/login") ||
      url.pathname.startsWith("/auth/register")) {
    return;
  }

  // Skip API calls
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first
  if (url.pathname.startsWith("/_next/static") || url.pathname.match(/\.(woff2?|ico|svg|css|js)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages: network-first with cache fallback
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback: redirect to home
    const home = await caches.match("/home");
    if (home) return home;
    return new Response("Offline", { status: 503 });
  }
}
