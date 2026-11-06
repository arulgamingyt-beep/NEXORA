import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import fallbackConfig from '../firebase-applet-config.json';

// Support standard Vite environment variables for zero-secret repository hygiene,
// while gracefully falling back to local applet configuration.
const firebaseConfig = {
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  firestoreDatabaseId: import.meta.env?.VITE_FIREBASE_DATABASE_ID || fallbackConfig.firestoreDatabaseId,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId || undefined
);

export default app;
