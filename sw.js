const CACHE = 'pfa-v1';
const IMG = 'pfa-img-v1';
const FILES = ['./', 'index.html', 'data.json', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE && x !== IMG).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Precios: siempre a la red (la app ya los guarda)
  if (url.hostname.startsWith('api.')) return;
  // Imágenes (sprites y cartas): primero caché
  if (req.destination === 'image') {
    e.respondWith(caches.open(IMG).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
    return;
  }
  // Resto: primero red, caché si no hay conexión
  e.respondWith(fetch(req).then(r => { if (url.origin === location.origin) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => caches.match(req)));
});
