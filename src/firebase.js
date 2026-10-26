import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyA3s9kPqd0bGa0WcpcXmD7eGhGjG1TcK0Y",
    authDomain: "quran-app-45f45.firebaseapp.com",
    projectId: "quran-app-45f45",
    storageBucket: "quran-app-45f45.firebasestorage.app",
    messagingSenderId: "387128190959",
    appId: "1:387128190959:web:3ca30bb1f6cd34bf10381a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
