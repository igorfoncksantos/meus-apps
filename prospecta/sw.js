/* Rede primeiro: o app e um arquivo so, e vale mais chegar atualizado do que
   chegar rapido. O cache serve pra quando nao houver rede. */
var CACHE = 'meusapps-prospecta-v2';
var ARQ = ['./', './index.html', './manifest.json', './klix.png', './icone-192.png', './icone-512.png', './sync.js', './supabase.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQ).catch(function () {}); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var mesmaOrigem = e.request.url.indexOf(self.location.origin) === 0;
  e.respondWith(
    /* no-cache pra revalidar por ETag: sem isso o GitHub Pages pode servir o
       arquivo velho por ate 10 min DEPOIS de o operador novo assumir */
    fetch(mesmaOrigem ? new Request(e.request.url, { cache: 'no-cache' }) : e.request)
      .then(function (r) {
        if (r && r.ok && mesmaOrigem) { var c = r.clone(); caches.open(CACHE).then(function (k) { k.put(e.request, c); }); }
        return r;
      })
      .catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); }); })
  );
});
