// code adapted from: https://github.com/carmalou/background-sync-example/blob/master/serviceworker.js
var CACHE_NAME = 'lightning-talk-2';
var urlsToCache = [
  './jianyang.jpg',
  './nointernet.png',
  './yousob.jpg',
  './shopee.png',
  './jared.gif',
  './',
  './doggo.jpg',
  './background.png',
  './index.js',
  './dino.png',
  './badinternet.png',
  './apps.png',
  './css/reset.css',
  './css/reveal.css',
  './css/theme/black.css',
  './lib/css/monokai.css',
  './js/reveal.js',
  './plugin/markdown/marked.js',
  './plugin/markdown/markdown.js',
  './plugin/highlight/highlight.js',
  './plugin/notes/notes.js',
  './lib/font/source-sans-pro/source-sans-pro.css',
  './lib/font/source-sans-pro/source-sans-pro-italic.ttf',
  './lib/font/source-sans-pro/source-sans-pro-italic.woff',
  './lib/font/source-sans-pro/source-sans-pro-italic.eot',
  './lib/font/source-sans-pro/source-sans-pro-semibold.ttf',
  './lib/font/source-sans-pro/source-sans-pro-semibold.woff',
  './lib/font/source-sans-pro/source-sans-pro-semibold.eot',
  './lib/font/source-sans-pro/source-sans-pro-regular.ttf',
  './lib/font/source-sans-pro/source-sans-pro-regular.eot',
  './lib/font/source-sans-pro/source-sans-pro-regular.woff',
  './lib/font/source-sans-pro/source-sans-pro-semibolditalic.eot',
  './lib/font/source-sans-pro/source-sans-pro-semibolditalic.woff',
  './lib/font/source-sans-pro/source-sans-pro-semibolditalic.ttf',
  './indexdb-getallshim.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {console.log(error)})
  );
});

self.addEventListener('fetch', function(event) {
  // network-then-cache
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

self.onsync = function(event) {
    if(event.tag == 'example-sync') {
        event.waitUntil(syncIt());
    }
}

// down here are the other functions to go get the indexeddb data and also post to our server

function syncIt() {
    return getIndexedDB()
    .then(sendToServer)
    .catch(function(err) {
        return err;
    })
}

function getIndexedDB() {
    return new Promise(function(resolve, reject) {
        var db = indexedDB.open('newsletterSignup');
        db.onsuccess = function(event) {
            this.result.transaction("newsletterObjStore").objectStore("newsletterObjStore").getAll().onsuccess = function(event) {
                resolve(event.target.result);
            }
        }
        db.onerror = function(err) {
            reject(err);
        }
    });
}

function sendToServer(response) {
    alert("Sending this to the server:", response)
    return fetch('https://www.mocky.io/v2/5c0452da3300005100d01d1f', {
            method: 'POST',
            body: JSON.stringify(response),
            headers:{
              'Content-Type': 'application/json'
            }
    }).then(function(rez2) {
        return rez2.text();
    }).catch(function(err) {
        return err;
    })
}
