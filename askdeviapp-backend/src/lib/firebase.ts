// Next.js backend - src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Client Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtb5ibhortAYqY0M2noasfim7HbMhXOOg",
  authDomain: "ask-devi.firebaseapp.com",
  databaseURL: "https://ask-devi-default-rtdb.firebaseio.com",
  projectId: "ask-devi",
  storageBucket: "ask-devi.firebasestorage.app",
  messagingSenderId: "1091221496102",
  appId: "1:1091221496102:android:b6c6a1d204fc021d6621e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
