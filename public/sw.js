const V = 'noor-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;

  // قائمة القرّاء: من النت أولاً، ولو مفيش نت من النسخة المحفوظة
  if (u.pathname === '/api/reciters') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // باقي الـ API وملفات الصوت الكبيرة: بدون كاش (الصوت بيتخزن من زرار التنزيل في IndexedDB)
  if (u.pathname.startsWith('/api/') || u.pathname.includes('/uploads/audio/')) return;

  // الصفحة والصور والخطوط: من الكاش لو موجود، وإلا من النت وتتحفظ
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)) }
      return r;
    }))
  );
});
