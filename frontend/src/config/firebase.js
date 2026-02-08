// Firebase 설정 파일
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { frontendEnv } from './env';
const firebaseConfig = {
  apiKey: frontendEnv.VITE_FIREBASE_API_KEY,
  authDomain: frontendEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: frontendEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: frontendEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: frontendEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: frontendEnv.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 export
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
