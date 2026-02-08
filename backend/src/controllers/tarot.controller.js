/**
 * 타로 API 컨트롤러 (krates98/tarotcardapi 기반 카드 상세 조회)
 */

import { getCardById } from '../services/tarot.service.js';
import { logger } from '../../../shared/src/utils/logger.js';

/**
 * GET /api/v1/tarot/cards/:id — 카드 상세 (이미지 URL·해석) 조회
 */
export async function getCard(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Card id is required.' },
      });
    }
    const card = await getCardById(id);
    if (!card) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tarot card not found.' },
      });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    logger.error('타로 카드 조회 실패', { error: error.message });
    next(error);
  }
}
