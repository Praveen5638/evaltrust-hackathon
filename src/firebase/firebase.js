import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuQqJ-zWRsIIyzF95LWJ1CzTkuHkVauKE",
  authDomain: "hack-64d3e.firebaseapp.com",
  projectId: "hack-64d3e",
  storageBucket: "hack-64d3e.firebasestorage.app",
  messagingSenderId: "725807872041",
  appId: "1:725807872041:web:bd307a9b3da6f4478f0438",
  measurementId: "G-0M94J59Z5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
