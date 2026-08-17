var C = 'meusapps-afazeres-v1';
var A = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', function(e){ self.skipWaiting(); e.waitUntil(caches.open(C).then(function(c){ return c.addAll(A); }).catch(function(){})); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(resp){
        var cp = resp.clone(); caches.open(C).then(function(c){ try{ c.put(e.request, cp); }catch(x){} }); return resp;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});