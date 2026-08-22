var C='meusapps-gastos-v4';
self.addEventListener('install',function(e){ });
self.addEventListener('message',function(e){ if(e.data==='SKIP_WAITING'||(e.data&&e.data.type==='SKIP_WAITING')) self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ if(k!==C) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp){ var cp=resp.clone(); caches.open(C).then(function(c){ try{ c.put(e.request,cp); }catch(x){} }); return resp; })
    .catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match('./index.html'); }); })
  );
});
/* sync-multiplataforma 2026-08-22 */
/* sync keys fix 2026-08-22b */
/* sync soft-reload 2026-08-22c */
