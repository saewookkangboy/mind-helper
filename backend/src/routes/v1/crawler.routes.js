/**
 * 크롤러 API 라우터
 */

import express from 'express';
import { crawlerRateLimit } from '../../middleware/rateLimit.middleware.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { runCrawler } from '../../controllers/crawler.controller.js';

const router = express.Router();

// 크롤러 수동 실행 (관리자만)
router.post(
  '/run',
  authenticate,
  requireAdmin,
  crawlerRateLimit,
  runCrawler
);

export default router;
