import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration - use environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyCZIMojkpE7OXQep2Kst3g6uL8hIF8A88M",
  authDomain: "wisma1.firebaseapp.com",
  projectId: "wisma1",
  storageBucket: "wisma1.appspot.com",
  messagingSenderId: "53017535114",
  appId: "1:53017535114:web:fd27a85d054f870ffac373",
  measurementId: "G-0186XESSE4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// If in development, connect to emulators
if (process.env.NODE_ENV === 'development') {
  // Uncomment these if you're using Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, db, auth, functions };