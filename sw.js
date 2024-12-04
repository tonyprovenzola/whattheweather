// JavaScript Document
var cacheName = 'weather_app_cache';

var cachedFiles = [];

// listen for install
self.addEventListener('install',function(e) {
	// add files to cache
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll(cachedFiles);
		})
		.then(function() {
			return self.skipWaiting();
		}).catch(function(error) {
			console.log(error);
		})
	);
});



// listen for activate
self.addEventListener('activate',function(e) {
	
	//update cache
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if(key !== cacheName) {
					// remove old cache
					caches.delete(key);
				}
			}));
		})
	);
	
});


// listen for fetch
self.addEventListener('fetch',function(e) {
	
	// await caches
	const cachedResponse = caches.match(e.request);
  
 	if (cachedResponse) {
    	return cachedResponse;
  	}

	// await fetch
  	const response = fetch(e.request);

  	if (!response || response.status !== 200 || response.type !== 'basic') {
    	return response;
  	}

  	return response;
	
});

//self.addEventListener('push', function(e) {});