/**
 * 타로 API 컨트롤러 (krates98/tarotcardapi 기반 카드 상세·이미지 프록시·드로우)
 */

import { getCardById, drawThreeCardSpread } from '../services/tarot.service.js';
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

/**
 * GET /api/v1/tarot/cards/:id/image — 카드 이미지 프록시 (외부 raw URL 차단·CORS 회피)
 */
export async function getCardImage(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).end();
    }
    const card = await getCardById(id);
    if (!card || !card.imageUrl) {
      return res.status(404).end();
    }
    const imageResponse = await fetch(card.imageUrl, { redirect: 'follow' });
    if (!imageResponse.ok) {
      logger.warn('타로 이미지 프록시 업스트림 실패', { id, status: imageResponse.status });
      return res.status(502).json({
        success: false,
        error: { code: 'UPSTREAM_ERROR', message: 'Image could not be loaded.' },
      });
    }
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    logger.error('타로 이미지 프록시 실패', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/v1/tarot/draw — 세 카드 드로우 (결과 페이지 카드 없을 때 폴백용)
 * 쿼리: seed (선택) — 미지정 시 타임스탬프 기반
 * 응답: { success: true, data: { cards: [{ id, name, imageUrl, reversed, meaningShort, position }] } }
 */
export async function drawCards(req, res, next) {
  try {
    const seed = req.query.seed || String(Date.now());
    const result = await drawThreeCardSpread(seed);
    const cards = result?.cards ?? [];
    res.json({ success: true, data: { cards } });
  } catch (error) {
    logger.error('타로 드로우 실패', { error: error.message });
    next(error);
  }
}
