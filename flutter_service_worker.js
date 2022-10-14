'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "c9a694ea7c959a49ae7534a600e6ca87",
"assets/assets/AssetManifest.json": "8c7364654b35657a008c751c93bcd920",
"assets/assets/assets/banner.png": "26545e7a5cb7013a221628f97fde0aef",
"assets/assets/assets/banner_dark.png": "06be7bacbf88f09f7258022625c71561",
"assets/assets/assets/img.png": "9f55cdc7437ac981a1a4cee1eba4b7d8",
"assets/assets/assets/img1.png": "fd66a68e9f399f108ee28bfda4cc4f10",
"assets/assets/assets/no_search_found.png": "a97a430662a2a9ad33d811dc48f4b38d",
"assets/assets/assets/user.data.json": "61f029d1933cb1b4d0b7ffe8319306ab",
"assets/assets/assets/user.png": "c196818de30eefe26e300c488c8e1b5b",
"assets/assets/banner.png": "26545e7a5cb7013a221628f97fde0aef",
"assets/assets/banner_dark.png": "06be7bacbf88f09f7258022625c71561",
"assets/assets/FontManifest.json": "1a6184c6ca656e8be25d25329c87e502",
"assets/assets/img.png": "9f55cdc7437ac981a1a4cee1eba4b7d8",
"assets/assets/img1.png": "fd66a68e9f399f108ee28bfda4cc4f10",
"assets/assets/NOTICES": "babcfe66f47aa1ffa019455a2dd367e2",
"assets/assets/no_search_found.png": "a97a430662a2a9ad33d811dc48f4b38d",
"assets/assets/user.data.json": "6614882f41888e6f49b2abae5c97d7b8",
"assets/assets/user.png": "c196818de30eefe26e300c488c8e1b5b",
"assets/FontManifest.json": "1a6184c6ca656e8be25d25329c87e502",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "c0e9b6b5b3c7389d613e64302494aa43",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/feather_icons/fonts/feather.ttf": "ad5435302c3c2d1f23f275d0f22d36c6",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.ico": "8777418425cd65343aa6ebf5545cdc4f",
"favicon.png": "0a2dc9cc1c2d63030eed2eddb80f7cef",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"icons/Black,%20White%20and%20Pink%20Cube%20Kyobi%20Games%20Logo.png": "1f5c222dd4d64d9a11e83fcb200108a1",
"icons/Icon-192.png": "edb2c93276f99e5df730fa3f94979573",
"icons/Icon-512.png": "efa2952e2e263193abcc03fb67bf0018",
"index.html": "6e3b865ef09af330c056c184d5bd2a80",
"/": "6e3b865ef09af330c056c184d5bd2a80",
"main.dart.js": "9bba86ae2c88ebd50488b1cc9bff2319",
"manifest.json": "95c1cb9f2ef085444795120f5301dd50",
"version.json": "665f16812bb4f0243d19813802a00c05"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
