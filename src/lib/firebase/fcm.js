import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingInstance = null;

function getMessagingInstance() {
  if (!messagingInstance) {
    messagingInstance = getMessaging();
  }
  return messagingInstance;
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
    const messaging = getMessagingInstance();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      // Save to Firestore so facetvaultbot can read it and send notifications
      await setDoc(doc(db, "fcmTokens", "admin"), {
        token,
        updatedAt: serverTimestamp(),
      });
      console.log("🔔 FCM token registered");
    }

    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// Handle foreground notifications (app is open)
export function onForegroundMessage(callback) {
  if (!VAPID_KEY) return () => {};
  try {
    const messaging = getMessagingInstance();
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
