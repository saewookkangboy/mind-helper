/**
 * 피드백 API 라우터
 */

import express from 'express';
import { feedbackRateLimit } from '../../middleware/rateLimit.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody, feedbackSchema } from '../../middleware/validation.middleware.js';
import { createFeedback } from '../../controllers/feedback.controller.js';

const router = express.Router();

// 피드백 생성
router.post(
  '/',
  authenticate,
  feedbackRateLimit,
  validateBody(feedbackSchema),
  createFeedback
);

export default router;
