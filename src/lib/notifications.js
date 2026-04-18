import { deleteToken, getToken, onMessage } from "firebase/messaging";
import { ref, remove, set } from "firebase/database";
import { database, firebaseConfig, getClientMessaging } from "./firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

function buildServiceWorkerUrl() {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey || "",
    authDomain: firebaseConfig.authDomain || "",
    projectId: firebaseConfig.projectId || "",
    storageBucket: firebaseConfig.storageBucket || "",
    messagingSenderId: firebaseConfig.messagingSenderId || "",
    appId: firebaseConfig.appId || ""
  });

  return `${import.meta.env.BASE_URL}firebase-messaging-sw.js?${params.toString()}`;
}

async function registerMessagingServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register(buildServiceWorkerUrl(), {
    scope: import.meta.env.BASE_URL
  });
}

function sanitizeTokenKey(token) {
  return String(token || "").replace(/[.#$/\[\]]/g, "_");
}

export async function enableBookingNotifications(userId) {
  if (!userId) {
    throw new Error("Sign in first to enable booking notifications.");
  }

  if (!VAPID_KEY) {
    throw new Error("Missing VAPID key. Add VITE_FIREBASE_VAPID_KEY to your environment.");
  }

  if (Notification.permission === "denied") {
    throw new Error("Browser notifications are blocked for this site.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const messaging = await getClientMessaging();

  if (!messaging) {
    throw new Error("This browser does not support Firebase Messaging.");
  }

  const registration = await registerMessagingServiceWorker();

  if (!registration) {
    throw new Error("Service worker registration failed.");
  }

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error("No notification token was returned.");
  }

  if (database) {
    await set(ref(database, `users/${userId}/notificationTokens/${sanitizeTokenKey(token)}`), {
      token,
      createdAt: new Date().toISOString()
    });
  }

  return token;
}

export async function disableBookingNotifications(userId) {
  const messaging = await getClientMessaging();

  if (!messaging) {
    return;
  }

  const success = await deleteToken(messaging);

  if (success && userId && database) {
    const snapshotRef = ref(database, `users/${userId}/notificationTokens`);
    await remove(snapshotRef);
  }
}

export async function attachForegroundNotifications() {
  const messaging = await getClientMessaging();

  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    if (Notification.permission !== "granted") {
      return;
    }

    const title = payload.notification?.title || "Booking Update";
    const options = {
      body: payload.notification?.body || "Your room has been successfully booked.",
      icon: `${import.meta.env.BASE_URL}academy-seal.png`
    };

    new Notification(title, options);
  });
}
