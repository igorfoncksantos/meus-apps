var C='meusapps-afazeres-v3';
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ if(k!==C) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp){ var cp=resp.clone(); caches.open(C).then(function(c){ try{ c.put(e.request,cp); }catch(x){} }); return resp; })
    .catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match('./index.html'); }); })
  );
});
