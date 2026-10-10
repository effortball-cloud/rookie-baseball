/* 옛 주소(/rookie-baseball/)에 설치된 앱의 서비스 워커를 끄고 화면을 다시 불러 rookieb.com 으로 보낸다 (index.html 이 기록을 담아 이동) */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(self.registration.unregister().then(function(){ return self.clients.matchAll({type:'window'}); })
    .then(function(cs){ cs.forEach(function(c){ try{ c.navigate(c.url); }catch(err){} }); }));
});
