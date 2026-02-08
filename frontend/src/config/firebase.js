// Firebase 설정 파일 — API 키가 유효할 때만 초기화 (invalid-api-key 시 앱이 멈추지 않도록)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { frontendEnv } from './env';

const apiKey = frontendEnv.VITE_FIREBASE_API_KEY;
const isPlaceholder = !apiKey || typeof apiKey !== 'string' || apiKey.trim() === '' ||
  /your-api-key|your_project|example\.com|your-auth-domain|your-storage-bucket/i.test(apiKey) ||
  (frontendEnv.VITE_FIREBASE_PROJECT_ID && /your-project-id/i.test(frontendEnv.VITE_FIREBASE_PROJECT_ID));

let app = null;
let auth = null;
let db = null;

if (!isPlaceholder) {
  try {
    const firebaseApp = initializeApp({
      apiKey: frontendEnv.VITE_FIREBASE_API_KEY,
      authDomain: frontendEnv.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: frontendEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: frontendEnv.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: frontendEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: frontendEnv.VITE_FIREBASE_APP_ID,
    });
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    app = firebaseApp;
  } catch (e) {
    console.warn('[Firebase] 초기화 실패(예: invalid-api-key). 로그인·Firestore 없이 계속합니다.', e?.message || e);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.warn('[Firebase] VITE_FIREBASE_API_KEY가 설정되지 않았거나 플레이스홀더입니다. 코칭은 이용 가능합니다.');
}

export { auth, db };
export default app;
