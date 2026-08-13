import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let firebaseConfig: any = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Fallback to reading firebase-applet-config.json
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    const jsonConfig = JSON.parse(raw);
    firebaseConfig = {
      ...jsonConfig,
      apiKey: firebaseConfig.apiKey || jsonConfig.apiKey,
      authDomain: firebaseConfig.authDomain || jsonConfig.authDomain,
      projectId: firebaseConfig.projectId || jsonConfig.projectId,
      storageBucket: firebaseConfig.storageBucket || jsonConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId || jsonConfig.messagingSenderId,
      appId: firebaseConfig.appId || jsonConfig.appId,
    };
  }
} catch (e) {
  console.warn('[Server Firebase] Could not load firebase-applet-config.json:', e);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const serverDb = getFirestore(app);

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
};
