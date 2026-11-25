// Çevrimdışı yedek: her zaman önce ağdan en yeni sürüm alınır; ağ yoksa son kaydedilen kopya açılır.
// Dosyalar sürüm etiketinden (?v=) bağımsız, yoluna göre tek kopya saklanır.
const CACHE = 'buyulu-odak';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Firebase, yazı tipleri vb. dokunulmaz
  if (url.searchParams.has('check')) return; // yeni sürüm kontrolü hep ağdan
  const key = url.origin + url.pathname;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(key).then(r => r || Response.error()))
  );
});
