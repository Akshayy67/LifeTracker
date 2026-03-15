const CACHE_NAME = 'life-tracker-v1'
const STATIC_CACHE = 'life-tracker-static-v1'
const DYNAMIC_CACHE = 'life-tracker-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/habits',
  '/journal',
  '/expenses',
  '/reports',
  '/offline',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip Supabase requests (always need fresh data)
  if (request.url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone()
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          // If no cache, return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline')
          }
          
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          })
        })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-habits') {
    event.waitUntil(syncHabits())
  }
})

async function syncHabits() {
  // This will be handled by the app when it comes online
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_HABITS',
    })
  })
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Life Tracker', {
      body: data.body || 'You have a new notification',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      vibrate: [200, 100, 200],
    })
  )
})
