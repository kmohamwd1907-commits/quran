onst C='noor-v2';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.headers.has('range')||e.request.destination==='audio'||/\.(mp3|m4a|wav|ogg)$/i.test(new URL(e.request.url).pathname))return;
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(C).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
