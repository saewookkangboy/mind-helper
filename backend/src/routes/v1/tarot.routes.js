/**
 * 타로 API 라우터 (카드 상세·이미지 프록시·드로우 폴백)
 */

import express from 'express';
import { getCard, getCardImage, drawCards } from '../../controllers/tarot.controller.js';

const router = express.Router();

router.get('/cards/:id/image', getCardImage);
router.get('/cards/:id', getCard);
router.get('/draw', drawCards);

export default router;
