/* ROOKIE service worker — 캐시 우선(즉시 열림) + 백그라운드 갱신 */
const VERSION = '2e078c321533';
const CACHE   = 'rookie-' + VERSION;
/* 바둑 AI 파일(go/)은 버전과 따로 오래 보관 — 새 버전을 올릴 때마다 4MB를 다시 받지 않게 */
const GO_CACHE = 'rookie-go-v1';
const ASSETS  = ['./', './index.html', './manifest.webmanifest', './preview.png',
                 './icon-192.png', './icon-512.png', './icon-maskable-512.png',
                 './apple-touch-icon.png', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && k.indexOf('rookie-go-') !== 0).map(k => caches.delete(k))))
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

  if (url.pathname.indexOf('/go/') >= 0) {            /* 바둑 AI: 캐시에 있으면 그대로, 없으면 받아서 보관 */
    e.respondWith(caches.open(GO_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200) c.put(req, res.clone()).catch(() => {});
      return res;
    }))));
    return;
  }

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
