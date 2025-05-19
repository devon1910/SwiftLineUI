
import { precacheAndRoute } from 'workbox-precaching';

// This line is required for injectManifest
precacheAndRoute(self.__WB_MANIFEST);

// Service Worker for PWA message handling
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    // Handle different types of messages
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'PING':
        // Respond to ping messages
        event.source.postMessage({
          type: 'PONG',
          timestamp: Date.now()
        });
        break;
      default:
        console.log('Received message:', event.data);
        // Echo back the message to confirm receipt
        event.source.postMessage({
          type: 'MESSAGE_RECEIVED',
          originalMessage: event.data
        });
    }
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {

  console.log('[SW] Push event received:', event); // 🔥

  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(
        self.registration.showNotification(data.title || 'New Notification', {
          body: data.body || '',
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          data: data
        })
      );
    } catch (error) {
      console.error('Error handling push notification:', error);
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/myQueue');
    })
  );
}); 