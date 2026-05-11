const CACHE_NAME = 'kitab-tracker-v2';

// Install — মূল ফাইল cache করো
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll([
        './',
        './index.html'
      ]);
    }).catch(function(err){ console.log('Cache error:', err); })
  );
  self.skipWaiting();
});

// Activate — পুরনো cache মুছো
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache থেকে দাও
self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response) return response;
      return fetch(event.request).then(function(networkResponse){
        if(networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic'){
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
