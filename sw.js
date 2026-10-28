const C='noor-v2';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  const rq=e.request;if(rq.method!=='GET')return;
  const u=new URL(rq.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(rq).then(r=>r||fetch(rq).then(x=>{const y=x.clone();caches.open(C).then(c=>c.put(rq,y));return x})));return;
  }
  if(u.origin!==location.origin)return;
  if(rq.headers.has('range')||/\.(mp3|m4a|wav|ogg)$/i.test(u.pathname)){
    e.respondWith(caches.match(rq,{ignoreSearch:true}).then(r=>r||fetch(rq)));return;
  }
  e.respondWith(fetch(rq).then(r=>{if(r.ok){const x=r.clone();caches.open(C).then(c=>c.put(rq,x))}return r}).catch(()=>caches.match(rq).then(r=>r||caches.match('index.html'))));
});