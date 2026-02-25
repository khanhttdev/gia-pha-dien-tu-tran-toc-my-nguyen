// Service Worker for Push Notifications
// Gia Phả Trần Tộc Mỹ Nguyên

self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
    if (!event.data) return

    let data
    try {
        data = event.data.json()
    } catch {
        data = {
            title: 'Gia Phả Trần Tộc',
            body: event.data.text(),
        }
    }

    const options = {
        body: data.body || '',
        icon: '/globe.svg',
        badge: '/globe.svg',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            ...data.data,
        },
        actions: data.actions || [],
        tag: data.tag || 'default',
        renotify: true,
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'Gia Phả Trần Tộc', options)
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const url = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus()
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url)
            }
        })
    )
})
