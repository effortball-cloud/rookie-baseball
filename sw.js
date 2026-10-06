/* 옛 주소(/rookie-baseball/)에 설치된 앱의 서비스 워커를 끈다 — 새 주소(/rookieb/)로 보낸다.
   캐시는 지우지 않는다: 같은 도메인이라 새 주소의 캐시와 이름이 같고, 새 주소의 서비스 워커가 옛 버전 캐시를 알아서 정리한다. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(self.registration.unregister().then(function(){
    return self.clients.matchAll({type:'window'});
  }).then(function(cs){
    cs.forEach(function(c){ try{ c.navigate(c.url.replace('/rookie-baseball/','/rookieb/')); }catch(err){} });
  }));
});
