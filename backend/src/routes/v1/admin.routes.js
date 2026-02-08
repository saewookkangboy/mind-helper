/**
 * 관리자 API 라우터
 */

import express from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { getDashboardStats } from '../../controllers/admin.controller.js';

const router = express.Router();

// 모든 관리자 라우트는 인증 및 관리자 권한 필요
router.use(authenticate);
router.use(requireAdmin);

// 대시보드 통계
router.get('/dashboard', getDashboardStats);

export default router;
