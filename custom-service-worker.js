const CACHE_NAME = "version-1";
const urlsToCache = [
  "index.html",
  "offline.html",
  "./src/app.jsx",
  "./src/App.css",
];

const self = this;
// install SW
// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log("Opened Cache");
//       return cache.addAll(urlsToCache);
//     })
//   );
// });
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened Cache");
      return Promise.all(
        urlsToCache.map((url) => {
          return fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch: ${url}`);
              }
              return cache.put(url, response);
            })
            .catch((error) => {
              console.error(`Caching failed for: ${url}`, error);
            });
        })
      );
    })
  );
});
//Listen for requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(() => {
      return fetch(event.request).catch(() => caches.match("offline.html"));
    })
  );
});
//Activate
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
