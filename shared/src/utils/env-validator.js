/**
 * 환경 변수 검증 유틸리티
 */

import { AppError, ErrorCodes } from './errors.js';

/**
 * 환경 변수 스키마 정의
 */
export const EnvSchema = {
  // Backend 필수 환경 변수
  BACKEND: {
    PORT: { required: false, default: '3001', type: 'number' },
    NODE_ENV: { required: false, default: 'development', type: 'string' },
    CORS_ORIGIN: { required: false, default: 'http://localhost:3000', type: 'string' },
    FIREBASE_PROJECT_ID: { required: true, type: 'string' },
    FIREBASE_PRIVATE_KEY: { required: true, type: 'string' },
    FIREBASE_CLIENT_EMAIL: { required: true, type: 'string' },
    AI_PROVIDER: { required: false, default: 'openai', type: 'string', enum: ['openai', 'gemini'] },
    OPENAI_API_KEY: { required: false, type: 'string', condition: (env) => env.AI_PROVIDER === 'openai' },
    GEMINI_API_KEY: { required: false, type: 'string', condition: (env) => env.AI_PROVIDER === 'gemini' },
  },
  // Frontend 필수 환경 변수
  FRONTEND: {
    VITE_API_BASE_URL: { required: true, type: 'string' },
    VITE_FIREBASE_API_KEY: { required: true, type: 'string' },
    VITE_FIREBASE_AUTH_DOMAIN: { required: true, type: 'string' },
    VITE_FIREBASE_PROJECT_ID: { required: true, type: 'string' },
  },
};

/**
 * 환경 변수 검증
 */
export function validateEnv(schema, env = process.env) {
  const errors = [];
  const validated = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = env[key];

    // 필수 체크
    if (config.required && !value) {
      errors.push(`환경 변수 ${key}가 필요합니다.`);
      continue;
    }

    // 조건부 필수 체크
    if (config.condition && !config.condition(env) && !value) {
      // 조건이 만족되지 않으면 필수가 아님
    } else if (config.condition && config.condition(env) && !value) {
      errors.push(`환경 변수 ${key}가 필요합니다 (조건부 필수).`);
      continue;
    }

    // 기본값 설정
    if (!value && config.default !== undefined) {
      validated[key] = config.default;
      continue;
    }

    // 타입 검증
    if (value) {
      if (config.type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`환경 변수 ${key}는 숫자여야 합니다.`);
          continue;
        }
        validated[key] = numValue;
      } else if (config.type === 'boolean') {
        validated[key] = value === 'true' || value === '1';
      } else if (config.enum && !config.enum.includes(value)) {
        errors.push(`환경 변수 ${key}는 다음 중 하나여야 합니다: ${config.enum.join(', ')}`);
        continue;
      } else {
        validated[key] = value;
      }
    }
  }

  if (errors.length > 0) {
    throw new AppError(
      `환경 변수 검증 실패:\n${errors.join('\n')}`,
      500,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  return validated;
}

/**
 * Backend 환경 변수 검증
 */
export function validateBackendEnv() {
  return validateEnv(EnvSchema.BACKEND);
}

/**
 * Frontend 환경 변수 검증
 */
export function validateFrontendEnv() {
  return validateEnv(EnvSchema.FRONTEND);
}
