import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Real credentials extracted from your google-services.json (Project: eljnood)
const firebaseConfig = {
  apiKey: "AIzaSyA7C2nkInbCsxXvbVlQhMUluvvDJpZSg3Y",
  authDomain: "eljnood.firebaseapp.com",
  projectId: "eljnood",
  storageBucket: "eljnood.firebasestorage.app",
  messagingSenderId: "365768489083",
  appId: "1:365768489083:android:13f712b6d768871fb58ade"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
