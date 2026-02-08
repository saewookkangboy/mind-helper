// Firebase는 선택 사항. 없으면 로그인·Firestore 없이 코칭만 이용 가능
const FIREBASE_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingFirebase = FIREBASE_ENV_KEYS.filter((key) => !import.meta.env[key]);
if (missingFirebase.length === FIREBASE_ENV_KEYS.length && import.meta.env.DEV) {
  console.info('[env] Firebase 미설정 — 코칭은 이용 가능합니다. 로그인·Firestore는 frontend/.env에 Firebase 값을 넣으면 사용할 수 있습니다.');
}

export const frontendEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};
