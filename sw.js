const CACHE_NAME = 'kitab-tracker-v5';

const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install — সব ফাইল cache করো
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — পুরনো cache মুছে দাও
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

// Cache first — আগে cache থেকে দাও (offline কাজ করবে)
// background এ network থেকে update করো
self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request).then(function(cached){
      // background এ network থেকে update
      var networkFetch = fetch(event.request).then(function(networkResponse){
        if(networkResponse && networkResponse.status === 200){
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(function(){ return null; });

      // cache থাকলে সাথে সাথে দাও, না থাকলে network এর জন্য অপেক্ষা করো
      return cached || networkFetch;
    })
  );
});

// Notification click
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});
