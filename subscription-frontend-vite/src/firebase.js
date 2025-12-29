// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "write your api key here",
  authDomain: "pay-e75a4.firebaseapp.com",
  projectId: "pay-e75a4",
  storageBucket: "pay-e75a4.firebasestorage.app",
  messagingSenderId: "195697969805",
  appId: "1:195697969805:web:a9e06785f2478cfa6870c4",
  measurementId: "G-0W585BE1Q7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
