importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCQ54DpeGwyRPzP3q7t4MFyfU66_533yrQ",
  authDomain: "www.facetvault.store",
  projectId: "gfacetvault",
  storageBucket: "gfacetvault.firebasestorage.app",
  messagingSenderId: "617653283556",
  appId: "1:617653283556:web:9a571f7a168b00c9ad9af1",
});

const messaging = firebase.messaging();

// Handle background push notifications.
// Messages are sent data-only (no `notification` field) so Chrome doesn't
// auto-display a duplicate — all rendering is handled here.
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || payload.notification?.title || "FacetVault";
  const body = payload.data?.body || payload.notification?.body || "New draft ready for review";
  const url = payload.data?.url || "/admin/drafts";

  self.registration.showNotification(title, {
    body,
    icon: "/logo.png",
    badge: "/logo.png",
    tag: "facetvault-draft",
    renotify: true,
    data: { url },
    requireInteraction: true,
    actions: [{ action: "open", title: "Review Draft" }],
  });
});

// Tap notification → navigate to drafts screen
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/drafts";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
