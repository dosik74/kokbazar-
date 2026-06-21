import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";

// Firebase config should be loaded from environment variables
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
