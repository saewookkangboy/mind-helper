/**
 * 공유 상수 정의
 */

export { DOMAIN_IDS, DOMAIN_SOURCES, ALL_DOMAIN_IDS } from './domains.js';
export const API_ENDPOINTS = {
  // V1 API
  V1: {
    COACHING: '/api/v1/coaching',
    PIPELINE: '/api/v1/pipeline',
    FEEDBACK: '/api/v1/feedback',
    TRENDS: '/api/v1/trends',
    CRAWLER: '/api/v1/crawler',
    SELF_EVOLUTION: '/api/v1/self-evolution',
    ADMIN: {
      DASHBOARD: '/api/v1/admin/dashboard',
      USERS: '/api/v1/admin/users',
      TRENDS: '/api/v1/admin/trends',
    },
  },
  // Health check
  HEALTH: '/health',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500,
};

export const RATE_LIMITS = {
  COACHING: {
    windowMs: 15 * 60 * 1000, // 15분
    max: 20, // 최대 20회
  },
  CRAWLER: {
    windowMs: 60 * 60 * 1000, // 1시간
    max: 5, // 최대 5회
  },
  FEEDBACK: {
    windowMs: 60 * 1000, // 1분
    max: 10, // 최대 10회
  },
};

export const CACHE_TTL = {
  TRENDS: 60 * 60 * 1000, // 1시간
  USER_DATA: 5 * 60 * 1000, // 5분
};
