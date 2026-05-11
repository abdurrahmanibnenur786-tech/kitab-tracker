const CACHE_NAME = 'kitab-tracker-v1';
const urlsToCache = [
  '/kitab-tracker/',
  '/kitab-tracker/index.html'
];

// Install — ক্যাশে সেভ করো
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(urlsToCache);
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

// Fetch — cache থেকে দাও, না থাকলে network থেকে
self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response) return response;
      return fetch(event.request).then(function(networkResponse){
        if(networkResponse && networkResponse.status === 200){
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function(){
        return caches.match('/kitab-tracker/');
      });
    })
  );
});

// Push notification সাপোর্ট
self.addEventListener('push', function(event){
  var data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'কিতাব ট্র্যাকার', {
      body: data.body || 'অ্যালার্মের সময় হয়েছে!',
      icon: '/kitab-tracker/icon-192.png',
      badge: '/kitab-tracker/icon-192.png',
      vibrate: [200, 100, 200],
      data: data
    })
  );
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/kitab-tracker/')
  );
});
