import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import defaultAppletConfig from '../../firebase-applet-config.json';

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || {};

const activeConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || defaultAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || defaultAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || defaultAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || defaultAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || defaultAppletConfig.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || defaultAppletConfig.measurementId,
};

console.log('[Firebase Configuration currently being used]:', activeConfig);
console.log('[Firebase Config Properties]:');
console.log('  - apiKey:', activeConfig.apiKey);
console.log('  - authDomain:', activeConfig.authDomain);
console.log('  - projectId:', activeConfig.projectId);
console.log('  - appId:', activeConfig.appId);

const app = !getApps().length ? initializeApp(activeConfig) : getApps()[0];

export const auth = getAuth(app);

const databaseId = defaultAppletConfig.firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

console.log('[Firebase App initialized]:', app.name);
console.log('[Firebase Auth Instance initialized]:', auth);
console.log('[Firebase Firestore Instance initialized]:', db);

export default app;


