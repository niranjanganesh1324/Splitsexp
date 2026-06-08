import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBby9D05Al0l4s5rB8BoqC8YcAYptOvRpM",
    authDomain: "splitsexp.firebaseapp.com",
    projectId: "splitsexp",
    storageBucket: "splitsexp.firebasestorage.app",
    messagingSenderId: "724795080358",
    appId: "1:724795080358:web:075982c73f02e1e04d3e67",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;