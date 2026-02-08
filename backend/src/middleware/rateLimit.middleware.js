/**
 * Rate Limiting 미들웨어
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../../../shared/src/constants/index.js';

/**
 * 코칭 API Rate Limit
 */
export const coachingRateLimit = rateLimit({
  windowMs: RATE_LIMITS.COACHING.windowMs,
  max: RATE_LIMITS.COACHING.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many coaching requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 크롤러 API Rate Limit
 */
export const crawlerRateLimit = rateLimit({
  windowMs: RATE_LIMITS.CRAWLER.windowMs,
  max: RATE_LIMITS.CRAWLER.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Crawler rate limit exceeded. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 피드백 API Rate Limit
 */
export const feedbackRateLimit = rateLimit({
  windowMs: RATE_LIMITS.FEEDBACK.windowMs,
  max: RATE_LIMITS.FEEDBACK.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many feedback requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
