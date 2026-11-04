const C='noor-v3';
const M=(rq,o)=>caches.open(C).then(c=>c.match(rq,o));
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>clients.claim())
));
self.addEventListener('fetch',e=>{
  const rq=e.request;if(rq.method!=='GET')return;
  const u=new URL(rq.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(M(rq).then(r=>r||fetch(rq).then(x=>{const y=x.clone();caches.open(C).then(c=>c.put(rq,y));return x})));return;
  }
  if(u.origin!==location.origin)return;
  if(rq.headers.has('range')||/\.(mp3|m4a|wav|ogg)$/i.test(u.pathname)){
    e.respondWith(M(rq,{ignoreSearch:true}).then(r=>r||fetch(rq)));return;
  }
  e.respondWith(fetch(rq).then(r=>{if(r.ok){const x=r.clone();caches.open(C).then(c=>c.put(rq,x))}return r}).catch(()=>M(rq).then(r=>r||M('index.html'))));
});
