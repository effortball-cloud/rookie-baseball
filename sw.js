/* ROOKIE service worker — 캐시 우선(즉시 열림) + 백그라운드 갱신 */
const VERSION = 'a04c9ea65fbd';
const CACHE   = 'rookie-' + VERSION;
const ASSETS  = ['./', './index.html', './manifest.webmanifest', './preview.png',
                 './icon-192.png', './icon-512.png', './icon-maskable-512.png',
                 './apple-touch-icon.png', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 페이지가 "지금 새 버전으로" 라고 알려주면 대기 상태를 건너뛴다 */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== location.origin) return;          /* 외부 요청은 건드리지 않는다 */

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;                               /* 캐시가 있으면 즉시, 없으면 네트워크 */
    })
  );
});
