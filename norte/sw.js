const CACHE = 'norte-v72';
self.addEventListener('install', e => { });
self.addEventListener('message', e => { if(e.data==='SKIP_WAITING'||(e.data&&e.data.type==='SKIP_WAITING')) self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil((async () => {
  const ks = await caches.keys();
  /* so as versoes velhas DESTE app: os outros apps moram na mesma origem,
     e apagar o cache deles deixaria cada um sem funcionar offline */
  const BASE = CACHE.replace(/-v\d+$/, '') + '-v';
  await Promise.all(ks.filter(k => k !== CACHE && k.indexOf(BASE) === 0).map(k => caches.delete(k)));
  await self.clients.claim();
})()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const meu = e.request.url.indexOf(self.location.origin)===0;
      const net = await (meu ? fetch(e.request.url,{cache:'no-cache'}) : fetch(e.request));
      const c = await caches.open(CACHE);
      c.put(e.request, net.clone());
      return net;
    } catch (err) {
      const cached = await caches.match(e.request);
      return cached || Response.error();
    }
  })());
});
