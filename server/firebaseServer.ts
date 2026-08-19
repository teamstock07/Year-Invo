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

// Load configuration directly from firebase-applet-config.json
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    firebaseConfig = JSON.parse(raw);
  }
} catch (e) {
  console.warn('[Server Firebase] Could not load firebase-applet-config.json:', e);
}

// Fallback to environment variables if config was not fully populated
firebaseConfig = {
  apiKey: firebaseConfig.apiKey || process.env.VITE_FIREBASE_API_KEY,
  authDomain: firebaseConfig.authDomain || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseConfig.projectId || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseConfig.storageBucket || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseConfig.messagingSenderId || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseConfig.appId || process.env.VITE_FIREBASE_APP_ID,
};

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
