import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyRUEJc2MGT7Vd4JAY3EnjgzXQXHWly",
  authDomain: "racha-furniture.firebaseapp.com",
  projectId: "racha-furniture",
  storageBucket: "racha-furniture.firebasestorage.app",
  messagingSenderId: "686293999389",
  appId: "1:686293999389:web:be96316d27b4c5497a4bf4",
  measurementId: "G-MH04P9PH"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
