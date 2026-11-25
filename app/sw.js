// Bourbon Radar background helper ("service worker").
// It only shows notifications and opens the app when one is tapped.
// It does NOT store the app offline, so you always get the newest version.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {
    d = { title: 'Bourbon Radar', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(d.title || '🥃 Bourbon Radar', {
      body: d.body || 'New bourbon alert',
      icon: 'apple-touch-icon.png',
      badge: 'notification-icon.png',
      tag: d.tag || undefined,
      data: d.data || {},
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const id = data.alertId || (Array.isArray(data.alertIds) ? data.alertIds[0] : '');
  const target = new URL(self.registration.scope);
  if (id) target.searchParams.set('alert', id);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (client.url.startsWith(self.registration.scope)) {
          if (id) client.postMessage({ type: 'open-alert', id });
          return client.focus();
        }
      }
      return self.clients.openWindow(target.href);
    })(),
  );
});
