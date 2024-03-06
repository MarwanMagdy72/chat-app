import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3FibwRTcnZNeRPniko_ajzMqj8XZC5mI",
  authDomain: "chat-app-352ea.firebaseapp.com",
  projectId: "chat-app-352ea",
  storageBucket: "chat-app-352ea.appspot.com",
  messagingSenderId: "770741549923",
  appId: "1:770741549923:web:f14b83ee29a3959feab156",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
