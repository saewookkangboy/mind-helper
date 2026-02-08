/**
 * 타로 API 라우터 (RoxyAPI 프록시 — 카드 상세/이미지)
 */

import express from 'express';
import { getCard } from '../../controllers/tarot.controller.js';

const router = express.Router();

router.get('/cards/:id', getCard);

export default router;
