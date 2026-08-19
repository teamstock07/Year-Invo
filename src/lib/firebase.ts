import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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

console.log('[Firebase Configuration in use]:', activeConfig);
console.log('  - Project ID:', activeConfig.projectId);
console.log('  - Auth Domain:', activeConfig.authDomain);

const app = !getApps().length ? initializeApp(activeConfig) : getApps()[0];

export const auth = getAuth(app);

// Always use default Firestore database '(default)'
export const db = getFirestore(app);

// Verification logging
console.log('[Firebase App initialized]:', app.name);
console.log('[Firebase Auth Project ID]:', auth.app.options.projectId);
console.log('[Firebase Firestore Database]: (default)');
console.log('[Firebase Verification] Auth and Firestore targeting Project ID:', activeConfig.projectId);

export default app;


