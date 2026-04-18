import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredKeys = ["apiKey", "authDomain", "databaseURL", "projectId", "appId"];
const isFirebaseConfigured = requiredKeys.every((key) => Boolean(firebaseConfig[key]));

let app = null;
let auth = null;
let database = null;
let messaging = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
}

function getSecondaryAuth(appName = "admin-user-creator") {
  if (!isFirebaseConfigured) {
    return null;
  }

  const existingApp = getApps().find((item) => item.name === appName);
  const secondaryApp = existingApp || initializeApp(firebaseConfig, appName);
  return getAuth(secondaryApp);
}

async function getClientMessaging() {
  if (!isFirebaseConfigured || !app) {
    return null;
  }

  if (messaging) {
    return messaging;
  }

  const supported = await isMessagingSupported();

  if (!supported) {
    return null;
  }

  messaging = getMessaging(app);
  return messaging;
}

export { app, auth, database, firebaseConfig, getClientMessaging, getSecondaryAuth, isFirebaseConfigured };
