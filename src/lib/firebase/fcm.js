import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

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
      await setDoc(doc(db, "fcmTokens", "admin"), {
        token,
        updatedAt: serverTimestamp(),
      });
    }
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// Returns a cleanup function. Messaging SDK is loaded lazily so it doesn't
// block the page or inflate the initial bundle.
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
