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

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const url = payload.data?.url || "/admin/drafts";

  self.registration.showNotification(title || "FacetVault", {
    body: body || "New draft ready for review",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
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
