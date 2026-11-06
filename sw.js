// Generated application files only. No microphone, user records, or external requests.
const VERSION = "0.6.0";
const CACHE = "conference-demo-files-5fb57dcecaca5affe427";
const PREFIX = 'conference-demo-files-';
// The app may be served from / (USB) or from a folder such as /repo/ (GitHub Pages).
const BASE = new URL('./', self.location.href).pathname;
const ASSETS = ["/assets/index-BV_orHaf.css","/assets/index-BtJZKV9v.js","/assets/word-export-CmaMLm7o.js","/icons/app-192.png","/icons/app-512.png","/index.html","/manifest.webmanifest"].map(path => BASE + path.slice(1));
const allowed = new Set(ASSETS);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(ASSETS.map(path => new Request(path, { cache: 'reload' })));
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  // Keep earlier file caches: an already-open tab may still need its old Word chunk.
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== self.location.origin || url.pathname === BASE + 'sw.js') return;
  const path = url.pathname === BASE ? BASE + 'index.html' : url.pathname;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (allowed.has(path)) {
      const response = await cache.match(path);
      if (response) return response;
    }
    // Old cached asset files are readable only within this app's namespace.
    // Never serve old HTML as the current app after an incomplete preparation.
    if (path.startsWith(BASE + 'assets/')) {
      for (const name of await caches.keys()) {
        if (!name.startsWith(PREFIX) || name === CACHE) continue;
        const response = await (await caches.open(name)).match(path);
        if (response) return response;
      }
    }
    return new Response('Application file is unavailable. Connect to the network and reload.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'CHECK_DEMO_FILES' || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const ready = (await Promise.all(ASSETS.map(path => cache.match(path)))).every(Boolean);
      event.ports[0].postMessage({ ready, version: VERSION });
    } catch {
      event.ports[0].postMessage({ ready: false, version: VERSION });
    }
  })());
});
