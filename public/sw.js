// public/sw.js — TaskFlow Service Worker

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Handle push events from server (future: web push protocol)
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'taskflow-notification',
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const url = event.notification.data?.url || '/'
      const existing = clients.find((c) => c.url.includes(url) && 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

// Background sync for scheduled notifications (local trigger)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, tag, delay } = event.data
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        tag: tag || 'taskflow',
        actions: [
          { action: 'view', title: 'View Task' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      })
    }, delay)
  } else if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, icon } = event.data
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192x192.png',
      tag: tag || 'taskflow-notification',
      badge: '/icons/badge-72x72.png',
      requireInteraction: false,
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  }
})
