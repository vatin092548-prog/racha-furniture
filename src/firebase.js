import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyRUEJc2MGTV7d4zJAY3EnjgzYQXQHWyg",
  authDomain: "racha-furniture.firebaseapp.com",
  projectId: "racha-furniture",
  storageBucket: "racha-furniture.firebasestorage.app",
  messagingSenderId: "686293999389",
  appId: "1:686293999389:web:9c1cb3d950bc4465cdb77c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
