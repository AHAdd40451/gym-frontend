import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAO8yNTSvL27lHwz7cdujhpxUYB2q-jq6I",
  authDomain: "gym-management-notifications.firebaseapp.com",
  projectId: "gym-management-notifications",
  storageBucket: "gym-management-notifications.firebasestorage.app",
  messagingSenderId: "504195953024",
  appId: "1:504195953024:web:35f41470762caff2c99165",
  measurementId: "G-XQN7SM7KCD"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function getFcmToken() {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported || !("Notification" in window)) return null;

  if (Notification.permission === "denied") return null;
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY");
    return null;
  }

  const messaging = getMessaging(app);
  let swReg;

  if ("serviceWorker" in navigator) {
    try {
      swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch (error) {
      console.warn("FCM service worker registration failed", error);
    }
  }

  try {
    const token = await getToken(
      messaging,
      swReg ? { vapidKey, serviceWorkerRegistration: swReg } : { vapidKey }
    );
    return token || null;
  } catch (error) {
    console.warn("FCM token fetch failed", error);
    return null;
  }
}
