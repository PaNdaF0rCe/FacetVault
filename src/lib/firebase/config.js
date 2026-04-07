import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQ54DpeGwyRPzP3q7t4MFyfU66_533yrQ",
  authDomain: "www.facetvault.store",
  projectId: "gfacetvault",
  storageBucket: "gfacetvault.firebasestorage.app",
  messagingSenderId: "617653283556",
  appId: "1:617653283556:web:9a571f7a168b00c9ad9af1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
