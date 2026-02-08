/**
 * 환경 변수 설정 및 검증
 */

import dotenv from 'dotenv';
import { validateBackendEnv } from '../../../shared/src/utils/env-validator.js';
import { logger } from '../../../shared/src/utils/logger.js';

dotenv.config();

let validatedEnv = null;

/**
 * 환경 변수 초기화 및 검증
 */
export function initEnv() {
  try {
    // 개발 모드에서는 엄격한 검증을 건너뛰고 경고만 표시
    if (process.env.NODE_ENV === 'production') {
      validatedEnv = validateBackendEnv();
    } else {
      // 개발 모드: 필수 환경 변수가 없어도 경고만 표시
      try {
        validatedEnv = validateBackendEnv();
      } catch (error) {
        logger.warn('환경 변수 검증 실패 (개발 모드에서는 계속 진행)', { error: error.message });
        validatedEnv = env; // 기본값 사용
      }
    }
    
    logger.info('환경 변수 검증 완료');
    return validatedEnv;
  } catch (error) {
    logger.error('환경 변수 검증 실패', { error: error.message });
    throw error;
  }
}

/**
 * 검증된 환경 변수 가져오기
 */
export function getEnv() {
  if (!validatedEnv) {
    validatedEnv = initEnv();
  }
  return validatedEnv;
}

/**
 * 환경 변수 직접 접근 (검증 없이)
 */
export const env = {
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CRAWLER_ENABLED: process.env.CRAWLER_ENABLED === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
};

// 초기화 시 검증 실행 (선택적)
if (process.env.VALIDATE_ENV === 'true') {
  initEnv();
}
