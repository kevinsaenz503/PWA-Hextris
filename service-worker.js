const CACHE_NAME = "hextris-v1";

const urlsToCache = [
    "/",
    "/css/style.css",
    "/js/game.js",
    "/manifest.webmanifest"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(
                    urlsToCache
                );

            })

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

            .then(response => {

                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .catch(() => {

                        return new Response(
                            "Offline"
                        );

                    });

            })

    );

});