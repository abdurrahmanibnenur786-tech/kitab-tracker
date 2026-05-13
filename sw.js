const CACHE_NAME = 'kitab-tracker-v3';

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(['./', './index.html']);
    })
  );
  self.skipWaiting();
});

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

// Network first — আগে নেটওয়ার্ক থেকে আনো, না পেলে cache
self.addEventListener('fetch', function(event){
  event.respondWith(
    fetch(event.request).then(function(networkResponse){
      var clone = networkResponse.clone();
      caches.open(CACHE_NAME).then(function(cache){
        cache.put(event.request, clone);
      });
      return networkResponse;
    }).catch(function(){
      return caches.match(event.request).then(function(cached){
        return cached || caches.match('./index.html');
      });
    })
  );
});          caches.open(CACHE_NAME).then(function(cache){
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
