const SHELL_CACHE = 'noor-quran-shell-v6';
const DATA_CACHE = 'noor-quran-data-v6';
const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_URLS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Preserve downloaded Quran data across app-shell updates.
    await Promise.all(keys.filter(k => k.startsWith('noor-quran-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'api.aladhan.com') {
    event.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      // If offline, always try all existing app caches, including data saved by the download button.
      if (!self.navigator?.onLine) {
        const saved = await cache.match(req) || await cache.match(url.href);
        if (saved) return saved;
        const all = await caches.keys();
        for (const name of all) {
          if (name === DATA_CACHE) continue;
          const c = await caches.open(name);
          const hit = await c.match(req) || await c.match(url.href);
          if (hit) return hit;
        }
        return offlineResponse();
      }
      try {
        const response = await fetch(req);
        if (response && response.ok) await cache.put(req, response.clone());
        return response;
      } catch (err) {
        const saved = await cache.match(req) || await cache.match(url.href);
        if (saved) return saved;
        const all = await caches.keys();
        for (const name of all) {
          if (name === DATA_CACHE) continue;
          const c = await caches.open(name);
          const hit = await c.match(req) || await c.match(url.href);
          if (hit) return hit;
        }
        return offlineResponse();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    try {
      const response = await fetch(req);
      if (response && response.ok && (url.origin === self.location.origin || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com'))) {
        await cache.put(req, response.clone());
      }
      return response;
    } catch (err) {
      const saved = await cache.match(req) || await cache.match('/index.html') || await cache.match('/');
      if (saved) return saved;
      return new Response('أنت دون اتصال بالإنترنت. افتح الموقع مرة أثناء الاتصال ليتم حفظه.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});

function offlineResponse() {
  return new Response(JSON.stringify({ code: 503, status: 'OFFLINE', message: 'هذه البيانات غير محفوظة على الجهاز. اتصل بالإنترنت ونزّل المحتوى مرة أخرى.' }), {
    status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });


