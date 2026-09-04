import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyARBH7KYOHriHmRmx45VCiI1QKCc12uN2A",
  authDomain: "traintrack-f83d3.firebaseapp.com",
  projectId: "traintrack-f83d3",
  storageBucket: "traintrack-f83d3.firebasestorage.app",
  messagingSenderId: "796093443043",
  appId: "1:796093443043:web:bd3090c48d305d43004ed6",
  measurementId: "G-FTQ7KJLBHZ"
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

  // apiKey: "AIzaSyABs_GB4LpY-ULdjE5ksMe2a-yXYt_dOO0",
  // authDomain: "the-train-track.firebaseapp.com",
  // projectId: "the-train-track",
  // storageBucket: "the-train-track.firebasestorage.app",
  // messagingSenderId: "1002628867612",
  // appId: "1:1002628867612:web:2b72381d59d2285a6c61d9",
  // measurementId: "G-LNEGEWTLW9",