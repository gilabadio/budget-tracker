const FILE_CACHE_NAME = 'budget-file-cache-v1';
const API_CACHE_NAME = 'budget-api-cache-v1';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/idb.js',
    '/js/index.js',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];



self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(FILE_CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});




self.addEventListener('activate', function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== FILE_CACHE_NAME && key !== API_CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});




self.addEventListener('fetch', function (evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches.open(API_CACHE_NAME)
                .then(cache => {
                    return fetch(evt.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            return cache.match(evt.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => caches.match(evt.request))
    );
});