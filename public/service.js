(function () {
    'use strict';

    parseInt(location.search.slice(1), 10);
    const CACHE = 'v1';

    self.addEventListener('install', (event) => {
        event.waitUntil(caches.open(CACHE).then((cache) => {
            return cache.addAll([
                '/index.html',
                '/global.css',
                '/favicon.png',
                '/font/MajorMonoDisplay-Regular.ttf',
                '/build/bundle.css',
                '/build/main.js',
            ]);
        }));
    });
    self.addEventListener('fetch', (e) => {
        const { request } = e;
        e.respondWith(fetch(request, {
            mode: 'no-cors',
        })
            .then((response) => {
            if (request.method !== 'GET')
                return response;
            const copy = response.clone();
            caches.open(CACHE).then((cache) => {
                cache.put(request, copy);
            });
            return response;
        })
            .catch((e) => {
            return caches.match(request).then((resp) => {
                return resp || caches.match('/index.html');
            });
        }));
    });

}());
//# sourceMappingURL=service.js.map
