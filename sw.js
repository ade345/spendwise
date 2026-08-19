const CACHE_NAME="spendwise-cloud-v9";
const APP_FILES=["./","./index.html?v=9","./style.css?v=9","./script.js?v=9","./auth.js?v=9","./config.js?v=9","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_FILES)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",event=>{event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();if(event.request.method==="GET")caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));});
