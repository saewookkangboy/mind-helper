/**
 * 파이프라인 API 라우터
 * 6대 도메인(사주, 심리상담, MBTI, 타로, 버크만, 다크 심리학) 기반 측정·결과 API
 */

import express from 'express';
import { coachingRateLimit } from '../../middleware/rateLimit.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody, pipelineSchema } from '../../middleware/validation.middleware.js';
import { executePipeline } from '../../controllers/pipeline.controller.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  coachingRateLimit,
  validateBody(pipelineSchema),
  executePipeline
);

export default router;
