import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Stable per-device ID stored in localStorage so each browser/PWA install
// registers its own token without overwriting others.
function getDeviceId() {
  const key = "fv-device-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return null;
  if (!VAPID_KEY) {
    console.warn("FCM: VITE_FIREBASE_VAPID_KEY not set — push notifications disabled");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      const deviceId = getDeviceId();
      // Store token under tokens.<deviceId> so multiple devices (phone PWA,
      // desktop browser) each keep their own token without overwriting each other.
      await setDoc(
        doc(db, "fcmTokens", "admin"),
        {
          tokens: { [deviceId]: token },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// Silently refresh the token for this device — called on admin page load
// so the mobile PWA always has a fresh token without any user interaction.
export async function silentlyRefreshToken() {
  if (!VAPID_KEY) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return;

    const deviceId = getDeviceId();
    await setDoc(
      doc(db, "fcmTokens", "admin"),
      {
        tokens: { [deviceId]: token },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // background refresh — never throw
  }
}

// Returns a cleanup function. Messaging SDK is loaded lazily.
export function onForegroundMessage(callback) {
  if (!VAPID_KEY) return () => {};

  let unsub = () => {};

  import("firebase/messaging")
    .then(({ getMessaging, onMessage }) => {
      try {
        unsub = onMessage(getMessaging(), callback);
      } catch {
        // messaging not available in this context
      }
    })
    .catch(() => {});

  return () => unsub();
}
