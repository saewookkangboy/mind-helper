/**
 * 공유 유틸리티 함수
 */

/**
 * 환경 변수 검증
 */
export function validateEnv(requiredVars) {
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 딜레이 함수
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 재시도 로직
 */
export async function retry(fn, maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * (i + 1));
    }
  }
}

/**
 * 키워드 정제
 */
export function cleanKeyword(keyword) {
  return keyword
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '')
    .trim();
}

// 로거 및 환경 변수 검증 export
export * from './logger.js';
export * from './env-validator.js';
