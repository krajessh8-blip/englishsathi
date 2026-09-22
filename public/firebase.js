import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZ2NCwRR1qBv_xeFSoFwxiJWWa_Gh2BYU",
  authDomain: "samart-english-sathi.firebaseapp.com",
  projectId: "samart-english-sathi",
  storageBucket: "samart-english-sathi.firebasestorage.app",
  messagingSenderId: "1044719140242",
  appId: "1:1044719140242:web:101127d5a7834fbc94554b",
  measurementId: "G-YFDBBSSBTJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
