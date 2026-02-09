import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWg1C1IuGGBozSPdZyMcN0NY_cQyrFxdI",
  authDomain: "github-clone-1aee4.firebaseapp.com",
  projectId: "github-clone-1aee4",
  storageBucket: "github-clone-1aee4.firebasestorage.app",
  messagingSenderId: "653884514390",
  appId: "1:653884514390:web:e5012d151a881dda5a1bf7",
  measurementId: "G-VNM4330JMB",
}

const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
