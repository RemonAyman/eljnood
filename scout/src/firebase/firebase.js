import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Web app's Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyDPG27SjNNYyxnMr8q1UdpeA4M-26hRXRw",
  authDomain: "eljnood.firebaseapp.com",
  projectId: "eljnood",
  storageBucket: "eljnood.firebasestorage.app",
  messagingSenderId: "365768489083",
  appId: "1:365768489083:web:596a8afb7bcbfef9b58ade",
  measurementId: "G-JXTQSCW7WL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics if supported in browser environment
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
