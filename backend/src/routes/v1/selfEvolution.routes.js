/**
 * 자가 발전 API 라우터
 */

import express from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { runSelfEvolution } from '../../controllers/selfEvolution.controller.js';

const router = express.Router();

// 자가 발전 알고리즘 수동 실행 (관리자만)
router.post(
  '/run',
  authenticate,
  requireAdmin,
  runSelfEvolution
);

export default router;
