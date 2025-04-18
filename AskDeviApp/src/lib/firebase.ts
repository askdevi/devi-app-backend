// React Native frontend - src/lib/firebase.ts
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// Firebase configuration from your google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyDtb5ibhortAYqY0M2noasfim7HbMhXOOg",
  authDomain: "ask-devi.firebaseapp.com",
  databaseURL: "https://ask-devi-default-rtdb.firebaseio.com",
  projectId: "ask-devi",
  storageBucket: "ask-devi.firebasestorage.app",
  messagingSenderId: "1091221496102",
  appId: "1:1091221496102:android:b6c6a1d204fc021d6621e7"
};

// Initialize Firebase if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase, auth };