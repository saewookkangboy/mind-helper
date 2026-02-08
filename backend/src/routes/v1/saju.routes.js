/**
 * 사주 API 라우터 - 만세력 기반 사주 계산
 */

import express from 'express';
import { calculateSaju } from '../../controllers/saju.controller.js';

const router = express.Router();

// 만세력 사주 계산 (온보딩 등에서 사용, 인증 불필요)
router.post('/', calculateSaju);

export default router;
