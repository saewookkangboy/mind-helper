/**
 * Firebase Admin SDK 설정
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin 초기화
if (!admin.apps.length) {
  try {
    // 서비스 계정 키 파일 경로 또는 환경 변수 사용
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // 또는 애플리케이션 기본 자격 증명 사용
      admin.initializeApp();
    }

    console.log('Firebase Admin 초기화 완료');
  } catch (error) {
    console.error('Firebase Admin 초기화 실패:', error);
  }
}

export const db = admin.firestore();
export default admin;
