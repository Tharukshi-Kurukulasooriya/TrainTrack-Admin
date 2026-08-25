import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABs_GB4LpY-ULdjE5ksMe2a-yXYt_dOO0",
  authDomain: "the-train-track.firebaseapp.com",
  projectId: "the-train-track",
  storageBucket: "the-train-track.firebasestorage.app",
  messagingSenderId: "1002628867612",
  appId: "1:1002628867612:web:2b72381d59d2285a6c61d9",
  measurementId: "G-LNEGEWTLW9",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebase() {
  if (typeof window === "undefined") return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  }
  return { app, db: db!, storage: storage! };
}
