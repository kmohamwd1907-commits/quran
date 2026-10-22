const SHELL_CACHE = 'noor-quran-shell-v1';
const DATA_CACHE = 'noor-quran-data-v1';
const SHELL_URLS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_URLS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![SHELL_CACHE, DATA_CACHE].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cache API responses (Quran text/tafsir/surah/page/search metadata) after they load online.
  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'api.aladhan.com') {
    event.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      try {
        const response = await fetch(req);
        if (response && response.ok) await cache.put(req, response.clone());
        return response;
      } catch (err) {
        const saved = await cache.match(req);
        if (saved) return saved;
        return new Response(JSON.stringify({ code: 503, status: 'OFFLINE', message: 'هذا المحتوى لم يُحفظ على الجهاز من قبل. اتصل بالإنترنت وافتحه مرة واحدة.' }), {
          status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // App shell and fonts: network first, use saved copy when offline.
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    try {
      const response = await fetch(req);
      if (response && response.ok && (url.origin === self.location.origin || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com'))) {
        await cache.put(req, response.clone());
      }
      return response;
    } catch (err) {
      const saved = await cache.match(req) || await cache.match('./index.html') || await cache.match('./');
      if (saved) return saved;
      return new Response('أنت دون اتصال بالإنترنت. افتح الموقع مرة أثناء الاتصال ليتم حفظه.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
});
