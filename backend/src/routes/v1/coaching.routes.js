/**
 * 코칭 API 라우터
 */

import express from 'express';
import { coachingRateLimit } from '../../middleware/rateLimit.middleware.js';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { validateBody, coachingSchema } from '../../middleware/validation.middleware.js';
import { createCoaching } from '../../controllers/coaching.controller.js';

const router = express.Router();

// 코칭 응답 생성
router.post(
  '/',
  optionalAuthenticate,
  coachingRateLimit,
  validateBody(coachingSchema),
  createCoaching
);

export default router;
