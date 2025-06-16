import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAxIJaceNu4-D-604gteRDgnbJn4iuq1lY",
    authDomain: "basketball-scorekeeper-e4039.firebaseapp.com",
    projectId: "basketball-scorekeeper-e4039",
    storageBucket: "basketball-scorekeeper-e4039.firebasestorage.app",
    messagingSenderId: "114829273033",
    appId: "1:114829273033:web:a7797f88585557ccfe2a18",
    measurementId: "G-7GXYETN55Q"
  };
  
// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore
export const db = getFirestore(app);

export default app; 