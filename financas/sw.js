/* Service worker — deixa o app abrir offline. */
var CACHE = "financas-v1";
var ARQS = ["./", "./index.html", "./manifest.json", "./icone-192.png", "./icone-512.png"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQS).catch(function(){}); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(resp){
        var copia = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia).catch(function(){}); });
        return resp;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
