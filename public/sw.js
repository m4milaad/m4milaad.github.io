const VERSION = "v2";
const SHELL_CACHE = `site-shell-${VERSION}`;
const RUNTIME_CACHE = `site-runtime-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![SHELL_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(networkFirst(req, SHELL_CACHE));
    return;
  }

  const isDocument = req.mode === "navigate" || req.destination === "document";
  const isStaticAsset =
    ["style", "script", "worker", "font", "image"].includes(req.destination) ||
    /\.(?:js|css|mjs|map|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|ico|json|txt)$/i.test(
      url.pathname,
    );

  if (isDocument || isStaticAsset) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
  }
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Network unavailable and no cache match.");
  }
}