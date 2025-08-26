// Firebase initialization
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

//   "AIzaSyDHdbZFw8sNvaD2uJuhiGIC-xCRpuN1Bec",
//   "expert-mcqs.firebaseapp.com",
//   "expert-mcqs",
//   "expert-mcqs.firebasestorage.app",
//   "358060959411",
//   "1:358060959411:web:da409b5b15d0b83d4fb2c6",
//   "G-QBLE1V15KG"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
})

export async function setAuthPersistence(remember: boolean) {
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence,
  )
}

