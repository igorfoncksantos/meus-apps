/* Operador do Ninho.
   ⚠️ fetch com cache:'no-cache' na mesma origem: o GitHub Pages manda
   max-age=600, e sem isso o arquivo novo pode demorar 10 min pra chegar
   mesmo depois do operador trocar. (lição de 26/08) */
var CACHE = "ninho-v1";
var ARQS = ["./", "./index.html", "./manifest.json", "./icone-192.png", "./icone-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQS); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("message", function(e){
  if(e.data === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", function(e){
  var u = new URL(e.request.url);
  if(u.origin !== location.origin) return;          /* Open Library vai direto */
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache" })
      .then(function(r){
        var copia = r.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        return r;
      })
      .catch(function(){ return caches.match(e.request); })
  );
});
